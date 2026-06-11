import { useRef, useState, useCallback } from 'react'
import { BABY_NAME } from '../config'
import { speak } from '../audio'

export default function CaptureScreen({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async () => {
    setError(null)
    // thử front camera trước, nếu lỗi thì dùng bất kỳ camera nào
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
      setError('Không mở được camera. Kiểm tra Safari cho phép dùng camera chưa?')
      return
    }
    const video = videoRef.current
    video.srcObject = stream
    video.setAttribute('playsinline', 'true') // iOS bắt buộc
    video.setAttribute('muted', 'true')
    await video.play().catch(() => {})
    setReady(true)
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
    const size = 300
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    // vẽ hình tròn crop
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(video, 0, 0, size, size)
    const dataUrl = canvas.toDataURL('image/png')
    setPreview(dataUrl)
    setCountdown(null)
    // dừng camera
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
