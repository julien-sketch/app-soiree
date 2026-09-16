import test from 'node:test'
import assert from 'node:assert/strict'
import { profiles } from '../data/profiles.js'
import { createQuizSubmission, getProfileId, saveQuizResult } from '../lib/quizResults.js'

const result = { profile: { name: 'LE JET-SETTER' }, destination: { name: 'RIO' } }

function mockClient({ total = 73, same = 19, insertError = null, countError = null } = {}) {
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
              resolve({ count: query.profile ? same : total, error: countError })
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

test('writes only anonymous result fields and rounds real exact counts: 19 / 73 = 26%', async () => {
  const client = mockClient()
  assert.deepEqual(await saveQuizResult(client, result), { percentage: 26, sameProfile: 19, totalResults: 73 })
  assert.deepEqual(client.writes, [{ profile: 'jet-setter', destination: 'RIO' }])
  assert.deepEqual(client.reads, [{ profile: null }, { profile: 'jet-setter' }])
})

test('the first recorded participant is included: 1 / 1 = 100%', async () => {
  assert.equal((await saveQuizResult(mockClient({ total: 1, same: 1 }), result)).percentage, 100)
})

test('concurrent calls and subsequent re-renders share a single insert and count pair', async () => {
  const client = mockClient()
  const submit = createQuizSubmission(() => client)
  await Promise.all(Array.from({ length: 12 }, () => submit(result)))
  await submit(result)
  assert.equal(client.writes.length, 1)
  assert.equal(client.reads.length, 2)
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
  for (const counts of [{ total: null }, { total: 0, same: 0 }, { total: 2, same: 3 }, { same: 0 }]) {
    await assert.rejects(saveQuizResult(mockClient(counts), result), /Comptes Supabase/)
  }
})
