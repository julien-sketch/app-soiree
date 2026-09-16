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
    await expect(page.getByRole('status')).toHaveText(/\d+ % des Boss ont le même profil que vous\./)
    expect(writes).toHaveLength(game)
    const total = await count()
    const same = await count(writes[game - 1].profile)
    expect(total).toBe(baseline + game)
    await expect(page.getByRole('status')).toHaveText(`${Math.round(same / total * 100)} % des Boss ont le même profil que vous.`)
    await expect(page.locator('.destinationStamp')).toHaveClass(/stampIn/)
    await page.locator('.profileStamp').click()
    expect(await count()).toBe(total)
    await page.getByRole('button', { name: /FAIS TESTER/ }).click()
  }
})
