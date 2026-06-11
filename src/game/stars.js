export const createStar = () => ({
  id: Date.now() + Math.random(),
  x: 110,
  y: 30 + Math.random() * 35,
  collected: false,
})

const speedFactor = () => Math.min(1, 390 / window.innerWidth)

export const updateStars = (stars, speed) =>
  stars
    .map(s => ({ ...s, x: s.x - speed * 0.35 * speedFactor() }))
    .filter(s => s.x > -10 && !s.collected)

export const checkStarCollect = (stars, playerX, playerY) =>
  stars.map(s => {
    const dist = Math.hypot(playerX - s.x, playerY - s.y)
    return dist < 8 ? { ...s, collected: true } : s
  })
