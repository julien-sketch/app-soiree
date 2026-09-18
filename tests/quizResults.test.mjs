import test from 'node:test'
import assert from 'node:assert/strict'
import { profiles } from '../data/profiles.js'
import { calculateDistribution, statisticsProfiles, createQuizSubmission, getProfileId, saveQuizResult } from '../lib/quizResults.js'

const result = { profile: { name: 'LE JET-SETTER' }, destination: { name: 'RIO' } }

function mockClient({ counts = [10, 15, 28, 12, 21, 14], total = counts.reduce((a, b) => a + b, 0), insertError = null, countError = null } = {}) {
  const writes = []
  const reads = []
  let committed = false
  return {
    writes, reads,
    from(table) {
      assert.equal(table, 'quiz_results')
      return {
        async insert(row) {
          writes.push(row)
          await Promise.resolve()
          committed = !insertError
          return { error: insertError }
        },
        select(column, options) {
          assert.ok(committed, 'Counts must follow the committed insert')
          assert.equal(column, 'id')
          assert.deepEqual(options, { count: 'exact', head: true })
          const query = { profile: null }
          reads.push(query)
          return {
            eq(column, value) {
              assert.equal(column, 'profile')
              query.profile = value
              return this
            },
            then(resolve) {
              resolve({ count: query.profile ? counts[statisticsProfiles.findIndex(p => p.id === query.profile)] : total, error: countError })
            },
          }
        },
      }
    },
  }
}

test('all six existing profiles map to stable identifiers, including apostrophe and accent variants', () => {
  assert.deepEqual(profiles.map(p => getProfileId(p.name)), [
    'commandant', 'explorateur', 'jet-setter', 'digital-nomad', 'bon-vivant', 'stratege',
  ])
  assert.equal(getProfileId(" l'explorateur "), 'explorateur')
  assert.equal(getProfileId('le stratège'), 'stratege')
  assert.throws(() => getProfileId('inconnu'))
})

test('writes only anonymous fields before all seven HEAD counts in fixed profile order', async () => {
  const client = mockClient()
  const statistics = await saveQuizResult(client, result)
  assert.equal(statistics.totalResults, 100)
  assert.equal(statistics.currentProfile, 'jet-setter')
  assert.deepEqual(statistics.distribution.map(p => p.percentage), [10, 15, 28, 12, 21, 14])
  assert.deepEqual(statistics.distribution.map(p => p.name), profiles.map(p => p.name))
  assert.deepEqual(client.writes, [{ profile: 'jet-setter', destination: 'RIO' }])
  assert.deepEqual(client.reads, [{ profile: null }, ...statisticsProfiles.map(p => ({ profile: p.id }))])
})

test('the first recorded participant is included: 1 / 1 = 100%', async () => {
  const statistics = await saveQuizResult(mockClient({ counts: [0, 0, 1, 0, 0, 0] }), result)
  assert.deepEqual(statistics.distribution.map(p => p.percentage), [0, 0, 100, 0, 0, 0])
})

test('concurrent calls and subsequent re-renders share a single insert and count pair', async () => {
  const client = mockClient()
  const submit = createQuizSubmission(() => client)
  await Promise.all(Array.from({ length: 12 }, () => submit(result)))
  await submit(result)
  assert.equal(client.writes.length, 1)
  assert.equal(client.reads.length, 7)
  await createQuizSubmission(() => client)(result)
  assert.equal(client.writes.length, 2, 'A new game creates one new row')
})

test('a rejected or ambiguous insert is never retried or counted', async () => {
  const client = mockClient({ insertError: new Error('Network lost or RLS denied') })
  const submit = createQuizSubmission(() => client)
  await assert.rejects(submit(result))
  await assert.rejects(submit(result))
  assert.equal(client.writes.length, 1)
  assert.equal(client.reads.length, 0)
})

test('count failures do not trigger a second insertion', async () => {
  const client = mockClient({ countError: new Error('SELECT unavailable') })
  const submit = createQuizSubmission(() => client)
  await assert.rejects(submit(result))
  await assert.rejects(submit(result))
  assert.equal(client.writes.length, 1)
})

test('missing configuration is handled as a rejected promise', async () => {
  const submit = createQuizSubmission(() => { throw new Error('Missing environment') })
  await assert.rejects(submit(result), /Missing environment/)
})

test('unreadable or inconsistent counts never produce a misleading percentage', async () => {
  for (const counts of [{ total: null }, { total: 0 }, { total: 2 }, { counts: [1, 1, 0, 1, 1, 1] }]) {
    await assert.rejects(saveQuizResult(mockClient(counts), result), /Comptes Supabase/)
  }
})

test('largest remainder guarantees 100%, deterministic ties and zero-count profiles', () => {
  assert.deepEqual(calculateDistribution([1, 1, 1, 1, 1, 1], 6).map(p => p.percentage), [17, 17, 17, 17, 16, 16])
  assert.deepEqual(calculateDistribution([1, 1, 1, 0, 0, 0], 3).map(p => p.percentage), [34, 33, 33, 0, 0, 0])
  for (let n = 1; n <= 100; n++) {
    const counts = [n, n % 3, n % 5, n % 7, n % 11, n % 13]
    const total = counts.reduce((a, b) => a + b, 0)
    const distribution = calculateDistribution(counts, total)
    assert.equal(distribution.reduce((a, p) => a + p.percentage, 0), 100)
    distribution.forEach((p, i) => assert.ok(Math.abs(p.percentage - counts[i] / total * 100) < 1))
  }
})

test('inconsistent counts retry reads only, never insert again', async () => {
  const client = mockClient({ total: 101 })
  await assert.rejects(saveQuizResult(client, result))
  assert.equal(client.writes.length, 1)
  assert.equal(client.reads.length, 14)
})
