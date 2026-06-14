import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { useApp } from '../context/AppContext';

export default function GlobeWidget() {
  const { state } = useApp();
  const globeEl = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 120, height: 120 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add slight continuous rotation
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 2;
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  const score = state.user.carbonScore;
  
  // Calculate pollution rings based on score
  // A perfect score of 1000 means 0 pollution rings
  // A terrible score of 0 means 50 pollution rings
  const maxRings = 40;
  const numRings = Math.max(0, Math.floor(((1000 - score) / 1000) * maxRings));

  // Generate random pollution hotspots
  const ringsData = Array.from({ length: numRings }).map(() => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    maxR: Math.random() * 5 + 2,
    propagationSpeed: (Math.random() - 0.5) * 2 + 1,
    repeatPeriod: Math.random() * 1000 + 500,
  }));

  // Determine globe atmosphere color based on score
  let atmosphereColor = '#10b981'; // Green for excellent
  let ringColor = '#ef4444'; // Red for pollution

  if (score < 400) {
    atmosphereColor = '#ef4444'; // Red atmosphere if very bad
    ringColor = '#b91c1c';
  } else if (score < 700) {
    atmosphereColor = '#f59e0b'; // Orange atmosphere if okay
    ringColor = '#ef4444';
  }

  if (!mounted) return <div style={{ width: 120, height: 120 }} className="rounded-full bg-slate-800 animate-pulse" />;

  return (
    <div className="relative rounded-full overflow-hidden" style={{ width: dimensions.width, height: dimensions.height, cursor: 'grab' }}>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={0.25}
        ringsData={ringsData}
        ringColor={() => ringColor}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />
    </div>
  );
}
