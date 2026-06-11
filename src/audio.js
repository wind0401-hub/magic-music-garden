export function createNote(ctx, frequency, volume = 0.5) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const reverb = ctx.createGain()

  osc.connect(gain)
  gain.connect(reverb)
  reverb.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.3)

  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

  reverb.gain.setValueAtTime(0.3, ctx.currentTime)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 1.2)
}
