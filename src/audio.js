let audioCtx = null

const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

const playTone = (freq, type, duration, volume = 0.4) => {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export const sounds = {
  jump: () => {
    playTone(400, 'sine', 0.15)
    setTimeout(() => playTone(600, 'sine', 0.1), 80)
  },
  star: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.2, 0.3), i * 80))
  },
  hit: () => {
    playTone(200, 'sawtooth', 0.3, 0.3)
    setTimeout(() => playTone(150, 'sawtooth', 0.3, 0.2), 150)
  },
  win: () => {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.4), i * 120))
  },
}

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const speak = (textOrArray) => {
  const text = Array.isArray(textOrArray) ? pickRandom(textOrArray) : textOrArray
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'vi-VN'
  utter.rate = 0.9
  utter.pitch = 1.1
  window.speechSynthesis.speak(utter)
}
