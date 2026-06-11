export default function ProgressBar({ remaining, total }) {
  const pct = (remaining / total) * 100
  const hue = Math.round((pct / 100) * 120) // đỏ → xanh
  return (
    <div className="progress-wrap">
      <div
        className="progress-bar"
        style={{ width: `${pct}%`, background: `hsl(${hue}, 90%, 55%)` }}
      />
      <span className="progress-icon">⏱️</span>
    </div>
  )
}
