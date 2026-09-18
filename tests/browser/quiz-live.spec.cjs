const { test, expect } = require('@playwright/test')
const { createClient } = require('@supabase/supabase-js')

test('two real completed games create two rows and display database counts', async ({ page }) => {
  test.skip(process.env.QUIZ_LIVE_TEST !== '1', 'Opt-in: creates two real participations')
  require('@next/env').loadEnvConfig(process.cwd())
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
  async function count(profile) {
    let query = client.from('quiz_results').select('id', { count: 'exact', head: true })
    if (profile) query = query.eq('profile', profile)
    const response = await query
    expect(response.error).toBeNull()
    return response.count
  }
  const baseline = await count()
  page.on('console', message => {
    if (message.type() === 'error' && message.text().includes('[quiz_results]')) console.error(message.text())
  })
  const writes = []
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().includes('/rest/v1/quiz_results')) {
      writes.push(request.postDataJSON())
    }
  })
  await page.goto('/')
  for (let game = 1; game <= 2; game++) {
    await page.getByRole('button', { name: /DÉCOLLAGE/ }).click()
    for (let step = 1; step <= 4; step++) {
      await expect(page.getByText(`QUESTION ${step}/4`, { exact: true })).toBeVisible()
      await page.locator('.answers button').first().click()
    }
    await expect(page.getByRole('progressbar')).toHaveCount(6, { timeout: 15000 })
    expect(writes).toHaveLength(game)
    const total = await count()
    const ids = ['commandant', 'explorateur', 'jet-setter', 'digital-nomad', 'bon-vivant', 'stratege']
    const counts = await Promise.all(ids.map(id => count(id)))
    expect(total).toBe(baseline + game)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(total)
    const percentages = counts.map(value => Math.floor(value / total * 100))
    const ranked = counts.map((value, index) => ({ index, remainder: value * 100 % total }))
      .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    const remaining = 100 - percentages.reduce((a, b) => a + b, 0)
    for (let i = 0; i < remaining; i++) percentages[ranked[i].index]++
    for (let i = 0; i < ids.length; i++) {
      await expect(page.locator(`[data-profile="${ids[i]}"] strong`)).toHaveText(`${percentages[i]} %`)
      await expect(page.locator(`[data-profile="${ids[i]}"] [role="progressbar"]`)).toHaveAttribute('aria-valuenow', String(percentages[i]))
    }
    await expect(page.locator('.isCurrentProfile')).toHaveAttribute('data-profile', writes[game - 1].profile)
    await expect(page.locator('.destinationStamp')).toHaveClass(/stampIn/)
    await page.locator('.profileStamp').click()
    expect(await count()).toBe(total)
    await page.getByRole('button', { name: /FAIS TESTER/ }).click()
  }
})
