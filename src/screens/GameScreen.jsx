import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_CONFIG, GAME_DURATION, SPEECHES } from '../config'
import { sounds, speak } from '../audio'
import { usePlayer } from '../game/usePlayer'
import { createObstacle, updateObstacles } from '../game/obstacles'
import { createStar, updateStars, checkStarCollect } from '../game/stars'
import ProgressBar from '../components/ProgressBar'
import ChibiObstacle from '../components/ChibiObstacle'

const CLOUDS = [
  { id: 1, top: '6%',  size: 56, speed: 22, delay: 0 },
  { id: 2, top: '16%', size: 44, speed: 28, delay: 5 },
  { id: 3, top: '3%',  size: 72, speed: 35, delay: 12 },
]
const BUTTERFLIES = [
  { id: 1, top: '28%', speed: 14, delay: 0 },
  { id: 2, top: '40%', speed: 20, delay: 7 },
]
const BG_FLOWERS = ['🌸','🌺','🌼','🌷','🌻','🌸','🌺']

function PrincessCharacter({ faceImage, isHit, isInAir }) {
  return (
    <div className={`chibi ${isHit ? 'chibi-hit' : ''}`}>
      {/* tai thỏ */}
      <div className="bunny-ears">
        <div className="ear ear-left" />
        <div className="ear ear-right" />
        <div className="ear-inner ear-left-inner" />
        <div className="ear-inner ear-right-inner" />
      </div>

      {/* mặt bé */}
      <img src={faceImage} className="face-img" alt="" />

      {/* thân — váy tròn cute */}
      <div className="chibi-body">
        <div className="chibi-dress">
          {/* tay trái */}
          <motion.div className="chibi-arm arm-l"
            animate={isHit ? {} : { rotate: [20, -10, 20] }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
          {/* tay phải */}
          <motion.div className="chibi-arm arm-r"
            animate={isHit ? {} : { rotate: [-10, 20, -10] }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
        </div>
      </div>

      {/* chân */}
      <div className="chibi-legs">
        <motion.div className="chibi-leg"
          animate={isHit ? {} : { rotate: [30, -15, 30], y: [0, -3, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        <motion.div className="chibi-leg"
          animate={isHit ? {} : { rotate: [-15, 30, -15], y: [-3, 0, -3] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </div>

      {isHit && <div className="hit-stars">💫</div>}
    </div>
  )
}

export default function GameScreen({ faceImage, onEnd }) {
  const { stateRef, jump, update: updatePlayer, triggerHit } = usePlayer()
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const [renderState, setRenderState] = useState({
    playerY: GAME_CONFIG.groundY,
    isOnGround: true, isHit: false,
    obstacles: [], stars: [], score: 0,
    timeLeft: GAME_DURATION, collectEffects: [], hitFlash: false,
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

  const handleTap = useCallback((e) => {
    // không nhảy nếu tap vào nút pause
    if (e.target.closest('.pause-btn')) return
    if (pausedRef.current) return
    const jumped = jump()
    if (jumped) {
      sounds.jump()
      const g = gameRef.current
      g.jumpCount++
      if (g.jumpCount % 5 === 0) speak(SPEECHES.jump)
    }
  }, [jump])

  const togglePause = useCallback(() => {
    const next = !pausedRef.current
    pausedRef.current = next
    setPaused(next)
    if (!next) lastTimeRef.current = null // reset dt khi resume
  }, [])

  useEffect(() => {
    speak(SPEECHES.start)
    const loop = (timestamp) => {
      if (!gameRef.current.running) return
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(loop); return }

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

      const prevLen = g.stars.length
      g.stars = checkStarCollect(g.stars, GAME_CONFIG.playerX, stateRef.current.y)
      let hitFlash = false
      if (g.stars.length < prevLen) {
        g.score++
        sounds.star()
        speak(SPEECHES.collectStar)
        const eid = Date.now()
        g.collectEffects = [...g.collectEffects,
          { id: eid, x: GAME_CONFIG.playerX, y: stateRef.current.y, label: '+1' }
        ]
        setTimeout(() => { g.collectEffects = g.collectEffects.filter(e => e.id !== eid) }, 700)
      }

      const ps = stateRef.current
      // chỉ va chạm khi player đang gần mặt đất (không phải đang nhảy cao)
      const isNearGround = ps.y >= GAME_CONFIG.groundY - 6
      const hit = isNearGround && g.obstacles.some(o => {
        const dx = Math.abs(o.x - GAME_CONFIG.playerX)
        return dx < 5
      })
      if (hit) {
        const triggered = triggerHit()
        if (triggered) {
          const prevScore = g.score
          g.score = Math.max(0, g.score - 1)
          sounds.hit(); speak(SPEECHES.hit); hitFlash = true
          if (prevScore > 0) {
            const eid = Date.now()
            g.collectEffects = [...g.collectEffects,
              { id: eid, x: GAME_CONFIG.playerX, y: stateRef.current.y, label: '-1' }
            ]
            setTimeout(() => { g.collectEffects = g.collectEffects.filter(e => e.id !== eid) }, 700)
          }
        }
      }

      setRenderState({
        playerY: ps.y, isOnGround: ps.isOnGround, isHit: ps.isHit,
        obstacles: [...g.obstacles], stars: [...g.stars],
        score: g.score, timeLeft: g.timeLeft,
        collectEffects: [...g.collectEffects], hitFlash,
      })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafRef.current); gameRef.current.running = false }
  }, [])

  const isInAir = renderState.playerY < GAME_CONFIG.groundY - 2
  const playerLeft = isInAir ? GAME_CONFIG.playerX + 3 : GAME_CONFIG.playerX

  return (
    <div className="game-screen" onPointerDown={handleTap}>
      <div className="sky-princess" />
      <div className="rainbow" />

      {CLOUDS.map(c => (
        <motion.div key={c.id} className="cloud" style={{ top: c.top, fontSize: c.size }}
          animate={paused ? {} : { x: ['-15vw', '110vw'] }}
          transition={{ duration: c.speed, repeat: Infinity, ease: 'linear', delay: c.delay }}
        >☁️</motion.div>
      ))}
      {BUTTERFLIES.map(b => (
        <motion.div key={b.id} className="butterfly" style={{ top: b.top }}
          animate={paused ? {} : { x: ['110vw', '-15vw'], y: [0, -15, 8, -10, 0] }}
          transition={{ duration: b.speed, repeat: Infinity, ease: 'linear', delay: b.delay }}
        >🦋</motion.div>
      ))}

      <div className="ground-princess">
        {BG_FLOWERS.map((f, i) => (
          <motion.span key={i} className="ground-flower" style={{ left: `${i * 14 + 2}%` }}
            animate={{ y: [0, -5, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 1.5 + i * 0.25, repeat: Infinity, delay: i * 0.15 }}
          >{f}</motion.span>
        ))}
      </div>

      {/* HUD */}
      <div className="hud">
        <div className="hud-top">
          <ProgressBar remaining={renderState.timeLeft} total={GAME_DURATION} />
          <button className="pause-btn" onPointerDown={togglePause}>
            {paused ? '▶️' : '⏸️'}
          </button>
        </div>
        <div className="score-display">
          <span className="score-icon">💎</span>
          <span className="score-number">{renderState.score}</span>
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

      {/* hiệu ứng thu thập / điểm */}
      <AnimatePresence>
        {renderState.collectEffects.map(e => (
          <motion.div key={e.id} className={`score-popup ${e.label === '-1' ? 'score-minus' : 'score-plus'}`}
            style={{ left: `${e.x}%`, top: `${e.y - 5}%` }}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -40, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >{e.label}</motion.div>
        ))}
      </AnimatePresence>

      {/* flash đỏ khi đụng */}
      <AnimatePresence>
        {renderState.hitFlash && (
          <motion.div className="hit-flash"
            initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* chướng ngại vật chibi */}
      {renderState.obstacles.map(o => (
        <div key={o.id} className="obstacle" style={{ left: `${o.x}%` }}>
          <ChibiObstacle type={o.type} />
        </div>
      ))}

      {/* nhân vật */}
      <motion.div
        className="player-wrap"
        style={{ left: `${playerLeft}%`, top: `${renderState.playerY}%` }}
        animate={renderState.isHit ? { x: [-6, 6, -4, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PrincessCharacter faceImage={faceImage} isHit={renderState.isHit} isInAir={isInAir} />
      </motion.div>

      {/* gợi ý tap */}
      {renderState.timeLeft > GAME_DURATION - 5 && (
        <motion.div className="tap-hint"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >👆</motion.div>
      )}

      {/* màn hình pause */}
      <AnimatePresence>
        {paused && (
          <motion.div className="pause-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="pause-box"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              <div className="pause-emoji">⏸️</div>
              <button className="resume-btn" onPointerDown={togglePause}>▶️</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
