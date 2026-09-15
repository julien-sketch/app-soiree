import PassportSpread from './PassportSpread'

export default function Passport({ left, right, isTurning, turnLabel, impact, leftClass = '', rightClass = '' }) {
  return (
    <section className={`passportShell ${impact ? 'impact' : ''}`} aria-label="Passeport interactif Les Boss">
      <div className="passportShadow" />
      <div className="binding" />
      <PassportSpread left={left} right={right} isTurning={isTurning} turnLabel={turnLabel} leftClass={leftClass} rightClass={rightClass} />
    </section>
  )
}
