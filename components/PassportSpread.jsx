import PassportPage from './PassportPage'
import PageTurn from './PageTurn'

export default function PassportSpread({ left, right, isTurning, turnLabel, leftClass = '', rightClass = '' }) {
  return (
    <div className="spread">
      <PassportPage side="leftPage" className={leftClass}>{left}</PassportPage>
      <PassportPage side="rightPage" className={rightClass}>{right}</PassportPage>
      <PageTurn active={isTurning} label={turnLabel} />
    </div>
  )
}
