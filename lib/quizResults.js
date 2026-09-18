import { profiles } from '../data/profiles.js'

const profileIds = {
  'LE COMMANDANT DE BORD': 'commandant',
  'L EXPLORATEUR': 'explorateur',
  'LE JET SETTER': 'jet-setter',
  'LE DIGITAL NOMAD': 'digital-nomad',
  'LE BON VIVANT': 'bon-vivant',
  'LE STRATEGE': 'stratege',
}

export function getProfileId(profileName) {
  const normalized = profileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/[’'\-]/g, ' ').replace(/\s+/g, ' ').trim()
  const id = profileIds[normalized]
  if (!id) throw new Error('Profil de quiz inconnu.')
  return id
}

export const statisticsProfiles = profiles.map(({ name }) => ({ id: getProfileId(name), name }))

// Largest remainder: distribute the remaining points without changing display order.
export function calculateDistribution(counts, total) {
  if (!Number.isSafeInteger(total) || total < 1 || counts.length !== statisticsProfiles.length
    || counts.some(count => !Number.isSafeInteger(count) || count < 0)
    || counts.reduce((sum, count) => sum + count, 0) !== total) {
    throw new Error('Comptes Supabase indisponibles ou incohérents.')
  }
  const distribution = counts.map((count, index) => ({
    ...statisticsProfiles[index], count,
    percentage: Number(BigInt(count) * 100n / BigInt(total)),
  }))
  const ranked = counts.map((count, index) => ({
    index, remainder: BigInt(count) * 100n % BigInt(total),
  })).sort((a, b) => a.remainder === b.remainder
    ? a.index - b.index : a.remainder > b.remainder ? -1 : 1)
  const remaining = 100 - distribution.reduce((sum, item) => sum + item.percentage, 0)
  for (let index = 0; index < remaining; index++) distribution[ranked[index].index].percentage++
  return distribution
}

async function readDistribution(client) {
  // HEAD counts only; never download participant rows. Retry only reads if
  // concurrent submissions make the independently read totals inconsistent.
  for (let attempt = 0; attempt < 2; attempt++) {
    const responses = await Promise.all([
      client.from('quiz_results').select('id', { count: 'exact', head: true }),
      ...statisticsProfiles.map(({ id }) => client.from('quiz_results')
        .select('id', { count: 'exact', head: true }).eq('profile', id)),
    ])
    const error = responses.find(response => response.error)?.error
    if (error) throw error
    const [total, ...counts] = responses.map(response => response.count)
    try {
      return { totalResults: total, distribution: calculateDistribution(counts, total) }
    } catch (error) {
      if (attempt === 1) throw error
    }
  }
}

export async function saveQuizResult(client, result) {
  const profile = getProfileId(result.profile.name)
  const { error: insertError } = await client.from('quiz_results').insert({
    profile,
    destination: result.destination.name,
  })
  if (insertError) throw insertError

  const statistics = await readDistribution(client)
  if (!statistics.distribution.find(item => item.id === profile)?.count) {
    throw new Error('Comptes Supabase : participation actuelle non visible.')
  }
  return { ...statistics, currentProfile: profile }
}

// One promise per completed game, including failures. Never retry an ambiguous
// insert: the server may have committed it even if its response was lost.
export function createQuizSubmission(getClient) {
  let submission
  return (result) => {
    if (!submission) submission = Promise.resolve().then(() => saveQuizResult(getClient(), result))
    return submission
  }
}
