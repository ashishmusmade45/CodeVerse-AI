import { useState, useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);

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
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                Prism.highlight(code, Prism.languages.javascript, "javascript")
              }
              padding={20}
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 16,
                color: "#f8f8f2",
                backgroundColor: "#000",
                height: "100%",
                width: "100%",
                border: "none",
                outline: "none",
                overflowY: "auto",
                borderRadius: "0.8rem",
                lineHeight: "1.5rem",
                caretColor: "#8b5cf6",
              }}
            />
          </div>

          <div className="review">Review</div>
        </div>

        <div className="right"></div>
      </main>
    </div>
  );
}

export default App;
