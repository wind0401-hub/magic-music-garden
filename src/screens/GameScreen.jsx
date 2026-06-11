import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_CONFIG, GAME_DURATION, SPEECHES } from '../config'
import { sounds, speak } from '../audio'
import { usePlayer } from '../game/usePlayer'
import { createObstacle, updateObstacles } from '../game/obstacles'
import { createStar, updateStars, checkStarCollect } from '../game/stars'
import ProgressBar from '../components/ProgressBar'

const BG_LAYERS = ['🌤️', '🌈', '🏡', '🌳', '🌻']

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
    <div
      className="game-screen"
      onPointerDown={handleTap}
    >
      {/* background */}
      <div className="sky" />
      <div className="ground" />

      {/* HUD */}
      <div className="hud">
        <ProgressBar remaining={renderState.timeLeft} total={GAME_DURATION} />
        <div className="score-display">
          {Array.from({ length: Math.min(renderState.score, 10) }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
      </div>

      {/* ngôi sao */}
      <AnimatePresence>
        {renderState.stars.map(s => (
          <motion.div
            key={s.id}
            className="star-item"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >⭐</motion.div>
        ))}
      </AnimatePresence>

      {/* chướng ngại vật */}
      {renderState.obstacles.map(o => (
        <div
          key={o.id}
          className="obstacle"
          style={{ left: `${o.x}%`, fontSize: o.size }}
        >
          {o.type}
        </div>
      ))}

      {/* nhân vật */}
      <motion.div
        className={`player ${renderState.isHit ? 'hit' : ''}`}
        style={{
          left: `${GAME_CONFIG.playerX}%`,
          top: `${renderState.playerY}%`,
        }}
        animate={renderState.isHit ? { rotate: [-15, 15, -15, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <img src={faceImage} className="face-img" alt="" />
        {/* chân đang chạy */}
        {!renderState.isHit && (
          <div className="legs">
            <motion.span
              animate={{ rotate: [30, -30] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
            >🦵</motion.span>
            <motion.span
              animate={{ rotate: [-30, 30] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
            >🦵</motion.span>
          </div>
        )}
      </motion.div>

      {/* gợi ý tap lúc đầu */}
      {renderState.timeLeft > GAME_DURATION - 5 && (
        <motion.div
          className="tap-hint"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          👆
        </motion.div>
      )}
    </div>
  )
}
