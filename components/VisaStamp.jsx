export default function VisaStamp({ lines, variant = 'red', country = '' }) {
  const stampSrc = {
    paris: '/stamps/france-cdg.svg',
    japan: '/stamps/japan-nrt.svg',
    maldives: '/stamps/maldives-mle.svg',
    tanzania: '/stamps/tanzania-jro.svg',
  }[country]

  return (
    <div className={`visaStamp ${variant} ${country}`}>
      {stampSrc && <img className="stampArtwork" src={stampSrc} alt="" aria-hidden="true" />}
      {lines.map((line, index) => (
        index === 1 || line.length <= 4
          ? <strong key={`${line}-${index}`}>{line}</strong>
          : <span key={`${line}-${index}`}>{line}</span>
      ))}
    </div>
  )
}
