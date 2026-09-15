import BrandBlock from './BrandBlock'

const homeStamps = [
  { id: 'home-orange', crop: '250 138 275 275', ink: '0 0 0 0 .94  0 0 0 0 .28  0 0 0 0 .10  1.5 0 -1.5 0 -.08' },
  { id: 'home-purple', crop: '319 436 270 218', ink: '0 0 0 0 .48  0 0 0 0 .08  0 0 0 0 .50  3 -3 0 0 -.08' },
  { id: 'home-blue', crop: '68 330 255 260', ink: '0 0 0 0 .15  0 0 0 0 .16  0 0 0 0 .60  -2 0 2 0 -.08' },
  { id: 'home-green', crop: '505 298 145 132', ink: '0 0 0 0 .05  0 0 0 0 .48  0 0 0 0 .28  -3 3 0 0 -.08' },
]

export function HomeLeft({ onStart }) {
  return (
    <>
      <BrandBlock />
      <div className="introContent">
        <h1>QUEL VOYAGEUR<br />BOSS ÊTES-VOUS ?</h1>
        <p className="lead">4 questions. Un profil. Une destination naturelle.</p>
        <p className="introText">Découvrez comment votre personnalité prend vie aux quatre coins du monde.</p>
        <button className="primary" onClick={onStart}>DÉCOLLAGE <span>→</span></button>
        <div className="mrz">LESBOSS&lt;&lt;TOURDUMONDE&lt;&lt;ENTREPRENEURS&lt;&lt;&lt;&lt;&lt;&lt;<br />VOYAGEUR&lt;&lt;BOSS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;2026</div>
      </div>
    </>
  )
}

export function HomeVisa() {
  return (
    <div className="homeVisa">
      <div className="compass" aria-hidden="true">✦</div>
      <div className="aixScene" aria-hidden="true">
        <span className="lake" />
        <span className="mountains" />
        <span className="thermal" />
      </div>
      {homeStamps.map(({ id, crop, ink }) => (
        <svg key={id} className={`homeTravelStamp ${id}`} viewBox={crop} aria-hidden="true">
          <defs>
            <filter id={id} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={ink} />
            </filter>
          </defs>
          <image href="/stamps/travel-stamps-source.png" width="1600" height="1600" filter={`url(#${id})`} />
        </svg>
      ))}
      <div className="visaTrace">VISA No. LB-2026-01<br />45°38' N · 5°55' E<br />MERY · SAVOIE</div>
      <div className="planeRoute" />
      <p className="handNote">Le business est sérieux.<br />Pas l'ambiance.</p>
    </div>
  )
}
