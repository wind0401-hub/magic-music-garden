const speedFactor = () => Math.min(1, 390 / window.innerWidth)

export const createObstacle = (speed) => ({
  id: Date.now() + Math.random(),
  x: 110,
  type: Math.floor(Math.random() * 5), // index → ChibiObstacle
  speed,
})

export const updateObstacles = (obstacles, speed) =>
  obstacles
    .map(o => ({ ...o, x: o.x - speed * 0.4 * speedFactor() }))
    .filter(o => o.x > -10)
