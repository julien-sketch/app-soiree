import BrandBlock from './BrandBlock'

export default function QuestionPage({ step, total, question, isAnimating, selectedAnswer, onChoose }) {
  return (
    <>
      <BrandBlock />
      <div className="questionSide">
        <div className="questionTop">
          <span>QUESTION {step + 1}/{total}</span>
          <b aria-hidden="true">✈</b>
          <div className="visaDots" aria-hidden="true">
            {Array.from({ length: total }, (_, index) => <i key={index} className={index <= step ? 'active' : ''} />)}
          </div>
        </div>
        <div className="progress"><i style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
        <h2>{question.prompt}</h2>
        <div className="answers">
          {question.answers.map((answer, index) => (
            <button
              key={answer.text}
              className={selectedAnswer === answer.text ? 'selected' : ''}
              onClick={() => onChoose(answer)}
              disabled={isAnimating}
            >
              <span className="answerIndex">0{index + 1}</span>
              <span>{answer.text}</span>
            </button>
          ))}
        </div>
        <div className="travelNote">LES BOSS — DES IDÉES SANS FRONTIÈRES</div>
      </div>
    </>
  )
}
