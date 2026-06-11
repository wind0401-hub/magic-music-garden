// Chibi CSS obstacles — không dùng emoji xấu

function Mushroom() {
  return (
    <div className="chibi-obs mushroom">
      <div className="mush-cap">
        <div className="mush-dot" /><div className="mush-dot" /><div className="mush-dot" />
      </div>
      <div className="mush-face"><span>👀</span></div>
      <div className="mush-stem" />
    </div>
  )
}

function CuteRock() {
  return (
    <div className="chibi-obs rock">
      <div className="rock-body">
        <span className="rock-eyes">• •</span>
        <span className="rock-mouth">‿</span>
      </div>
    </div>
  )
}

function CuteFlower() {
  return (
    <div className="chibi-obs flower-obs">
      <div className="fl-head">🌺</div>
      <div className="fl-stem" />
      <div className="fl-leaf" />
    </div>
  )
}

function CuteBee() {
  return (
    <div className="chibi-obs bee">
      <div className="bee-body">
        <div className="bee-stripe" /><div className="bee-stripe" />
        <span className="bee-face">😄</span>
      </div>
      <div className="bee-wings">
        <div className="wing" /><div className="wing" />
      </div>
    </div>
  )
}

function CuteCloud() {
  return (
    <div className="chibi-obs cloud-obs">
      <div className="cloud-body">
        <span className="cloud-face">😤</span>
      </div>
    </div>
  )
}

const COMPONENTS = [Mushroom, CuteRock, CuteFlower, CuteBee, CuteCloud]

export default function ChibiObstacle({ type }) {
  const Comp = COMPONENTS[type % COMPONENTS.length]
  return <Comp />
}
