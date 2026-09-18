const { test, expect } = require('@playwright/test')
const profileIds = ['commandant', 'explorateur', 'jet-setter', 'digital-nomad', 'bon-vivant', 'stratege']

async function expectDistribution(page, percentages) {
  await expect(page.getByRole('progressbar')).toHaveCount(6)
  const items = page.locator('.profileDistribution li')
  expect(await items.evaluateAll(nodes => nodes.map(node => node.dataset.profile))).toEqual(profileIds)
  for (let index = 0; index < 6; index++) {
    await expect(items.nth(index).locator('strong')).toHaveText(`${percentages[index]} %`)
    await expect(items.nth(index).getByRole('progressbar')).toHaveAttribute('aria-valuenow', `${percentages[index]}`)
    await expect(items.nth(index).locator('.distributionTrack > span')).toHaveAttribute('style', `width: ${percentages[index]}%;`)
  }
  expect(percentages.reduce((a, b) => a + b, 0)).toBe(100)
  await expect(page.getByText('Votre profil', { exact: true })).toHaveCount(1)
}

async function finishQuiz(page) {
  await page.getByRole('button', { name: /DÉCOLLAGE/ }).click()
  for (let step = 1; step <= 4; step++) {
    await expect(page.getByText(`QUESTION ${step}/4`, { exact: true })).toBeVisible()
    await page.locator('.answers button').first().click()
  }
  await expect(page.locator('.profileStamp')).toBeVisible()
  await expect(page.locator('.destinationStamp')).toBeVisible()
}

test('one insertion per game, loading, exact percentage, animations and restart', async ({ page }) => {
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const rows = []
  let counts = 0
  await page.route('**/rest/v1/quiz_results**', async route => {
    const request = route.request()
    if (request.method() === 'POST') {
      rows.push(request.postDataJSON())
      await new Promise(resolve => setTimeout(resolve, 1600))
      return route.fulfill({ status: 201, body: '' })
    }
    expect(request.method()).toBe('HEAD')
    expect(request.headers().prefer).toContain('count=exact')
    counts++
    const filter = new URL(request.url()).searchParams.get('profile')
    const values = [9 + rows.length, 15, 28, 12, 21, 14]
    const count = filter ? values[profileIds.indexOf(filter.slice(3))] : 99 + rows.length
    return route.fulfill({ status: 200, headers: { 'content-range': `0-${count - 1}/${count}`, 'access-control-expose-headers': 'content-range' }, body: '' })
  })
  await page.goto('/')
  await finishQuiz(page)
  await expect(page.getByRole('status')).toHaveText('Calcul des profils des Boss...')
  await expectDistribution(page, [10, 15, 28, 12, 21, 14])
  await expect(page.locator('.isCurrentProfile')).toHaveAttribute('data-profile', rows[0].profile)
  expect(rows).toHaveLength(1)
  expect(counts).toBe(7)
  expect(Object.keys(rows[0]).sort()).toEqual(['destination', 'profile'])
  await expect(page.locator('.profileStamp')).toHaveClass(/stampIn/)
  await expect(page.locator('.destinationStamp')).toHaveClass(/stampIn/)
  // Interactions and the two stamp-stage re-renders must not submit again.
  await page.locator('.profileStamp').click()
  await page.setViewportSize({ width: 1366, height: 900 })
  expect(rows).toHaveLength(1)
  await page.getByRole('button', { name: /FAIS TESTER/ }).click()
  await finishQuiz(page)
  await expectDistribution(page, [11, 15, 27, 12, 21, 14])
  expect(rows).toHaveLength(2)
  expect(counts).toBe(14)
  expect(errors).toEqual([])
  await page.screenshot({ path: 'test-results/results-with-comparison.png', fullPage: true })
  await page.reload()
  await expect(page.getByRole('button', { name: /DÉCOLLAGE/ })).toBeVisible()
  expect(rows).toHaveLength(2)
})

for (const failure of ['insert', 'counts']) {
  test(`Supabase ${failure} error leaves results, animations and restart working`, async ({ page }) => {
    let inserts = 0
    const diagnostics = []
    page.on('console', message => { if (message.type() === 'error') diagnostics.push(message.text()) })
    await page.route('**/rest/v1/quiz_results**', route => {
      if (route.request().method() === 'POST') {
        inserts++
        if (failure === 'counts') return route.fulfill({ status: 201, body: '' })
      }
      return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Test unavailable' }) })
    })
    await page.goto('/')
    await finishQuiz(page)
    await expect(page.locator('.profileComparison')).toBeEmpty({ timeout: 20000 })
    await expect(page.locator('.profileComparison')).toBeHidden()
    await expect(page.locator('.profileStamp strong')).not.toBeEmpty()
    await expect(page.locator('.destinationStamp strong')).not.toBeEmpty()
    expect(inserts).toBe(1)
    expect(diagnostics.some(message => message.includes('[quiz_results]'))).toBe(true)
    await page.getByRole('button', { name: /FAIS TESTER/ }).click()
    await expect(page.getByRole('button', { name: /DÉCOLLAGE/ })).toBeVisible()
  })
}

test('late statistics from a previous game are ignored after restart', async ({ page }) => {
  let release
  const pending = new Promise(resolve => { release = resolve })
  await page.route('**/rest/v1/quiz_results**', async route => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 201, body: '' })
    await pending
    return route.fulfill({ status: 200, headers: { 'content-range': '0-0/1', 'access-control-expose-headers': 'content-range' }, body: '' })
  })
  await page.goto('/')
  await finishQuiz(page)
  await expect(page.getByRole('status')).toHaveText('Calcul des profils des Boss...')
  await page.getByRole('button', { name: /FAIS TESTER/ }).click()
  release()
  await expect(page.getByRole('button', { name: /DÉCOLLAGE/ })).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
})

test('distribution stays readable and below the stamp across supported passport sizes', async ({ page }) => {
  await page.route('**/rest/v1/quiz_results**', route => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 201, body: '' })
    const filter = new URL(route.request().url()).searchParams.get('profile')
    const count = filter ? [10, 15, 28, 12, 21, 14][profileIds.indexOf(filter.slice(3))] : 100
    return route.fulfill({ status: 200, headers: { 'content-range': `0-0/${count}`, 'access-control-expose-headers': 'content-range' }, body: '' })
  })
  await page.goto('/')
  await finishQuiz(page)
  await expectDistribution(page, [10, 15, 28, 12, 21, 14])
  // Wait for the existing stamp animation to finish before checking geometry.
  await page.waitForTimeout(1600)
  for (const [width, height] of [[1920, 1080], [1366, 900], [1024, 768], [820, 1180]]) {
    await page.setViewportSize({ width, height })
    await page.locator('.resultRight').evaluate(node => { node.scrollTop = 0 })
    const stamp = await page.locator('.destinationStamp').boundingBox()
    const copy = await page.locator('.destinationDetails p').boundingBox()
    expect(copy.y).toBeGreaterThan(stamp.y + stamp.height)
    const panel = await page.locator('.resultRight').boundingBox()
    const button = await page.getByRole('button', { name: /FAIS TESTER/ }).boundingBox()
    expect(button.y + button.height).toBeLessThanOrEqual(panel.y + panel.height + 1)
    expect(await page.locator('.resultRight').evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true)
    for (const id of profileIds) {
      const row = page.locator(`[data-profile="${id}"]`)
      await expect(row).toBeInViewport()
      expect(await row.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
    }
    await expect(page.getByRole('button', { name: /FAIS TESTER/ })).toBeInViewport()
    await page.screenshot({ path: `test-results/distribution-${width}.png`, fullPage: true })
  }
})
