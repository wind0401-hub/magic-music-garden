import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { speak, sounds } from '../audio'
import { SPEECHES } from '../config'

export default function GameOverScreen({ score, bestScore, faceImage, onReplay }) {
  useEffect(() => {
    sounds.win()
    setTimeout(() => speak(SPEECHES.win), 600)
  }, [])

  const confetti = Array.from({ length: 30 })

  return (
    <div className="gameover-screen">
      {confetti.map((_, i) => (
        <motion.div
          key={i}
          className="confetti"
          initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
          animate={{ y: window.innerHeight + 20, opacity: 0 }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1 }}
          style={{ background: `hsl(${Math.random() * 360}, 90%, 60%)` }}
        />
      ))}

      <div className="gameover-content">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.5 }}
        >
          <img src={faceImage} className="face-winner" alt="" />
        </motion.div>

        <div className="trophy">🏆</div>

        <div className="stars-row">
          {Array.from({ length: Math.min(score, 10) }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >⭐</motion.span>
          ))}
        </div>

        {score > bestScore && (
          <motion.div
            className="new-record"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.5 }}
          >
            🥇
          </motion.div>
        )}

        <button className="big-btn" onClick={onReplay}>🔄</button>
      </div>
    </div>
  )
}
