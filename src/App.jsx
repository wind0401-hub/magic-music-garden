import { useState, useCallback, useRef } from 'react'
import Garden from './Garden'
import { createNote } from './audio'
import './App.css'

export default function App() {
  const [elements, setElements] = useState([])
  const [storm, setStorm] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const bgNodeRef = useRef(null)
  const audioCtxRef = useRef(null)
  const idRef = useRef(0)

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  const handleTap = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const touches = e.touches || e.changedTouches
    const points = touches
      ? Array.from(touches).map(t => ({ x: t.clientX - rect.left, y: t.clientY - rect.top }))
      : [{ x: e.clientX - rect.left, y: e.clientY - rect.top }]

    const ctx = getAudioCtx()

    points.forEach(({ x, y }) => {
      const colorIndex = Math.floor(Math.random() * COLORS.length)
      createNote(ctx, NOTES[colorIndex])

      const id = idRef.current++
      const type = TYPES[Math.floor(Math.random() * TYPES.length)]
      setElements(prev => [...prev.slice(-60), {
        id, x, y, type,
        color: COLORS[colorIndex],
        size: 40 + Math.random() * 40,
        rotation: Math.random() * 360,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
      }])
    })
  }, [])

  const handleElementTap = useCallback((id, colorIndex) => {
    const ctx = getAudioCtx()
    createNote(ctx, NOTES[colorIndex % NOTES.length], 0.8)
    setElements(prev => prev.map(el =>
      el.id === id
        ? { ...el, color: COLORS[(colorIndex + 1) % COLORS.length], bounce: Date.now() }
        : el
    ))
  }, [])

  const triggerStorm = useCallback(() => {
    const ctx = getAudioCtx()
    setStorm(true)
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createNote(ctx, NOTES[i % NOTES.length], 0.6), i * 80)
    }
    setTimeout(() => setStorm(false), 1500)
  }, [])

  const toggleMusic = useCallback(() => {
    const ctx = getAudioCtx()
    if (musicOn) {
      bgNodeRef.current?.stop()
      bgNodeRef.current = null
      setMusicOn(false)
    } else {
      playBgMusic(ctx, bgNodeRef)
      setMusicOn(true)
    }
  }, [musicOn])

  return (
    <div className="app">
      <Garden
        elements={elements}
        storm={storm}
        onTap={handleTap}
        onElementTap={handleElementTap}
      />
      <div className="controls">
        <button className="btn" onClick={toggleMusic} title="Nhạc nền">
          {musicOn ? '🔊' : '🔇'}
        </button>
        <button className="btn storm-btn" onClick={triggerStorm} title="Bão màu">
          🌪️
        </button>
      </div>
      <div className="hint">Chạm vào màn hình ✨</div>
    </div>
  )
}

const COLORS = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#cc5de8', '#f783ac', '#a9e34b']
const NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
const TYPES = ['flower', 'butterfly', 'star', 'bubble', 'heart']

function playBgMusic(ctx, ref) {
  const melody = [261.63, 329.63, 392.00, 329.63]
  let i = 0
  const tick = () => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = melody[i % melody.length]
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
    i++
    ref.current = { stop: () => {} }
    ref._timer = setTimeout(tick, 900)
  }
  tick()
}
