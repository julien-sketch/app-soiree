import VisaStamp from './VisaStamp'

function CountryShape({ type }) {
  return (
    <svg className={`countryShape countryScene ${type}`} viewBox="0 0 320 230" aria-hidden="true">
      {type === 'paris' && (
        <>
          <path className="wash" d="M75 44c31-20 79-22 112-4 36 20 51 59 40 96-12 39-50 64-92 60-45-5-83-36-92-78-7-32 5-56 32-74Z" />
          <path className="mapLine" d="M119 23c21 5 43 4 62 19 13 10 20 27 28 42 10 18 29 28 32 49 3 19-18 28-31 37-14 10-16 33-36 39-18 5-33-13-51-11-20 3-31 21-51 12-17-8-18-31-29-45-12-16-34-21-37-43-3-20 17-31 25-47 8-17 2-41 20-52 19-12 45-5 68 0Z" />
          <path className="landmarkLine" d="M93 190 143 68 194 190M124 115h38M111 147h70M102 178h88M143 68l-10 122M143 68l12 122" />
          <path className="routeLine" d="M32 66c52-24 99-17 141 20 31 28 61 34 99 18" />
        </>
      )}
      {type === 'japan' && (
        <>
          <circle className="sunWash" cx="229" cy="54" r="34" />
          <path className="mapLine" d="M179 21c15 10 14 29 4 42-10 14-3 26 10 35 18 13 18 36-1 48-14 9-17 20-10 34 8 17-1 36-18 41" />
          <path className="mapLine thin" d="M139 57c16 13 12 35-6 45-14 8-15 20-4 32 15 16 9 38-11 47M101 105c10 8 9 23-2 30-12 8-11 18 0 28" />
          <path className="landmarkLine" d="M31 190 116 74l38 52 32-31 101 95M79 152c25-14 54-13 80 0M48 189c75-24 148-24 221 0" />
          <path className="birdLine" d="M224 125c8-7 15-7 23 0M252 111c7-6 14-6 21 0" />
        </>
      )}
      {type === 'maldives' && (
        <>
          <path className="wash" d="M72 84c44-40 116-49 168-20 41 23 60 69 43 111-19 46-76 66-129 57-55-10-108-48-119-91-5-22 7-41 37-57Z" />
          <path className="mapLine" d="M87 109c27-22 60-23 88-3 22 16 48 19 78 7M56 151c42-21 83-22 124-2 35 17 69 14 102-9M43 189c48-19 96-20 145-1 41 16 78 14 113-6" />
          <path className="landmarkLine" d="M74 181c29-22 59-22 90 0M182 169c23-17 46-17 70 0M205 172c-2-43 8-72 30-88M235 84c-25 0-42 10-53 31M235 84c5 26-2 47-21 64M235 84c20 10 32 26 37 50" />
          <path className="birdLine" d="M76 65c9-7 18-7 27 0M111 54c8-6 16-6 24 0M258 73c8-6 16-6 24 0" />
        </>
      )}
      {type === 'tanzania' && (
        <>
          <path className="wash" d="M80 50c47-28 112-24 154 8 38 29 51 82 31 124-22 44-76 59-124 48-54-13-103-54-111-100-6-34 16-61 50-80Z" />
          <path className="mapLine" d="M175 20c26 18 40 46 40 83 0 28 18 45 41 59-18 36-43 59-77 68-36-19-47-51-34-95 10-33 3-62-20-88 13-18 29-27 50-27Z" />
          <path className="landmarkLine" d="M35 184 135 61l46 57 28-29 78 95M76 146c38-19 77-18 117 2M39 190c78-25 158-25 241 0" />
          <path className="palmLine" d="M247 190c-2-39 6-68 26-90M273 100c-24 0-41 9-51 28M273 100c5 26-3 47-24 63M273 100c22 11 35 28 39 53" />
          <path className="birdLine" d="M74 88c9-7 18-7 27 0M103 76c8-6 16-6 24 0" />
        </>
      )}
    </svg>
  )
}

const pageAssets = {
  paris: {
    map: '/maps/france.svg',
    illustration: '/illustrations/eiffel.svg',
    secondary: '/stamps/paris-round.svg',
  },
  japan: {
    map: '/maps/japan.svg',
    illustration: '/illustrations/fuji.svg',
    secondary: '/stamps/japan-nrt.svg',
  },
  maldives: {
    map: '/maps/maldives.svg',
    illustration: '/illustrations/maldives.svg',
    secondary: '/stamps/maldives-mle.svg',
  },
  tanzania: {
    map: '/maps/tanzania.svg',
    illustration: '/illustrations/kilimanjaro.svg',
    secondary: '/stamps/tanzania-jro.svg',
  },
}

const localStamps = {
  tanzania: [
    { id: 'montblanc-blue', viewBox: '68 330 255 260', ink: '0 0 0 0 .15  0 0 0 0 .16  0 0 0 0 .60  -2 0 2 0 -.08', position: 'mountainStampFirst' },
    { id: 'montblanc-purple', viewBox: '473 48 158 195', ink: '0 0 0 0 .48  0 0 0 0 .08  0 0 0 0 .50  3 -3 0 0 -.08', position: 'mountainStampSecond' },
    { id: 'montblanc-teal', viewBox: '978 486 184 136', ink: '0 0 0 0 .08  0 0 0 0 .38  0 0 0 0 .42  -3 0 3 0 -.08', position: 'mountainStampThird' },
  ],
  japan: [
    { id: 'annecy-blue', viewBox: '25 80 220 245', ink: '0 0 0 0 .05  0 0 0 0 .40  0 0 0 0 .68  -2 0 2 0 -.08', position: 'localStampSingle' },
  ],
  maldives: [
    { id: 'bourget-red', viewBox: '1025 68 250 215', ink: '0 0 0 0 .72  0 0 0 0 .05  0 0 0 0 .06  2 -2 0 0 -.08', position: 'localStampFirst' },
    { id: 'bourget-green', viewBox: '505 298 145 132', ink: '0 0 0 0 .05  0 0 0 0 .48  0 0 0 0 .28  -3 3 0 0 -.08', position: 'localStampSecond' },
  ],
}

export default function VisaPage({ visa, step }) {
  const assets = pageAssets[visa.className]

  return (
    <div className={`visaPage ${visa.className}`}>
      <div className="pageSerial">PASSPORT PAGE 0{step + 1} · {visa.code}</div>
      {assets?.map && <img className="mapAsset" src={assets.map} alt="" aria-hidden="true" />}
      {assets?.illustration && <img className="engravingAsset" src={assets.illustration} alt="" aria-hidden="true" />}
      <CountryShape type={visa.className} />
      <div className="countryTitle">{visa.country}</div>
      <VisaStamp lines={visa.stamp} variant={step % 2 ? 'red' : 'blue'} country={visa.className} />
      <div className="stampDate">{visa.date}</div>
      {assets?.secondary && <img className="secondaryStampAsset" src={assets.secondary} alt="" aria-hidden="true" />}
      <div className="secondaryStamp">ARRIVAL<br />{visa.city}<br />{visa.code}</div>
      {visa.className === 'paris' && (
        <>
          <svg className="chamberyStamp chamberyStampOrange" viewBox="250 138 275 275" aria-hidden="true">
            <defs>
              <filter id="chambery-orange-ink" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="0 0 0 0 .94  0 0 0 0 .28  0 0 0 0 .10  1.5 0 -1.5 0 -.08" />
              </filter>
            </defs>
            <image href="/stamps/travel-stamps-source.png" width="1600" height="1600" filter="url(#chambery-orange-ink)" />
          </svg>
          <svg className="chamberyStamp chamberyStampPurple" viewBox="319 436 270 218" aria-hidden="true">
            <defs>
              <filter id="chambery-purple-ink" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="0 0 0 0 .48  0 0 0 0 .08  0 0 0 0 .50  3 -3 0 0 -.08" />
              </filter>
            </defs>
            <image href="/stamps/travel-stamps-source.png" width="1600" height="1600" filter="url(#chambery-purple-ink)" />
          </svg>
        </>
      )}
      {localStamps[visa.className]?.map(({ id, viewBox, ink, position }) => (
        <svg key={id} className={`localTravelStamp ${position}`} viewBox={viewBox} aria-hidden="true">
          <defs>
            <filter id={id} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={ink} />
            </filter>
          </defs>
          <image href="/stamps/travel-stamps-source.png" width="1600" height="1600" filter={`url(#${id})`} />
        </svg>
      ))}
      <div className={`sceneSketch ${visa.className}`} aria-hidden="true"><i /><i /><i /></div>
      <div className="landmark">{visa.glyph}</div>
      <div className="visaLines"><i /><i /><i /><i /></div>
      <p className="geoNote">{visa.note}</p>
      {visa.script && <p className="handNote countryNote">{visa.script}</p>}
      <div className="airRoute"><span /></div>
    </div>
  )
}
