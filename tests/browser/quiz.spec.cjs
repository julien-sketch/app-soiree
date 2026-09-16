const { test, expect } = require('@playwright/test')

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
    const count = filter ? 18 + rows.length : 72 + rows.length
    return route.fulfill({ status: 200, headers: { 'content-range': `0-${count - 1}/${count}`, 'access-control-expose-headers': 'content-range' }, body: '' })
  })
  await page.goto('/')
  await finishQuiz(page)
  await expect(page.getByRole('status')).toHaveText('Comparaison avec les autres Boss...')
  await expect(page.getByRole('status')).toHaveText('26 % des Boss ont le même profil que vous.')
  expect(rows).toHaveLength(1)
  expect(counts).toBe(2)
  expect(Object.keys(rows[0]).sort()).toEqual(['destination', 'profile'])
  await expect(page.locator('.profileStamp')).toHaveClass(/stampIn/)
  await expect(page.locator('.destinationStamp')).toHaveClass(/stampIn/)
  // Interactions and the two stamp-stage re-renders must not submit again.
  await page.locator('.profileStamp').click()
  await page.setViewportSize({ width: 1366, height: 900 })
  expect(rows).toHaveLength(1)
  await page.getByRole('button', { name: /FAIS TESTER/ }).click()
  await finishQuiz(page)
  await expect(page.getByRole('status')).toHaveText('27 % des Boss ont le même profil que vous.')
  expect(rows).toHaveLength(2)
  expect(counts).toBe(4)
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
    await expect(page.getByRole('status')).toBeEmpty({ timeout: 20000 })
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
  await expect(page.getByRole('status')).toHaveText('Comparaison avec les autres Boss...')
  await page.getByRole('button', { name: /FAIS TESTER/ }).click()
  release()
  await expect(page.getByRole('button', { name: /DÉCOLLAGE/ })).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
})
