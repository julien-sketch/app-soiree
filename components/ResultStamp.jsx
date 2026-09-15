import { useId } from 'react'

export default function ResultStamp({ className, title, main, detail, code }) {
  const inkId = useId().replace(/:/g, '')
  const destination = className.includes('destinationStamp')
  return (
    <div className={`resultStamp ${className}`}>
      <svg width="0" height="0" aria-hidden="true" className="stampFilterDefs">
        <defs>
          <filter id={inkId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="3" seed={destination ? 12 : 7} result="grain" />
            <feColorMatrix in="grain" type="luminanceToAlpha" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 .3 .85 1 1" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="resultStampInk" style={{ filter: `url(#${inkId})` }}>
      <svg className="resultStampFrame" viewBox="0 0 400 240" preserveAspectRatio="none" aria-hidden="true">
        {destination ? (
          <>
            <path d="M44 6H356L394 44V196L356 234H44L6 196V44Z" strokeWidth="5" />
            <path d="M49 17H351L383 49V191L351 223H49L17 191V49Z" strokeWidth="1.8" />
          </>
        ) : (
          <>
            <rect x="6" y="6" width="388" height="228" rx="7" strokeWidth="5" />
            <rect x="17" y="17" width="366" height="206" rx="2" strokeWidth="1.8" />
          </>
        )}
        <path d="M35 57H365M35 183H365" strokeWidth="1.5" />
      </svg>
      <span>{title}</span>
      <strong>{main}</strong>
      <small>{detail}</small>
      {code && <em>{code}</em>}
      </div>
    </div>
  )
}
