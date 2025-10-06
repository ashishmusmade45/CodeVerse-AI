import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <div className="left">
        <div className="code"></div>
        <div className="review">Review</div>
      </div>
      <div className="right"></div>
    </main>
  )
}

export default App
