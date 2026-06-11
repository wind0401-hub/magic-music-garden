import { useRef, useState, useCallback, useEffect } from 'react'
import { BABY_NAME } from '../config'
import { speak } from '../audio'

export default function CaptureScreen({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  // gắn stream vào video SAU KHI video element đã mount
  useEffect(() => {
    if (ready && streamRef.current && videoRef.current) {
      const video = videoRef.current
      video.srcObject = streamRef.current
      video.play().catch(() => {})
    }
  }, [ready])

  const startCamera = useCallback(async () => {
    setError(null)
    const constraints = [
      { video: { facingMode: { exact: 'user' } } },
      { video: { facingMode: 'user' } },
      { video: true },
    ]
    let stream = null
    for (const c of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c)
        break
      } catch {}
    }
    if (!stream) {
      setError('Không mở được camera. Vào Cài đặt → Safari → Camera → Cho phép')
      return
    }
    streamRef.current = stream
    setReady(true) // render video element trước, useEffect sẽ gắn stream sau
    speak(`${BABY_NAME} ơi, nhìn vào camera nào!`)
  }, [])

  const startCountdown = useCallback(() => {
    speak('Ba, hai, một, cười lên nào!')
    let count = 3
    setCountdown(count)
    const timer = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(timer)
        capture()
      }
    }, 1000)
  }, [])

  const capture = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const size = 400
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // crop chính giữa video để không bị méo (center-crop)
    const vw = video.videoWidth || video.clientWidth
    const vh = video.videoHeight || video.clientHeight
    const side = Math.min(vw, vh)
    const sx = (vw - side) / 2
    const sy = (vh - side) / 2

    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size)

    const dataUrl = canvas.toDataURL('image/png')
    setPreview(dataUrl)
    setCountdown(null)
    video.srcObject?.getTracks().forEach(t => t.stop())
    speak('Đẹp quá! Bắt đầu chơi thôi!')
  }, [])

  return (
    <div className="capture-screen">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!ready && !preview && (
        <div className="capture-start">
          <div className="capture-instruction">
            <div className="ci-icon">🤳</div>
            <div className="ci-text">Nhìn vào camera</div>
          </div>
          {error && <div className="camera-error">⚠️ {error}</div>}
          <button className="open-camera-btn" onClick={startCamera}>
            📸
            <span>{error ? 'Thử lại' : 'Mở camera'}</span>
          </button>
        </div>
      )}

      {ready && !preview && (
        <div className="camera-wrap">
          <video ref={videoRef} className="camera-video" playsInline muted />
          {countdown !== null ? (
            <div className="countdown">{countdown > 0 ? countdown : '😄'}</div>
          ) : (
            <>
              <div className="camera-hint">👆 Nhấn để chụp!</div>
              <button className="shutter-btn" onClick={startCountdown}>📸</button>
            </>
          )}
        </div>
      )}

      {preview && (
        <div className="preview-wrap">
          <div className="preview-label">✨ Đẹp quá! ✨</div>
          <img src={preview} className="face-preview" alt="Ảnh bé" />
          <button className="open-camera-btn green" onClick={() => onCapture(preview)}>
            ▶️
            <span>Chơi thôi!</span>
          </button>
        </div>
      )}
    </div>
  )
}
