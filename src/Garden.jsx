import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Garden({ elements, storm, onTap, onElementTap }) {
  return (
    <div
      className={`garden ${storm ? 'storm' : ''}`}
      onMouseDown={onTap}
      onTouchStart={onTap}
    >
      <Stars />
      <AnimatePresence>
        {elements.map((el, i) => (
          <Element
            key={el.id}
            el={el}
            colorIndex={i}
            storm={storm}
            onTap={onElementTap}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Stars() {
  return (
    <div className="stars">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="star-bg"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }}
        />
      ))}
    </div>
  )
}

function Element({ el, colorIndex, storm, onTap }) {
  const emoji = {
    flower: '🌸',
    butterfly: '🦋',
    star: '⭐',
    bubble: '🫧',
    heart: '💖',
  }[el.type]

  return (
    <motion.div
      className="element"
      initial={{ scale: 0, x: el.x, y: el.y, opacity: 1 }}
      animate={storm
        ? { scale: [1, 1.4, 0.8, 1.2, 1], rotate: [0, 180, -180, 360], opacity: 1 }
        : {
            scale: [0, 1.3, 1],
            x: el.x + el.vx * 40,
            y: el.y + el.vy * 80,
            opacity: [1, 1, 0],
          }
      }
      exit={{ scale: 0, opacity: 0 }}
      transition={storm
        ? { duration: 1.5, ease: 'easeInOut' }
        : { duration: 3, ease: 'easeOut' }
      }
      style={{
        fontSize: el.size,
        filter: `drop-shadow(0 0 12px ${el.color})`,
      }}
      onMouseDown={(e) => { e.stopPropagation(); onTap(el.id, colorIndex) }}
      onTouchStart={(e) => { e.stopPropagation(); onTap(el.id, colorIndex) }}
    >
      {emoji}
    </motion.div>
  )
}
