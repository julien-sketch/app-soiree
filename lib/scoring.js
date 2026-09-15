import { destinations } from '../data/destinations.js'
import { profiles } from '../data/profiles.js'

export function addScores(base, scores) {
  const next = { ...base }
  Object.entries(scores).forEach(([trait, value]) => {
    next[trait] = (next[trait] || 0) + value
  })
  return next
}

export function weightedScore(weights, totals) {
  return Object.entries(weights).reduce((sum, [trait, weight]) => {
    return sum + (totals[trait] || 0) * weight
  }, 0)
}

function winningMajorTraits(weights, totals) {
  const maxTraitScore = Math.max(0, ...Object.values(totals))
  return Object.keys(weights).filter((trait) => (totals[trait] || 0) === maxTraitScore).length
}

function chooseBest(items, totals) {
  return items
    .map((item, index) => ({
      ...item,
      score: weightedScore(item.weights, totals),
      majorTraitWins: winningMajorTraits(item.weights, totals),
      stableIndex: index,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.majorTraitWins !== a.majorTraitWins) return b.majorTraitWins - a.majorTraitWins
      return a.stableIndex - b.stableIndex
    })[0]
}

export function calculateProfile(scores) {
  return chooseBest(profiles, scores)
}

export function calculateDestination(scores) {
  return chooseBest(destinations, scores)
}
