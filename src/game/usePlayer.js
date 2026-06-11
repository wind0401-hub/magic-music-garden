import { useRef, useCallback } from 'react'
import { GAME_CONFIG } from '../config'

export const usePlayer = () => {
  const stateRef = useRef({
    y: GAME_CONFIG.groundY,
    vy: 0,
    isOnGround: true,
    isHit: false,
    hitTimer: 0,
  })

  const jump = useCallback(() => {
    const s = stateRef.current
    if (s.isOnGround && !s.isHit) {
      s.vy = GAME_CONFIG.jumpForce
      s.isOnGround = false
      return true
    }
    return false
  }, [])

  const update = useCallback(() => {
    const s = stateRef.current
    if (s.isHit) {
      s.hitTimer--
      if (s.hitTimer <= 0) s.isHit = false
      return
    }
    s.vy += GAME_CONFIG.gravity
    s.y += s.vy
    if (s.y >= GAME_CONFIG.groundY) {
      s.y = GAME_CONFIG.groundY
      s.vy = 0
      s.isOnGround = true
    }
  }, [])

  const triggerHit = useCallback(() => {
    const s = stateRef.current
    if (!s.isHit) {
      s.isHit = true
      s.hitTimer = 60 // 1 giây (60fps)
      s.vy = GAME_CONFIG.jumpForce * 0.6
      s.isOnGround = false
      return true
    }
    return false
  }, [])

  return { stateRef, jump, update, triggerHit }
}
