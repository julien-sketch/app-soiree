export default function PageTurn({ active, label }) {
  if (!active) return null

  return (
    <div className="turnPage turning" aria-hidden="true">
      <div className="turnFace front">
        <span>LES BOSS</span>
        <strong>{label}</strong>
      </div>
      <div className="turnFace back">
        <span>PASSEPORT</span>
        <strong>VISA</strong>
      </div>
    </div>
  )
}
