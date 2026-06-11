import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BABY_NAME } from '../config'
import { speak } from '../audio'

const FLOATS = ['🌸','🦋','✨','🌺','💫','🎀','🌷','⭐']

export default function CaptureScreen({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [step, setStep] = useState('start')   // start | camera | flash | preview
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (step === 'camera' && streamRef.current && videoRef.current) {
      const video = videoRef.current
      video.srcObject = streamRef.current
      video.play().catch(() => {})
    }
  }, [step])

  const startCamera = useCallback(async () => {
    setError(null)
    const tries = [
      { video: { facingMode: { exact: 'user' } } },
      { video: { facingMode: 'user' } },
      { video: true },
    ]
    let stream = null
    for (const c of tries) {
      try { stream = await navigator.mediaDevices.getUserMedia(c); break } catch {}
    }
    if (!stream) {
      setError('Không mở được camera.\nVào Cài đặt → Safari → Camera → Cho phép')
      return
    }
    streamRef.current = stream
    setStep('camera')
    speak(`${BABY_NAME} ơi, nhìn vào camera rồi nhấn chụp nhé!`)
  }, [])

  const capture = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const size = 400
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
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
    video.srcObject?.getTracks().forEach(t => t.stop())
    setStep('flash')
    setTimeout(() => {
      setPreview(dataUrl)
      setStep('preview')
      speak('Đẹp quá! Bắt đầu chơi thôi!')
    }, 300)
  }, [])

  return (
    <div className="capture-screen">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* phần tử nổi trang trí */}
      {FLOATS.map((f, i) => (
        <motion.div key={i} className="bg-float"
          style={{ left:`${(i*13+5)%95}%`, top:`${(i*17+8)%85}%`, fontSize: 18 + (i%3)*8 }}
          animate={{ y:[0,-18,0], rotate:[0,12,-12,0] }}
          transition={{ duration:3+i*0.4, repeat:Infinity, delay:i*0.3, ease:'easeInOut' }}
        >{f}</motion.div>
      ))}

      <AnimatePresence mode="wait">

        {/* BƯỚC 1: mở camera */}
        {step === 'start' && (
          <motion.div key="start" className="cap-panel"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
          >
            <motion.div className="cap-hero"
              animate={{ y:[0,-12,0] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}
            >🤳</motion.div>
            <div className="cap-title">Chụp ảnh<br/>của {BABY_NAME} nào!</div>
            {error && (
              <div className="camera-error">{error}</div>
            )}
            <motion.button className="cap-btn" onClick={startCamera}
              animate={{ scale:[1,1.06,1] }}
              transition={{ duration:1.5, repeat:Infinity, ease:'easeInOut' }}
              whileTap={{ scale:0.92 }}
            >
              <span className="cap-btn-icon">📸</span>
              <span className="cap-btn-label">{error ? 'Thử lại' : 'Mở camera'}</span>
            </motion.button>
          </motion.div>
        )}

        {/* BƯỚC 2: camera sẵn sàng */}
        {step === 'camera' && (
          <motion.div key="camera" className="cap-panel"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          >
            <div className="cap-title small">Nhìn vào đây rồi nhấn 📸</div>
            <div className="cam-frame">
              <video ref={videoRef} className="camera-video" playsInline muted />
              {/* viền nháy */}
              <motion.div className="cam-ring"
                animate={{ opacity:[0.4,1,0.4], scale:[1,1.03,1] }}
                transition={{ duration:1.2, repeat:Infinity }}
              />
            </div>
            <motion.button className="cap-btn" onClick={capture}
              animate={{ scale:[1,1.08,1] }}
              transition={{ duration:1.2, repeat:Infinity }}
              whileTap={{ scale:0.88 }}
            >
              <span className="cap-btn-icon">📸</span>
              <span className="cap-btn-label">Chụp ngay!</span>
            </motion.button>
          </motion.div>
        )}

        {/* BƯỚC 2.5: flash trắng */}
        {step === 'flash' && (
          <motion.div key="flash" className="cap-flash"
            initial={{ opacity:1 }} animate={{ opacity:0 }}
            transition={{ duration:0.3 }}
          />
        )}

        {/* BƯỚC 3: xem lại ảnh */}
        {step === 'preview' && (
          <motion.div key="preview" className="cap-panel"
            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
          >
            <motion.div className="preview-frame"
              animate={{ y:[0,-8,0] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}
            >
              <img src={preview} className="face-preview" alt="Ảnh bé" />
              {/* confetti nhỏ */}
              {['💖','⭐','✨','🌸'].map((c,i) => (
                <motion.span key={i} className="preview-confetti"
                  style={{ left:`${20+i*20}%` }}
                  animate={{ y:[-10,-40,-10], opacity:[1,0.6,1] }}
                  transition={{ duration:1.5+i*0.3, repeat:Infinity, delay:i*0.2 }}
                >{c}</motion.span>
              ))}
            </motion.div>
            <div className="cap-title small">✨ Đẹp quá {BABY_NAME}! ✨</div>
            <motion.button className="cap-btn green" onClick={() => onCapture(preview)}
              animate={{ scale:[1,1.07,1] }}
              transition={{ duration:1.3, repeat:Infinity }}
              whileTap={{ scale:0.92 }}
            >
              <span className="cap-btn-icon">▶️</span>
              <span className="cap-btn-label">Chơi thôi!</span>
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
