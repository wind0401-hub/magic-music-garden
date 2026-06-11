import { useState } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import CaptureScreen from './screens/CaptureScreen'
import GameScreen from './screens/GameScreen'
import GameOverScreen from './screens/GameOverScreen'

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [faceImage, setFaceImage] = useState(null)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(
    () => parseInt(localStorage.getItem('emi_best') || '0')
  )

  const handleCapture = (img) => {
    setFaceImage(img)
    setScreen('game')
  }

  const handleEnd = (finalScore) => {
    setScore(finalScore)
    if (finalScore > bestScore) {
      setBestScore(finalScore)
      localStorage.setItem('emi_best', finalScore)
    }
    setScreen('gameover')
  }

  const handleReplay = () => {
    setScreen('game')
    setScore(0)
  }

  return (
    <div className="app">
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('capture')} />}
      {screen === 'capture' && <CaptureScreen onCapture={handleCapture} />}
      {screen === 'game' && faceImage && (
        <GameScreen key={score} faceImage={faceImage} onEnd={handleEnd} />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          score={score}
          bestScore={bestScore}
          faceImage={faceImage}
          onReplay={handleReplay}
        />
      )}
    </div>
  )
}
