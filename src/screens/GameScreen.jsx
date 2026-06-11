import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_CONFIG, GAME_DURATION, SPEECHES } from '../config'
import { sounds, speak } from '../audio'
import { usePlayer } from '../game/usePlayer'
import { createObstacle, updateObstacles } from '../game/obstacles'
import { createStar, updateStars, checkStarCollect } from '../game/stars'
import ProgressBar from '../components/ProgressBar'

const CLOUDS = [
  { id: 1, top: '6%',  size: 56, speed: 22, delay: 0 },
  { id: 2, top: '16%', size: 44, speed: 28, delay: 5 },
  { id: 3, top: '3%',  size: 72, speed: 35, delay: 12 },
]
const BUTTERFLIES = [
  { id: 1, top: '28%', speed: 14, delay: 0 },
  { id: 2, top: '40%', speed: 20, delay: 7 },
]
const BG_FLOWERS = ['🌸', '🌺', '🌼', '🌷', '🌻', '🌸', '🌺']

export default function GameScreen({ faceImage, onEnd }) {
  const { stateRef, jump, update: updatePlayer, triggerHit } = usePlayer()
  const [renderState, setRenderState] = useState({
    playerY: GAME_CONFIG.groundY,
    isOnGround: true,
    isHit: false,
    obstacles: [],
    stars: [],
    score: 0,
    timeLeft: GAME_DURATION,
    collectEffects: [],
    hitFlash: false,
  })
  const gameRef = useRef({
    obstacles: [], stars: [], score: 0,
    timeLeft: GAME_DURATION, speed: GAME_CONFIG.gameSpeed,
    lastObstacle: 0, lastStar: 0, running: true, jumpCount: 0,
    collectEffects: [],
  })
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const secondAccRef = useRef(0)

  const handleTap = useCallback(() => {
    const jumped = jump()
    if (jumped) {
      sounds.jump()
      const g = gameRef.current
      g.jumpCount++
      if (g.jumpCount % 5 === 0) speak(SPEECHES.jump)
    }
  }, [jump])

  useEffect(() => {
    speak(SPEECHES.start)
    const loop = (timestamp) => {
      if (!gameRef.current.running) return
      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16
      lastTimeRef.current = timestamp
      const g = gameRef.current

      secondAccRef.current += dt
      if (secondAccRef.current >= 1000) {
        secondAccRef.current -= 1000
        g.timeLeft--
        if ((GAME_DURATION - g.timeLeft) % 30 === 0 && g.timeLeft > 0) {
          g.speed = Math.min(g.speed + GAME_CONFIG.speedIncrement, 8)
          speak(SPEECHES.encouragement)
        }
        if (g.timeLeft <= 0) { g.running = false; onEnd(g.score); return }
      }

      updatePlayer()

      if (timestamp - g.lastObstacle > GAME_CONFIG.obstacleInterval) {
        g.obstacles = [...g.obstacles, createObstacle(g.speed)]
        g.lastObstacle = timestamp
      }
      if (timestamp - g.lastStar > GAME_CONFIG.starInterval) {
        g.stars = [...g.stars, createStar()]
        g.lastStar = timestamp
      }

      g.obstacles = updateObstacles(g.obstacles, g.speed)
      g.stars = updateStars(g.stars, g.speed)

      // thu thập kim cương → hiệu ứng nổ tung
      const prevStars = g.stars
      g.stars = checkStarCollect(g.stars, GAME_CONFIG.playerX, stateRef.current.y)
      if (g.stars.length < prevStars.length) {
        g.score++
        sounds.star()
        speak(SPEECHES.collectStar)
        g.collectEffects = [...g.collectEffects, { id: Date.now(), x: GAME_CONFIG.playerX, y: stateRef.current.y }]
        setTimeout(() => {
          g.collectEffects = g.collectEffects.filter(e => e.id !== g.collectEffects[0]?.id)
        }, 800)
      }

      // va chạm → hiệu ứng flash đỏ
      const ps = stateRef.current
      let hitFlash = false
      const hit = g.obstacles.some(o => {
        const dx = Math.abs(o.x - GAME_CONFIG.playerX)
        const dy = Math.abs(ps.y - GAME_CONFIG.groundY)
        return dx < 7 && dy < 10
      })
      if (hit) {
        const triggered = triggerHit()
        if (triggered) { sounds.hit(); speak(SPEECHES.hit); hitFlash = true }
      }

      setRenderState({
        playerY: ps.y,
        isOnGround: ps.isOnGround,
        isHit: ps.isHit,
        obstacles: [...g.obstacles],
        stars: [...g.stars],
        score: g.score,
        timeLeft: g.timeLeft,
        collectEffects: [...g.collectEffects],
        hitFlash,
      })

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafRef.current); gameRef.current.running = false }
  }, [])

  // nhảy thì tiến về phía trước chút
  const isInAir = renderState.playerY < GAME_CONFIG.groundY - 2
  const playerLeft = isInAir
    ? GAME_CONFIG.playerX + 3
    : GAME_CONFIG.playerX

  return (
    <div className="game-screen" onPointerDown={handleTap}>

      {/* sky - chỉ phần trên, không đè ground */}
      <div className="sky-princess" />

      {/* cầu vồng */}
      <div className="rainbow" />

      {/* mây */}
      {CLOUDS.map(c => (
        <motion.div key={c.id} className="cloud" style={{ top: c.top, fontSize: c.size }}
          animate={{ x: ['-15vw', '110vw'] }}
          transition={{ duration: c.speed, repeat: Infinity, ease: 'linear', delay: c.delay }}
        >☁️</motion.div>
      ))}

      {/* bướm - chỉ bay trong vùng sky */}
      {BUTTERFLIES.map(b => (
        <motion.div key={b.id} className="butterfly" style={{ top: b.top }}
          animate={{ x: ['110vw', '-15vw'], y: [0, -15, 8, -10, 0] }}
          transition={{ duration: b.speed, repeat: Infinity, ease: 'linear', delay: b.delay }}
        >🦋</motion.div>
      ))}

      {/* ground với hoa — z-index cao hơn sky */}
      <div className="ground-princess">
        {BG_FLOWERS.map((f, i) => (
          <motion.span key={i} className="ground-flower"
            style={{ left: `${i * 14 + 2}%` }}
            animate={{ y: [0, -5, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 1.5 + i * 0.25, repeat: Infinity, delay: i * 0.15 }}
          >{f}</motion.span>
        ))}
      </div>

      {/* HUD */}
      <div className="hud">
        <ProgressBar remaining={renderState.timeLeft} total={GAME_DURATION} />
        <div className="score-display">
          {Array.from({ length: Math.min(renderState.score, 10) }).map((_, i) => (
            <span key={i}>💖</span>
          ))}
        </div>
      </div>

      {/* kim cương */}
      <AnimatePresence>
        {renderState.stars.map(s => (
          <motion.div key={s.id} className="star-item"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ scale: 0 }} exit={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >💎</motion.div>
        ))}
      </AnimatePresence>

      {/* hiệu ứng thu thập kim cương */}
      <AnimatePresence>
        {renderState.collectEffects.map(e => (
          <motion.div key={e.id} className="collect-burst"
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >✨💎✨</motion.div>
        ))}
      </AnimatePresence>

      {/* hiệu ứng đụng chướng ngại — flash đỏ */}
      <AnimatePresence>
        {renderState.hitFlash && (
          <motion.div className="hit-flash"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* chướng ngại vật */}
      {renderState.obstacles.map(o => (
        <div key={o.id} className="obstacle" style={{ left: `${o.x}%` }}>{o.type}</div>
      ))}

      {/* NHÂN VẬT CÔNG CHÚA */}
      <motion.div
        className={`player ${renderState.isHit ? 'hit' : ''}`}
        style={{ left: `${playerLeft}%`, top: `${renderState.playerY}%` }}
        animate={renderState.isHit
          ? { rotate: [-15, 15, -15, 0], x: [-4, 4, -4, 0] }
          : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* vương miện */}
        <div className="crown">👑</div>

        {/* mặt bé */}
        <div className="face-row">
          {/* tay trái */}
          <motion.span className="arm arm-left"
            animate={renderState.isHit ? { rotate: 0 } : { rotate: [30, -20, 30] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >🤚</motion.span>

          <img src={faceImage} className="face-img" alt="" />

          {/* tay phải */}
          <motion.span className="arm arm-right"
            animate={renderState.isHit ? { rotate: 0 } : { rotate: [-20, 30, -20] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >🤚</motion.span>
        </div>

        {/* váy hồng */}
        <div className="princess-dress">👗</div>

        {/* chân chạy */}
        {!renderState.isHit && (
          <div className="legs">
            <motion.span
              animate={{ rotate: [40, -20, 40], y: [0, -4, 0] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            >🦵</motion.span>
            <motion.span
              animate={{ rotate: [-20, 40, -20], y: [-4, 0, -4] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            >🦵</motion.span>
          </div>
        )}
        {renderState.isHit && <div className="legs">😵</div>}
      </motion.div>

      {/* gợi ý tap */}
      {renderState.timeLeft > GAME_DURATION - 5 && (
        <motion.div className="tap-hint"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >👆</motion.div>
      )}
    </div>
  )
}
