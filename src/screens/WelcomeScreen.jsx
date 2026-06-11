import { motion } from 'framer-motion'
import { speak } from '../audio'
import { useEffect } from 'react'

const FLOATING = ['🦋', '🌸', '✨', '🌺', '💫', '🎀', '🌷', '⭐']

export default function WelcomeScreen({ onStart }) {
  useEffect(() => {
    speak('Chào mừng đến với Cuộc Phiêu Lưu Của Emi!')
  }, [])

  return (
    <div className="welcome-screen">
      {/* phần tử trang trí nổi */}
      {FLOATING.map((f, i) => (
        <motion.div
          key={i}
          className="bg-float"
          style={{
            left: `${(i * 13 + 5) % 95}%`,
            top: `${(i * 17 + 8) % 80}%`,
            fontSize: 20 + (i % 3) * 8,
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        >{f}</motion.div>
      ))}

      <div className="welcome-content">
        {/* logo - chỉ xuất hiện 1 lần */}
        <motion.div
          className="logo-wrap"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
          transition={{
            scale: { type: 'spring', duration: 0.7 },
            opacity: { duration: 0.5 },
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          }}
        >
          <div className="logo-glow" />
          <img src="/logo.jpg" className="logo-img" alt="Gia đình Emi" />
        </motion.div>

        {/* tên game */}
        <motion.div
          className="game-title"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.7, delay: 0.3 }}
        >
          <div className="title-line1">🌸 Cuộc Phiêu Lưu</div>
          <div className="title-line2">Của Emi 🌸</div>
        </motion.div>

        {/* icon flow */}
        <motion.div
          className="welcome-icons"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span>📸</span><span className="arrow">→</span>
          <span>👸</span><span className="arrow">→</span>
          <span>💎</span><span className="arrow">→</span>
          <span>🏆</span>
        </motion.div>

        {/* nút bắt đầu */}
        <motion.button
          className="start-btn"
          onClick={onStart}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.06, 1] }}
          transition={{
            opacity: { delay: 0.9 },
            scale: { delay: 0.9, duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileTap={{ scale: 0.92 }}
        >
          📸
        </motion.button>
        <motion.div
          className="start-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Chụp ảnh để bắt đầu!
        </motion.div>
      </div>
    </div>
  )
}
