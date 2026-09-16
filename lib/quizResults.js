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

export async function saveQuizResult(client, result) {
  const profile = getProfileId(result.profile.name)
  const { error: insertError } = await client.from('quiz_results').insert({
    profile,
    destination: result.destination.name,
  })
  if (insertError) throw insertError

  // No result rows are downloaded. Both counts run only after a successful insert.
  const [total, matching] = await Promise.all([
    client.from('quiz_results').select('id', { count: 'exact', head: true }),
    client.from('quiz_results').select('id', { count: 'exact', head: true }).eq('profile', profile),
  ])
  if (total.error) throw total.error
  if (matching.error) throw matching.error
  if (!Number.isInteger(total.count) || !Number.isInteger(matching.count)
    || total.count < 1 || matching.count < 1 || matching.count > total.count) {
    throw new Error('Comptes Supabase indisponibles ou incohérents. Vérifier la policy SELECT.')
  }

  return {
    totalResults: total.count,
    sameProfile: matching.count,
    percentage: Math.round(matching.count / total.count * 100),
  }
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
