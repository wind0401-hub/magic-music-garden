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
  { id: 1, top: '30%', speed: 14, delay: 0 },
  { id: 2, top: '42%', speed: 18, delay: 6 },
]
const BG_FLOWERS = ['🌸', '🌺', '🌼', '🌷', '🌻']

export default function GameScreen({ faceImage, onEnd }) {
  const { stateRef, jump, update: updatePlayer, triggerHit } = usePlayer()
  const [renderState, setRenderState] = useState({
    playerY: GAME_CONFIG.groundY,
    isHit: false,
    obstacles: [],
    stars: [],
    score: 0,
    timeLeft: GAME_DURATION,
  })
  const gameRef = useRef({
    obstacles: [],
    stars: [],
    score: 0,
    timeLeft: GAME_DURATION,
    speed: GAME_CONFIG.gameSpeed,
    lastObstacle: 0,
    lastStar: 0,
    lastEncourage: 0,
    running: true,
    jumpCount: 0,
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

      // thời gian
      secondAccRef.current += dt
      if (secondAccRef.current >= 1000) {
        secondAccRef.current -= 1000
        g.timeLeft--
        // tăng tốc mỗi 30 giây
        if ((GAME_DURATION - g.timeLeft) % 30 === 0 && g.timeLeft > 0) {
          g.speed = Math.min(g.speed + GAME_CONFIG.speedIncrement, 8)
        }
        // động viên mỗi 30 giây
        if ((GAME_DURATION - g.timeLeft) % 30 === 0) speak(SPEECHES.encouragement)
        if (g.timeLeft <= 0) {
          g.running = false
          onEnd(g.score)
          return
        }
      }

      updatePlayer()

      // tạo chướng ngại vật
      if (timestamp - g.lastObstacle > GAME_CONFIG.obstacleInterval) {
        g.obstacles = [...g.obstacles, createObstacle(g.speed)]
        g.lastObstacle = timestamp
      }
      // tạo sao
      if (timestamp - g.lastStar > GAME_CONFIG.starInterval) {
        g.stars = [...g.stars, createStar()]
        g.lastStar = timestamp
      }

      g.obstacles = updateObstacles(g.obstacles, g.speed)
      g.stars = updateStars(g.stars, g.speed)

      // check thu thập sao
      const beforeCount = g.stars.length
      g.stars = checkStarCollect(g.stars, GAME_CONFIG.playerX, stateRef.current.y)
      if (g.stars.length < beforeCount) {
        g.score++
        sounds.star()
        speak(SPEECHES.collectStar)
      }

      // check va chạm (đơn giản dựa theo khoảng cách)
      const ps = stateRef.current
      const hit = g.obstacles.some(o => {
        const dx = Math.abs(o.x - GAME_CONFIG.playerX)
        const dy = Math.abs(ps.y - GAME_CONFIG.groundY)
        return dx < 7 && dy < 10
      })
      if (hit) {
        const triggered = triggerHit()
        if (triggered) {
          sounds.hit()
          speak(SPEECHES.hit)
        }
      }

      setRenderState({
        playerY: ps.y,
        isHit: ps.isHit,
        obstacles: [...g.obstacles],
        stars: [...g.stars],
        score: g.score,
        timeLeft: g.timeLeft,
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      gameRef.current.running = false
    }
  }, [])

  return (
    <div className="game-screen" onPointerDown={handleTap}>

      {/* background bầu trời công chúa */}
      <div className="sky-princess" />

      {/* cầu vồng */}
      <div className="rainbow" />

      {/* mây bay */}
      {CLOUDS.map(c => (
        <motion.div
          key={c.id}
          className="cloud"
          style={{ top: c.top, fontSize: c.size }}
          animate={{ x: ['-15vw', '110vw'] }}
          transition={{ duration: c.speed, repeat: Infinity, ease: 'linear', delay: c.delay }}
        >☁️</motion.div>
      ))}

      {/* bướm bay */}
      {BUTTERFLIES.map(b => (
        <motion.div
          key={b.id}
          className="butterfly"
          style={{ top: b.top }}
          animate={{ x: ['110vw', '-15vw'], y: [0, -20, 10, -15, 0] }}
          transition={{ duration: b.speed, repeat: Infinity, ease: 'linear', delay: b.delay }}
        >🦋</motion.div>
      ))}

      {/* hoa trang trí mặt đất */}
      <div className="ground-princess">
        {BG_FLOWERS.map((f, i) => (
          <motion.span
            key={i}
            className="ground-flower"
            style={{ left: `${i * 22 + 5}%` }}
            animate={{ y: [0, -6, 0], rotate: [-8, 8, -8] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
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

      {/* ngôi sao / tim thu thập */}
      <AnimatePresence>
        {renderState.stars.map(s => (
          <motion.div
            key={s.id}
            className="star-item"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >💎</motion.div>
        ))}
      </AnimatePresence>

      {/* chướng ngại vật */}
      {renderState.obstacles.map(o => (
        <div
          key={o.id}
          className="obstacle"
          style={{ left: `${o.x}%`, fontSize: o.size }}
        >{o.type}</div>
      ))}

      {/* nhân vật công chúa */}
      <motion.div
        className={`player ${renderState.isHit ? 'hit' : ''}`}
        style={{ left: `${GAME_CONFIG.playerX}%`, top: `${renderState.playerY}%` }}
        animate={renderState.isHit ? { rotate: [-12, 12, -12, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* vương miện */}
        <div className="crown">👑</div>
        {/* mặt bé */}
        <img src={faceImage} className="face-img" alt="" />
        {/* thân công chúa */}
        <motion.div
          className="princess-body"
          animate={renderState.isHit ? {} : { y: [0, -2, 0] }}
          transition={{ duration: 0.25, repeat: Infinity, repeatType: 'reverse' }}
        >👗</motion.div>
      </motion.div>

      {/* gợi ý tap lúc đầu */}
      {renderState.timeLeft > GAME_DURATION - 5 && (
        <motion.div
          className="tap-hint"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >👆</motion.div>
      )}
    </div>
  )
}
