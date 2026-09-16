import BrandBlock from './BrandBlock'
import ResultStamp from './ResultStamp'

export function ResultLeft({ profile, showDetails, stampStage }) {
  return (
    <>
      <BrandBlock />
      <div className="resultLeft">
        <div className="eyebrow">VOTRE PROFIL VOYAGEUR</div>
        <ResultStamp className={stampStage > 0 ? 'profileStamp stampIn' : 'profileStamp'} title="VOTRE PROFIL" main={profile.name} detail={profile.traits.join(' · ')} />
        <div className={`resultCopy ${showDetails ? 'show' : ''}`}>
          <p>{profile.description}</p>
          <blockquote>« {profile.quote} »</blockquote>
          <div className="traits leftTraits">
            <span><b>POINT FORT</b>{profile.strength}</span>
            <span><b>PETIT DÉFAUT</b>{profile.weakness}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export function ResultRight({ destination, stampStage, onReset, comparison }) {
  return (
    <div className={`resultRight ${stampStage > 0 ? 'shake' : ''}`}>
      <ResultStamp
        className={stampStage > 1 ? 'destinationStamp stampIn' : 'destinationStamp'}
        title="DESTINATION"
        main={destination.name}
        detail={`${destination.country} ${destination.flag}`}
        code={destination.code}
      />
      <div className="resultSketch" aria-hidden="true" />
      <div className={`destinationDetails ${stampStage > 1 ? 'show' : ''}`}>
        <p>{destination.description}</p>
        <div className="profileComparison" role="status" aria-live="polite" aria-atomic="true">
          {comparison?.status === 'loading' && <span>Comparaison avec les autres Boss...</span>}
          {comparison?.status === 'ready' && <span><strong>{comparison.percentage} %</strong> des Boss ont le même profil que vous.</span>}
        </div>
        <button className="secondary" onClick={onReset}>FAIS TESTER UN AUTRE BOSS <span>→</span></button>
      </div>
    </div>
  )
}
