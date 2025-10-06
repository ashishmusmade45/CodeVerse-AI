import {useState, useEffect } from 'react';
import './App.css';
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";


function App() {
  const [count, setCount] = useState(0)

useEffect(()=>{
  Prism.highlightAll()
})

  return (
    <main>
      <div className="left">
        <div className="code">
          <pre>
            <code className="language-javascript">
                
            </code>
          </pre>
        </div>
        <div className="review">Review</div>
      </div>
      <div className="right"></div>
    </main>
  )
}

export default App
