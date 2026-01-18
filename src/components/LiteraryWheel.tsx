'use client'

import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './LiteraryWheel.module.css'

interface Card {
    id: number
    title: string
    type: string
    author: string
    content: string
    averageRating?: number
    ratingCount?: number
}

interface Props {
    initialCards: Card[],
    bucketTitle: string,
    bucketId: string,
    isAuthenticated: boolean
}

const RIM_RADIUS = 180
const CABIN_DIST = RIM_RADIUS
const CABIN_SIZE = 28
const MAX_ANG_VEL = 6.0
const ACCEL_WHILE_PRESS = 4.0

const PALETTE = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B", "#FB5607", "#8338EC", "#3A86FF", "#06D6A0", "#FF9E00", "#9B5DE5", "#00BBF9", "#F15BB5"]

function WheelContent({ initialCards, bucketTitle, bucketId, isAuthenticated }: Props) {
    const searchParams = useSearchParams()
    const wheelGroupRef = useRef<SVGGElement>(null)
    const spokesGroupRef = useRef<SVGGElement>(null)
    const lightsGroupRef = useRef<SVGGElement>(null)
    const starsGroupRef = useRef<SVGGElement>(null)
    const spinBtnRef = useRef<HTMLButtonElement>(null)

    // Physics state
    const state = useRef({
        angle: 0,
        angVel: 0,
        pressing: false,
        lastTs: 0,
        releaseDecel: 0
    })

    // We allow cards to be updated (e.g. upload) - maybe later, for now use prop
    const [cards, setCards] = useState<Card[]>(initialCards)
    const [selectedCard, setSelectedCard] = useState<Card | null>(null)
    const [stopTime, setStopTime] = useState(3.5)
    const [currentSpeed, setCurrentSpeed] = useState(0)
    const [buttonText, setButtonText] = useState('Basılı Tut → Dön')
    const [userRating, setUserRating] = useState(0)
    const [showShareModal, setShowShareModal] = useState(false)
    const [copied, setCopied] = useState(false)

    const NUM_CABINS = cards.length || 1
    const LIGHT_COUNT = NUM_CABINS * 6

    const getColor = (i: number) => PALETTE[i % PALETTE.length]

    // Handle shared card on load
    useEffect(() => {
        const cardIdParam = searchParams.get('cardId')
        if (cardIdParam && !selectedCard) {
            const id = parseInt(cardIdParam)
            const card = cards.find(c => c.id === id)
            if (card) {
                setSelectedCard(card)
            }
        }
    }, [searchParams, cards, selectedCard])

    const getBottomCabinIndex = useCallback((currentAngle: number, count: number) => {
        const twoPi = 2 * Math.PI
        let a = currentAngle % twoPi
        if (a < 0) a += twoPi
        const step = twoPi / count
        let idx = Math.round((Math.PI - a) / step) % count
        if (idx < 0) idx += count
        return idx
    }, [])

    // Initialize Stars
    useEffect(() => {
        if (!starsGroupRef.current) return
        const g = starsGroupRef.current
        while (g.firstChild) g.removeChild(g.firstChild)

        const W = 900, H = 520
        for (let i = 0; i < 120; i++) {
            const x = Math.random() * W
            const y = Math.random() * H * 0.7
            const r = Math.random() * 1.6 + 0.3
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            c.setAttribute('cx', String(x))
            c.setAttribute('cy', String(y))
            c.setAttribute('r', String(r))
            c.setAttribute('fill', 'white')
            c.setAttribute('opacity', (Math.random() * 0.7 + 0.2).toFixed(2))
            g.appendChild(c)
        }
    }, [])

    // Initialize Cabins and Lights
    useEffect(() => {
        if (!spokesGroupRef.current || !lightsGroupRef.current) return

        // Clear previous
        const sG = spokesGroupRef.current
        const lG = lightsGroupRef.current
        while (sG.firstChild) sG.removeChild(sG.firstChild)
        while (lG.firstChild) lG.removeChild(lG.firstChild)

        // Create Cabins
        for (let i = 0; i < NUM_CABINS; i++) {
            const theta = (i / NUM_CABINS) * Math.PI * 2 - Math.PI / 2
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.setAttribute('x1', '0'); line.setAttribute('y1', '0')
            line.setAttribute('x2', String(Math.cos(theta) * RIM_RADIUS))
            line.setAttribute('y2', String(Math.sin(theta) * RIM_RADIUS))
            line.setAttribute('stroke', '#1b495c'); line.setAttribute('stroke-width', '3')
            sG.appendChild(line)

            const cabinG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            cabinG.setAttribute('class', 'cabinG')
            cabinG.setAttribute('data-index', String(i))
            const cx = Math.cos(theta) * CABIN_DIST
            const cy = Math.sin(theta) * CABIN_DIST
            cabinG.setAttribute('transform', `translate(${cx} ${cy})`)

            // Arm
            const arm = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            arm.setAttribute('x1', '0'); arm.setAttribute('y1', '0'); arm.setAttribute('x2', '0'); arm.setAttribute('y2', '18')
            arm.setAttribute('stroke', '#0b1b22'); arm.setAttribute('stroke-width', '2')
            cabinG.appendChild(arm)

            // Rect
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect.setAttribute('x', String(-CABIN_SIZE / 2))
            rect.setAttribute('y', '18')
            rect.setAttribute('width', String(CABIN_SIZE))
            rect.setAttribute('height', String(CABIN_SIZE * 0.8))
            rect.setAttribute('rx', '6')
            rect.setAttribute('class', styles.cabin)
            rect.setAttribute('fill', getColor(i))
            rect.setAttribute('stroke', '#9b6a00'); rect.setAttribute('stroke-width', '1.5')
            cabinG.appendChild(rect)

            // Window
            const win = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            win.setAttribute('x', '-6'); win.setAttribute('y', '22')
            win.setAttribute('width', '12'); win.setAttribute('height', '12')
            win.setAttribute('rx', '2'); win.setAttribute('fill', '#fff'); win.setAttribute('opacity', '0.95')
            cabinG.appendChild(win)

            // Number
            const num = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            num.setAttribute('class', styles.cabinNumberNight)
            num.setAttribute('x', '0')
            const cabinCenterY = 18 + (CABIN_SIZE * 0.8) / 2 + 4
            num.setAttribute('y', String(cabinCenterY))
            num.setAttribute('text-anchor', 'middle')
            num.textContent = String(i + 1)
            cabinG.appendChild(num)

            sG.appendChild(cabinG)
        }

        // Lights
        for (let i = 0; i < LIGHT_COUNT; i++) {
            const theta = (i / LIGHT_COUNT) * Math.PI * 2 - Math.PI / 2
            const lx = Math.cos(theta) * (RIM_RADIUS + 10)
            const ly = Math.sin(theta) * (RIM_RADIUS + 10)
            const light = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            light.setAttribute('cx', String(lx))
            light.setAttribute('cy', String(ly))
            light.setAttribute('r', '5')
            light.setAttribute('class', styles.rimLight)
            light.setAttribute('data-index', String(i))
            lG.appendChild(light)
        }

    }, [NUM_CABINS, cards]) // Re-run if cards change

    // Animation Loop
    useEffect(() => {
        let reqId: number


        const update = (ts: number) => {
            if (!state.current.lastTs) state.current.lastTs = ts
            const dt = (ts - state.current.lastTs) / 1000
            state.current.lastTs = ts

            const s = state.current

            if (s.pressing) {
                s.angVel += ACCEL_WHILE_PRESS * dt
                if (s.angVel > MAX_ANG_VEL) s.angVel = MAX_ANG_VEL
            } else {
                if (s.angVel > 0) {
                    s.angVel += s.releaseDecel * dt
                    if (s.angVel < 0.00005) s.angVel = 0
                }
            }

            s.angle += s.angVel * dt

            // Snap when stopped
            if (s.angVel === 0 && !s.pressing && s.releaseDecel !== 0) {
                // check if we just stopped
                // Actually simpler: if speed is effectively 0, snap
                const snapStep = (2 * Math.PI) / NUM_CABINS
                s.angle = Math.round(s.angle / snapStep) * snapStep
            }

            // Update SVG transforms
            if (wheelGroupRef.current) {
                const deg = s.angle * 180 / Math.PI
                wheelGroupRef.current.setAttribute('transform', `translate(450 250) rotate(${deg})`)

                // Keep cabins upright
                const cabins = spokesGroupRef.current?.querySelectorAll<SVGGElement>('.cabinG')
                if (cabins) {
                    cabins.forEach(cg => {
                        const i = Number(cg.getAttribute('data-index'))
                        const theta = (i / NUM_CABINS) * Math.PI * 2 - Math.PI / 2
                        const cx = Math.cos(theta) * CABIN_DIST
                        const cy = Math.sin(theta) * CABIN_DIST
                        cg.setAttribute('transform', `translate(${cx} ${cy}) rotate(${-deg})`)
                    })
                }

                // Lights
                const lights = lightsGroupRef.current?.querySelectorAll<SVGCircleElement>('circle')
                if (lights) {
                    lights.forEach(lt => {
                        const i = Number(lt.getAttribute('data-index'))
                        const hueBase = (i / LIGHT_COUNT) * 360
                        const hueShift = (s.angle * 180 / Math.PI) * 0.4
                        const hue = (hueBase + hueShift) % 360
                        const pulse = 0.7 + 0.3 * Math.sin(s.angle * 3 + i * 0.5)
                        lt.setAttribute('fill', `hsl(${hue},100%,${50 * pulse}%)`)
                    })
                }
            }

            // Update speed label occasionally to avoid too many redirects? No, React state update 60fps might be heavy
            // We'll throttle it or just optimize.
            // For now, let's not update React state for speed every frame.
            // Or using a ref for speed label text content?
            // We will update standard state for now.
            // setCurrentSpeed(s.angVel) -> This is bad for perf.

            reqId = requestAnimationFrame(update)
        }

        reqId = requestAnimationFrame(update)
        return () => cancelAnimationFrame(reqId)
    }, [NUM_CABINS, LIGHT_COUNT]) // dependencies

    // Interaction handlers
    const startPress = (e: React.SyntheticEvent) => {
        e.preventDefault()
        state.current.pressing = true
        setButtonText('BASILI TUTULUYOR...')
        setSelectedCard(null) // Hide previous result
        setCurrentSpeed(0)
    }

    const endPress = (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!state.current.pressing) return

        state.current.pressing = false
        state.current.releaseDecel = -state.current.angVel / stopTime
        setButtonText('DURDURULUYOR...')

        // Calculate result time
        setTimeout(() => {
            showResult()
        }, stopTime * 1000)
    }

    const showResult = () => {
        const idx = getBottomCabinIndex(state.current.angle, NUM_CABINS)
        const card = cards[idx] || null
        setSelectedCard(card)
        setButtonText('TEKRAR ÇEVİR!')
    }

    const handleRate = async (val: number) => {
        if (!selectedCard) return
        setUserRating(val)
        try {
            const res = await fetch(`/api/buckets/${bucketId}/cards/${selectedCard.id}/rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: val })
            })
            const data = await res.json()
            if (res.ok) {
                // Update local state for the card
                const updatedCards = cards.map(c =>
                    c.id === selectedCard.id
                        ? { ...c, averageRating: data.average, ratingCount: data.count }
                        : c
                )
                setCards(updatedCards)
                setSelectedCard({ ...selectedCard, averageRating: data.average, ratingCount: data.count })
            }
        } catch (err) {
            console.error("Rate failed", err)
        }
    }

    const handleShare = () => {
        setShowShareModal(true)
        setCopied(false)
    }

    const copyToClipboard = () => {
        const baseUrl = window.location.origin + window.location.pathname
        const urlWithCard = selectedCard ? `${baseUrl}?cardId=${selectedCard.id}` : window.location.href
        navigator.clipboard.writeText(urlWithCard)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareUrl = typeof window !== 'undefined'
        ? (selectedCard ? `${window.location.origin}${window.location.pathname}?cardId=${selectedCard.id}` : window.location.href)
        : ''

    return (
        <div className={styles.container}>
            <header className={styles.header}>Edebiyat Çarkı</header>
            <div className="absolute text-center top-15 left-1/2 -translate-x-1/2 text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 tracking-tight ">{bucketTitle}</div>

            <div className={styles.grid}>
                {/* Wheel Section */}
                <div className={styles.wheelSection}>
                    <svg id="svgWheel" viewBox="0 0 900 600" className="w-full h-auto" style={{ width: '100%', height: 'auto' }}>
                        <rect x="0" y="0" width="900" height="520" fill="#02102a" />
                        <g ref={starsGroupRef}></g>
                        <rect x="0" y="520" width="900" height="80" fill="#071a28" />
                        <ellipse cx="450" cy="560" rx="160" ry="24" fill="rgba(0,0,0,0.45)" />
                        <g id="legs">
                            <path d="M390 560 L420 280 L438 280 L408 560 Z" fill="var(--leg)" opacity="0.95" style={{ fill: '#2a1b14' }} />
                            <path d="M510 560 L480 280 L462 280 L492 560 Z" fill="var(--leg)" opacity="0.95" style={{ fill: '#2a1b14' }} />
                        </g>

                        <g ref={wheelGroupRef} transform="translate(450 250)">
                            <g ref={lightsGroupRef}></g>
                            <circle cx="0" cy="0" r="180" fill="none" stroke="#0d4a6f" strokeWidth="14" />
                            <circle cx="0" cy="0" r="140" fill="none" stroke="#13364a" strokeWidth="6" />
                            <g ref={spokesGroupRef}></g>
                            <circle cx="0" cy="0" r="20" fill="#0f2b3a" />
                            <circle cx="0" cy="0" r="10" fill="#1b4b68" />
                        </g>
                        <circle cx="450" cy="250" r="22" fill="#071a28" />
                    </svg>
                </div>

                {/* Result Panel */}
                <div className={styles.resultSection}>
                    <h3 className="text-lg font-semibold text-cyan-300 mb-3" style={{ color: '#67e8f9', fontWeight: 600, marginBottom: '0.75rem' }}>Eser Detayı</h3>
                    {!selectedCard ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <p className="text-slate-500 text-sm italic">Çarkı çevirin ve koleksiyonun sürprizlerine hazır olun...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <h4 className="text-xl font-bold text-sky-200 leading-tight">{selectedCard.title}</h4>
                                <div className='flex items-end flex-col shrink-0'>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <span className="text-[10px] text-white/40 mr-1">Ortalama</span>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <svg key={star} className={`w-3 h-3 ${Math.round(selectedCard.averageRating || 0) >= star ? 'fill-current' : 'text-white/10'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="text-[10px] text-white/30 ml-1">({selectedCard.ratingCount || 0})</span>
                                    </div>
                                    {isAuthenticated && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-[10px] text-indigo-300 tracking-tighter mr-1">Puan Ver</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        onClick={() => handleRate(star)}
                                                        onMouseEnter={() => setUserRating(star)}
                                                        onMouseLeave={() => setUserRating(0)}
                                                        className="transition-transform hover:scale-125 focus:outline-none"
                                                    >
                                                        <svg className={`w-3.5 h-3.5 ${userRating >= star ? 'text-amber-400 fill-current' : 'text-white/20'}`} viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all shrink-0 self-start"
                                    title="Paylaş"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col gap-1 mb-6">
                                <span className="text-amber-400 font-bold tracking-widest text-[10px] uppercase">{selectedCard.type}</span>
                                <span className="text-white/60 text-sm italic font-medium">Yazar: {selectedCard.author}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border-t border-white/5 pt-4">
                                <p className="text-slate-300 text-base italic leading-relaxed whitespace-pre-wrap font-serif">
                                    {selectedCard.content}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className={styles.controlsSection}>
                    <button
                        ref={spinBtnRef}
                        className={styles.spinBtn}
                        onMouseDown={startPress}
                        onMouseUp={endPress}
                        onMouseLeave={endPress}
                        onTouchStart={startPress}
                        onTouchEnd={endPress}
                    >
                        {buttonText}
                    </button>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <span><strong>Durma:</strong> {stopTime}s</span>
                    </div>
                    <label className={styles.label} style={{ marginTop: '0.5rem' }}>
                        Süre Ayarı:
                        <input
                            type="range"
                            min="2" max="5" step="0.1"
                            value={stopTime}
                            onChange={(e) => setStopTime(parseFloat(e.target.value))}
                            className="w-full mt-1"
                        />
                    </label>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
                    <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Bu Demeti Paylaş</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Paylaşım Linki</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'}`}
                                    >
                                        {copied ? 'Kopyalandı!' : 'Kopyala'}
                                    </button>
                                </div>
                            </div>
                            <div className="pt-4">
                                <a
                                    href={`mailto:?subject=Edebiyat Çarkı - ${bucketTitle}&body=Harika şiirlerden oluşan bu koleksiyona bir göz at: ${shareUrl}`}
                                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    E-posta ile Gönder
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-4 right-4 text-white/20 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function LiteraryWheel(props: Props) {
    return (
        <Suspense fallback={<div className="text-white">Yükleniyor...</div>}>
            <WheelContent {...props} />
        </Suspense>
    )
}
