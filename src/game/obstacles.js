import { GAME_CONFIG } from '../config'

const TYPES = ['🧁', '🍭', '🎀', '🐛', '🐸']

export const createObstacle = (speed) => ({
  id: Date.now() + Math.random(),
  x: 110,
  type: TYPES[Math.floor(Math.random() * TYPES.length)],
  size: 48 + Math.floor(Math.random() * 24),
  speed,
})

// normalize tốc độ theo iPhone width (390px) để màn hình to không chạy nhanh hơn
const speedFactor = () => Math.min(1, 390 / window.innerWidth)

export const updateObstacles = (obstacles, speed) =>
  obstacles
    .map(o => ({ ...o, x: o.x - speed * 0.4 * speedFactor() }))
    .filter(o => o.x > -10)

export const checkCollision = (obstacles, playerX, playerY, playerSize) => {
  const pw = playerSize * 0.6
  const ph = playerSize * 0.6
  return obstacles.some(o => {
    const ox = o.x
    const oy = GAME_CONFIG.groundY
    const os = o.size * 0.5
    return (
      Math.abs(playerX - ox) < (pw + os) / 2 / 100 * window.innerWidth &&
      Math.abs(playerY - oy) < (ph + os) / 2
    )
  })
}
