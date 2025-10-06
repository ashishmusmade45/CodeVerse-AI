import { useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

function App() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <h1 className="logo">
          <span className="white">CodeVerse</span>
          <span className="violet">-AI</span>
        </h1>
      </nav>

      <main className="main">
        <div className="left">
          <div className="code">
            <pre>
              <code className="language-javascript">{`function sum() {
  return 1 + 1;
}`}</code>
            </pre>
          </div>
          <div className="review">Review</div>
        </div>

        <div className="right"></div>
      </main>
    </div>
  );
}

export default App;
