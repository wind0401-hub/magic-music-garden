import { motion } from 'framer-motion'
import { speak } from '../audio'
import { useEffect } from 'react'

export default function WelcomeScreen({ onStart }) {
  useEffect(() => {
    speak('Chào mừng đến với Cuộc Phiêu Lưu Của Emi!')
  }, [])

  return (
    <div className="welcome-screen">
      {/* nền sao */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-star"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        >⭐</motion.div>
      ))}

      <div className="welcome-content">
        {/* logo nhân vật placeholder */}
        <motion.div
          className="welcome-hero"
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏃‍♀️
        </motion.div>

        {/* tên game */}
        <motion.div
          className="game-title"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          <div className="title-line1">🌟 Cuộc Phiêu Lưu</div>
          <div className="title-line2">Của Emi 🌟</div>
        </motion.div>

        {/* mô tả bằng icon */}
        <motion.div
          className="welcome-icons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span>📸</span>
          <span className="arrow">→</span>
          <span>🏃</span>
          <span className="arrow">→</span>
          <span>⭐</span>
          <span className="arrow">→</span>
          <span>🏆</span>
        </motion.div>

        {/* nút bắt đầu */}
        <motion.button
          className="start-btn"
          onClick={onStart}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.92 }}
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            📸
          </motion.span>
        </motion.button>
        <motion.div
          className="start-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Chụp ảnh để bắt đầu!
        </motion.div>
      </div>
    </div>
  )
}
