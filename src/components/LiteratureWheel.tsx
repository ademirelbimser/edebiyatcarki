'use client';

import { useState, useEffect, useRef } from 'react';

interface Bucket {
  id: string;
  name: string;
  bucketNumber: number;
  works: Work[];
}

interface Work {
  id: string;
  title: string;
  type: string;
  author: string;
  text: string;
}

interface LiteratureWheelProps {
  bucketId?: string | null;
}

const LiteratureWheel = ({ bucketId }: LiteratureWheelProps) => {
  const [currentBucket, setCurrentBucket] = useState<Bucket | null>(null);
  const [numCabins, setNumCabins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [angVel, setAngVel] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [speed, setSpeed] = useState(0);
  const [stopTarget, setStopTarget] = useState(3.5);

  const animationRef = useRef<number>();
  const lastTsRef = useRef<number>();
  const releaseDecelRef = useRef(0);

  const stars = useState(() =>
    Array.from({ length: 120 }, () => ({
      x: Math.random() * 900,
      y: Math.random() * 520 * 0.7,
      r: Math.random() * 1.6 + 0.3,
      opacity: Math.random() * 0.7 + 0.2,
    }))
  )[0];

  const RIM_RADIUS = 180;
  const CABIN_DIST = RIM_RADIUS;
  const CABIN_SIZE = 28;
  const LIGHT_COUNT = numCabins * 6;
  const maxAngVel = 6.0;
  const accelWhilePress = 4.0;
  const angVelRef = useRef(0); // ← Yeni ref ekleyin

  // angVel değiştiğinde ref'i güncelleyin
  useEffect(() => {
    angVelRef.current = angVel;
  }, [angVel]);

  useEffect(() => {
    const fetchBucket = async () => {
      try {
        const url = bucketId ? `/api/buckets?id=${bucketId}` : '/api/buckets';
        const response = await fetch(url);
        if (response.ok) {
          const bucketData = await response.json();
          console.log('Fetched bucket data:', bucketData);
          setCurrentBucket(bucketData);
          // Set numCabins to the number of works in this bucket
          setNumCabins(bucketData.works.length);

          // If bucketId is provided, auto-spin the wheel
          if (bucketId && bucketData.works.length > 0) {
            // Auto-spin after a short delay
            setTimeout(() => {
              setPressing(true);
              setTimeout(() => {
                setPressing(false);
                releaseDecelRef.current = -maxAngVel / stopTarget;
                setTimeout(() => {
                  const cabinIndex = getBottomCabinIndex(angle, bucketData.works.length);
                  const workIndex = cabinIndex;
                  if (workIndex < bucketData.works.length) {
                    setSelectedWork(bucketData.works[workIndex]);
                  }
                }, stopTarget * 1000);
              }, 500); // Hold for 500ms
            }, 1000); // Wait 1 second after loading
          }
        } else {
          setError('Bucket yüklenirken hata oluştu');
        }
      } catch (err) {
        setError('Veritabanı bağlantı hatası: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBucket();
  }, [bucketId]);

  useEffect(() => {
  const update = (ts: number) => {
    if (!lastTsRef.current) lastTsRef.current = ts;
    const dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;

    setAngVel(prev => {
      let newVel = prev;
      if (pressing) {
        newVel += accelWhilePress * dt;
        if (newVel > maxAngVel) newVel = maxAngVel;
      } else {
        if (newVel > 0) {
          newVel += releaseDecelRef.current * dt;
          if (newVel < 0.00005) newVel = 0;
        }
      }
      return newVel;
    });

    setAngle(prev => {
      const currentAngVel = angVelRef.current;
      let newAngle = prev + currentAngVel * dt;
      
      // Yerçekimine göre snap - en alttaki kabin (270°/3π/2) pozisyonunda olmalı
      if (currentAngVel === 0 && numCabins > 0) {
        const snapStep = (2 * Math.PI) / numCabins;
        newAngle = Math.round(newAngle / snapStep) * snapStep;
      }
      
      return newAngle;
    });

    setSpeed(angVelRef.current);

    animationRef.current = requestAnimationFrame(update);
  };

  animationRef.current = requestAnimationFrame(update);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, [pressing, numCabins]);

  const getBottomCabinIndex = (currentAngle: number, cabinCount: number) => {
    const twoPi = 2 * Math.PI;
    let a = currentAngle % twoPi;
    if (a < 0) a += twoPi;
    const step = twoPi / cabinCount;
    let idx = Math.round((Math.PI - a) / step) % cabinCount;
    if (idx < 0) idx += cabinCount;
    return idx;
  };

  const getColorForIndex = (i: number) => {
    const palette = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B", "#FB5607", "#8338EC", "#3A86FF", "#06D6A0", "#FF9E00", "#9B5DE5", "#F15BB5"];
    return palette[i % palette.length];
  };

  const handleSpinStart = () => {
    setPressing(true);
  };

  const handleSpinEnd = () => {
    if (!pressing || !currentBucket || currentBucket.works.length === 0) return;
    setPressing(false);
    releaseDecelRef.current = -angVel / stopTarget;
    setTimeout(() => {
      const cabinIndex = getBottomCabinIndex(angle, numCabins);
      console.log('Selected cabin index:', cabinIndex);


      // Cabin numbers start from 1, works array is 0-indexed
      const workIndex = cabinIndex;
      if (workIndex < currentBucket.works.length) {
        setSelectedWork(currentBucket.works[workIndex]);
      }
    }, stopTarget * 1000);
  };

  const cabins = Array.from({ length: numCabins }, (_, i) => {
  // Math.PI / 2 ekleyerek ilk kabini alta yerleştiriyoruz
  const theta = (i / numCabins) * Math.PI * 2 - Math.PI / 2;
  const cx = Math.cos(theta) * CABIN_DIST;
  const cy = Math.sin(theta) * CABIN_DIST;
  const cabinNumber = i + 1;
  const counter = -(angle * 180 / Math.PI); // ← karşı-rotasyon

  return (
      <g key={i} transform={`translate(${cx} ${cy}) rotate(${counter})`}>
        <line x1={0} y1={0} x2={0} y2={18} stroke="#0b1b22" strokeWidth="2" />
        <rect
          x={-CABIN_SIZE / 2}
          y={18}
          width={CABIN_SIZE}
          height={CABIN_SIZE * 0.8}
          rx={6}
          fill={getColorForIndex(i)}
          stroke="black"
          strokeWidth="2"
        />
        <rect x={-6} y={22} width={12} height={12} rx={2} fill="#fff" opacity="0.95" />
        <text
          x="0"
          y={18 + (CABIN_SIZE * 0.8) / 2 + 4}
          textAnchor="middle"
          fill="#0f172a"
          fontWeight="bold"
          fontSize="12"
        >
          {cabinNumber}
        </text>
      </g>
    );
  });

  const spokes = Array.from({ length: numCabins }, (_, i) => {
    const theta = (i / numCabins) * Math.PI * 2 - Math.PI / 2;
    return (
      <line
        key={i}
        x1={0}
        y1={0}
        x2={Math.cos(theta) * RIM_RADIUS}
        y2={Math.sin(theta) * RIM_RADIUS}
        stroke="#1b495c"
        strokeWidth="3"
      />
    );
  });

  const lights = Array.from({ length: LIGHT_COUNT }, (_, i) => {
    const theta = (i / LIGHT_COUNT) * Math.PI * 2 - Math.PI / 2;
    const lx = Math.cos(theta) * (RIM_RADIUS + 10);
    const ly = Math.sin(theta) * (RIM_RADIUS + 10);
    const hueBase = (i / LIGHT_COUNT) * 360;
    const hueShift = (angle * 180 / Math.PI) * 0.4;
    const hue = (hueBase + hueShift) % 360;
    const pulse = 0.7 + 0.3 * Math.sin(angle * 3 + i * 0.5);

    return (
      <circle
        key={i}
        cx={lx}
        cy={ly}
        r={5}
        fill={`hsl(${hue},100%,${50 * pulse}%)`}
      />
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 pb-6">
      {/* SVG Wheel */}
      <div className="md:col-span-2 md:row-span-3 lg:col-span-3 lg:row-span-4 bg-slate-950/60 rounded-xl border border-slate-700 p-4">
        <svg viewBox="0 0 900 600" className="w-full h-auto">
          {/* Background */}
          <rect x="0" y="0" width="900" height="520" fill="#02102a" />
          <g id="stars">
            {stars.map((star, i) => (
              <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="white" opacity={star.opacity} />
            ))}
          </g>
          <rect x="0" y="520" width="900" height="80" fill="#071a28" />
          <ellipse cx="450" cy="560" rx="160" ry="24" fill="rgba(0,0,0,0.45)" />

          {/* Legs */}
          <g>
            <path d="M390 560 L420 280 L438 280 L408 560 Z" fill="var(--leg)" opacity="0.95" />
            <path d="M510 560 L480 280 L462 280 L492 560 Z" fill="var(--leg)" opacity="0.95" />
            <rect x="376" y="552" width="70" height="12" rx="4" fill="#2a1b14" opacity="0.95" />
            <polygon points="450,500 425,560 475,560" fill="#ffffff" stroke="#e6e6e6" strokeWidth="1" opacity="1" />
            <rect x="454" y="552" width="70" height="12" rx="4" fill="#2a1b14" opacity="0.95" />
            <rect x="410" y="420" width="80" height="10" rx="5" fill="#1e1a17" transform="rotate(-10 450 425)" />
            <rect x="410" y="440" width="80" height="10" rx="5" fill="#1e1a17" transform="rotate(10 450 445)" />
          </g>

          {/* Wheel */}
          
         <g transform={`translate(450 250)`}>
          <g transform={`rotate(${angle * 180 / Math.PI} 0 0)`}>
            <g>{lights}</g>
            <circle cx="0" cy="0" r="180" fill="none" stroke="#0d4a6f" strokeWidth="14" />
            <circle cx="0" cy="0" r="140" fill="none" stroke="#13364a" strokeWidth="6" />
            <g>{spokes}</g>
            <circle cx="0" cy="0" r="20" fill="#0f2b3a" />
            <circle cx="0" cy="0" r="10" fill="#1b4b68" />
            <g>{cabins}</g>
          </g>
        </g>
          <circle cx="450" cy="250" r="22" fill="#071a28" />
        </svg>
      </div>

      {/* Result Panel */}
      <div className="md:row-span-3 lg:row-span-4 lg:col-start-4 lg:col-span-2 bg-slate-800/70 backdrop-blur border border-slate-600 rounded-xl p-5 flex flex-col">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3">Seçilen Eser</h3>
        {!selectedWork ? (
          <p className="text-slate-300 text-sm flex-grow">Çarkı çevirip durduğunda seçilen eser burada gözükecek.</p>
        ) : (
          <div className="flex-grow flex flex-col gap-2 text-sm">
            <h4 className="font-bold text-cyan-200">{selectedWork.title}</h4>
            <p className="type text-amber-300 font-medium">{selectedWork.type}</p>
            <p className="author text-slate-300"><strong>Yazar:</strong> {selectedWork.author}</p>
            <p className="text text-slate-400 italic" dangerouslySetInnerHTML={{ __html: selectedWork.text.replace(/\n/g, '<br>') }} />
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="md:col-span-2 lg:col-span-3 lg:row-start-5 bg-slate-800/60 backdrop-blur border border-slate-600 rounded-xl p-4">
        <button
          onMouseDown={handleSpinStart}
          onMouseUp={handleSpinEnd}
          onTouchStart={handleSpinStart}
          onTouchEnd={handleSpinEnd}
          onMouseLeave={handleSpinEnd}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold shadow-lg transition-all duration-200 cursor-pointer select-none"
        >
          {pressing ? 'BASILI TUTULUYOR...' : selectedWork ? 'TEKRAR ÇEVİR!' : 'Basılı Tut → Dön'}
        </button>
        <p className="text-xs text-slate-300 mt-3 bg-slate-900/40 rounded-lg p-2">
          Mobil: butona basılı tutun veya üzerine dokunun. Bıraktığınızda seçtiğiniz süre içinde duracak şekilde yavaşlar.
        </p>
        <div className="mt-3 flex justify-between items-center text-xs text-slate-300">
          <span><strong>Hız:</strong> {speed.toFixed(2)} rad/s</span>
          <span><strong>Durma:</strong> {stopTarget}s</span>
        </div>
        <label className="block mt-3 text-xs text-slate-300">
          Durma süresi ayarla:
          <input
            type="range"
            min="2"
            max="5"
            step="0.1"
            value={stopTarget}
            onChange={(e) => setStopTarget(parseFloat(e.target.value))}
            className="w-full mt-1 accent-cyan-500"
          />
        </label>
      </div>

      {/* Admin Panel */}
      <div className="md:col-span-1 md:col-start-3 lg:col-span-2 lg:col-start-4 lg:row-start-5 bg-slate-800/60 backdrop-blur border border-slate-600 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Yönetim</h4>
        <a
          href="/admin"
          className="block w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-sm transition-colors text-center cursor-pointer"
        >
          Yeni Eser Ekle
        </a>

        {/* Share Section */}
        {currentBucket && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <h5 className="text-xs font-medium text-slate-300 mb-2">Paylaş</h5>
            <button
              onClick={() => {
                const url = `${window.location.origin}?bucket=${currentBucket.id}`;
                navigator.clipboard.writeText(url).then(() => {
                  // Could add a toast notification here
                  alert('Bağlantı panoya kopyalandı!');
                }).catch(() => {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = url;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Bağlantı panoya kopyalandı!');
                });
              }}
              className="w-full py-2 px-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg text-xs transition-colors text-center cursor-pointer"
            >
              🔗 Bağlantıyı Kopyala
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Bu bucket'ı arkadaşlarınla paylaş!
            </p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Çark {numCabins} kabin ile çalışıyor.
          </p>
          {loading && <p className="text-xs text-cyan-300 mt-2">Eser yükleniyor...</p>}
          {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LiteratureWheel;
