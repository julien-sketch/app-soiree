function PassportWatermark() {
  return (
    <svg className="passportWatermark" viewBox="0 0 420 560" aria-hidden="true">
      <g className="wmAix">
        <path d="M72 370c56-42 112-56 169-41 44 12 78 40 130 24" />
        <path d="M49 407c72-32 145-36 219-13 39 12 76 11 112-2M38 438c74-21 150-22 228-2 45 11 85 8 120-9" />
        <path d="M88 295c24-38 51-57 80-57 29 0 56 19 81 57M117 295c17-23 34-35 51-35 18 0 35 12 52 35" />
        <path d="M261 322c0-47 13-83 40-109M301 213c-33 2-55 17-67 45M301 213c8 30 1 56-23 78M301 213c28 12 45 33 51 63" />
        <path d="M128 207c35-17 72-17 110 0M149 182c23-10 47-10 72 0" />
        <text x="78" y="476">AIX LES BAINS</text>
      </g>
      <g className="wmParis">
        <path d="M95 429 204 126 314 429M156 244h96M137 318h135M119 388h171M204 126l-26 303M204 126l31 303" />
        <path d="M55 410c53-31 107-33 161-7 55 27 105 24 151-9" />
        <path d="M111 480h198M133 458c28-22 56-22 84 0M232 456c25-18 49-18 73 0" />
        <path d="M252 259c20-13 41-13 63 0M56 200c47-19 91-14 131 16 44 33 94 34 150 5" />
        <text x="86" y="516">PARIS</text>
      </g>
      <g className="wmJapan">
        <circle cx="297" cy="92" r="42" />
        <path d="M239 49c24 18 24 49 5 72-18 22-7 44 19 60 33 20 32 63-3 83-24 14-30 34-17 59 14 31-2 63-35 76" />
        <path d="M168 116c25 22 20 59-11 75-23 13-24 34-6 54 26 28 15 68-18 82M90 184c17 14 15 39-5 51-19 13-18 32 1 50" />
        <path d="M48 441 151 242l53 82 39-49 126 166M96 384c39-24 80-24 123 0" />
        <text x="92" y="504">JAPON</text>
      </g>
      <g className="wmMaldives">
        <path d="M55 301c43-24 85-25 127-3 37 19 75 15 116-12M39 358c61-25 121-25 180 0 53 22 101 19 145-10M48 414c70-22 139-23 207-2 40 12 78 10 115-6" />
        <path d="M88 276c37-30 75-31 114-4M222 251c31-24 62-24 94 0" />
        <path d="M269 291c-3-74 15-126 55-157M324 134c-43 0-74 19-93 57M324 134c9 45-5 83-41 113M324 134c38 17 62 48 71 92" />
        <path d="M76 178c13-10 26-10 39 0M128 156c12-9 24-9 36 0M230 179c12-9 24-9 36 0" />
        <text x="72" y="497">MALDIVES</text>
      </g>
      <g className="wmTanzania">
        <path d="M49 421 167 197l58 82 34-48 111 190M98 356c52-26 105-24 160 5M52 430c88-33 178-34 271-3" />
        <path d="M224 90c33 25 49 60 49 105 0 35 24 58 58 76-25 56-62 90-111 103-53-29-69-77-48-142 15-49 4-91-31-126 23-16 50-22 83-16Z" />
        <path d="M323 424c-3-69 13-118 47-148M370 276c-39 2-67 18-84 50M370 276c7 46-7 82-42 110M370 276c35 18 56 47 63 89" />
        <path d="M83 205c14-11 28-11 42 0M132 178c12-9 24-9 36 0" />
        <text x="70" y="499">TANZANIA</text>
      </g>
      <g className="wmLines">
        {Array.from({ length: 30 }, (_, index) => (
          <path key={index} d={`M18 ${66 + index * 13}c92 ${-8 + index % 4} 180 ${8 - index % 3} 384 0`} />
        ))}
      </g>
    </svg>
  )
}

export default function PassportPage({ children, side, className = '' }) {
  return (
    <div className={`passportPage ${side} ${className}`}>
      <PassportWatermark />
      {side === 'rightPage' && <div className="visasLabel">Visas</div>}
      {children}
    </div>
  )
}
