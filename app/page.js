'use client'

import { useMemo, useRef, useState } from 'react'
import { questions } from '../data/questions'
import { addScores, calculateDestination, calculateProfile } from '../lib/scoring'
import { getSupabaseClient } from '../lib/supabase'
import { createQuizSubmission } from '../lib/quizResults'
import Passport from '../components/Passport'
import { HomeLeft, HomeVisa } from '../components/HomePage'
import QuestionPage from '../components/QuestionPage'
import VisaPage from '../components/VisaPage'
import { ResultLeft, ResultRight } from '../components/ResultPage'

export default function Home() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState({})
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [result, setResult] = useState(null)
  const [showProfileStamp, setShowProfileStamp] = useState(false)
  const [showDestinationStamp, setShowDestinationStamp] = useState(false)
  const [profileComparison, setProfileComparison] = useState(null)
  const submission = useRef(null)
  const choosing = useRef(false)
  const timer = useRef(null)

  const previewResult = useMemo(() => ({
    profile: calculateProfile(scores),
    destination: calculateDestination(scores),
  }), [scores])

  const activeResult = result || previewResult
  const finished = Boolean(result)
  const stampStage = (showProfileStamp ? 1 : 0) + (showDestinationStamp ? 1 : 0)

  function choose(answer) {
    if (choosing.current || isAnimating || finished) return
    choosing.current = true

    const nextScores = addScores(scores, answer.scores)
    setScores(nextScores)
    setSelectedAnswers((answers) => [...answers, answer.text])
    setIsAnimating(true)
    window.clearTimeout(timer.current)

    timer.current = window.setTimeout(() => {
      if (step === questions.length - 1) {
        const completedResult = {
          profile: calculateProfile(nextScores),
          destination: calculateDestination(nextScores),
        }
        setResult(completedResult)
        setProfileComparison({ status: 'loading' })
        if (!submission.current) submission.current = createQuizSubmission(getSupabaseClient)
        const currentSubmission = submission.current
        currentSubmission(completedResult).then((comparison) => {
          // A late response from a previous game must not update the new game.
          if (submission.current === currentSubmission) {
            setProfileComparison({ status: 'ready', ...comparison })
          }
        }).catch((error) => {
          console.error('[quiz_results] Enregistrement ou statistiques indisponibles :', error)
          if (submission.current === currentSubmission) setProfileComparison({ status: 'unavailable' })
        })
        setIsAnimating(false)
        window.setTimeout(() => setShowProfileStamp(true), 420)
        window.setTimeout(() => setShowDestinationStamp(true), 1080)
      } else {
        setStep((currentStep) => currentStep + 1)
        setIsAnimating(false)
        choosing.current = false
      }
    }, 660)
  }

  function reset() {
    window.clearTimeout(timer.current)
    submission.current = null
    choosing.current = false
    setProfileComparison(null)
    setStarted(false)
    setStep(0)
    setScores({})
    setSelectedAnswers([])
    setIsAnimating(false)
    setResult(null)
    setShowProfileStamp(false)
    setShowDestinationStamp(false)
  }

  const leftPage = !started
    ? <HomeLeft onStart={() => setStarted(true)} />
    : finished
      ? <ResultLeft profile={activeResult.profile} showDetails={showDestinationStamp} stampStage={stampStage} />
      : <QuestionPage step={step} total={questions.length} question={questions[step]} isAnimating={isAnimating} selectedAnswer={selectedAnswers[step]} onChoose={choose} />

  const rightPage = !started
    ? <HomeVisa />
    : finished
      ? <ResultRight destination={activeResult.destination} stampStage={stampStage} onReset={reset} comparison={profileComparison} />
      : <VisaPage visa={questions[step].visa} step={step} />

  const turnLabel = step === questions.length - 1 ? 'RÉSULTAT' : `QUESTION ${Math.min(step + 2, questions.length)}/4`

  const currentWatermark = started && !finished ? `watermark-${questions[step].visa.className}` : 'watermark-aix'
  const leftClass = finished ? 'watermark-results' : currentWatermark
  const rightClass = finished ? 'watermark-results' : currentWatermark

  return (
    <main className="scene">
      <div className="deskGlow" />
      <Passport
        left={leftPage}
        right={rightPage}
        isTurning={isAnimating}
        turnLabel={turnLabel}
        impact={stampStage > 0}
        leftClass={leftClass}
        rightClass={rightClass}
      />
    </main>
  )
}
