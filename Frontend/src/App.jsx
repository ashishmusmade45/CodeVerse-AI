import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="left">
        <div className="code"></div>
        <div className="review"></div>
      </div>
      <div className="right"></div>
    </>
  )
}

export default App
