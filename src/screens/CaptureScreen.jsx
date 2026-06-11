import { useRef, useState, useCallback } from 'react'
import { BABY_NAME } from '../config'
import { speak } from '../audio'

export default function CaptureScreen({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [preview, setPreview] = useState(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 400, height: 400 }
      })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setReady(true)
      speak(`${BABY_NAME} ơi, nhìn vào camera nào!`)
    } catch {
      speak('Không mở được camera, thử lại nhé!')
    }
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
        <button className="big-btn" onClick={startCamera}>
          📸
        </button>
      )}

      {ready && !preview && (
        <div className="camera-wrap">
          <video ref={videoRef} className="camera-video" playsInline muted />
          {countdown !== null ? (
            <div className="countdown">{countdown || '😊'}</div>
          ) : (
            <button className="shutter-btn" onClick={startCountdown}>📸</button>
          )}
        </div>
      )}

      {preview && (
        <div className="preview-wrap">
          <img src={preview} className="face-preview" alt="Ảnh bé" />
          <button className="big-btn play-btn" onClick={() => onCapture(preview)}>▶️</button>
        </div>
      )}
    </div>
  )
}
