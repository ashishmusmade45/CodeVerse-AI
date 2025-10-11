import { useState, useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    setLoading(true);
    setReview("");

    try {
      const resp = await axios.post("http://localhost:3000/ai/get-review", { code });

      let reviewText = "";
      if (typeof resp.data === "string") {
        reviewText = resp.data;
      } else if (resp.data && typeof resp.data === "object") {
        reviewText = resp.data.review || JSON.stringify(resp.data, null, 2);
      } else {
        reviewText = String(resp.data);
      }

      reviewText = String(reviewText)
        .replace(/\[object Object\]/g, "")
        .replace(/^---.*$/gm, "")
        .replace(/^\+\+\+.*$/gm, "")
        .replace(/^@@.*$/gm, "")
        .trim();

      const codePattern =
        /(function\s+\w+\s*\(.*\)\s*\{[\s\S]*?\})|((const|let|var)\s+\w+\s*=\s*.*;?)/gm;
      if (!reviewText.includes("```")) {
        reviewText = reviewText.replace(codePattern, (match) => {
          return `\n\`\`\`js\n${match.trim()}\n\`\`\`\n`;
        });
      }

      if (!reviewText.trim()) reviewText = "⚠️ No review generated.";
      setReview(reviewText);
    } catch (err) {
      console.error("❌ Review request failed:", err);
      setReview("⚠️ Failed to fetch review. Check your backend or API key.");
    } finally {
      setLoading(false);
    }
  }

  const copyReview = async () => {
    if (!review) return;
    try {
      await navigator.clipboard.writeText(review);
      alert("Copied review to clipboard");
    } catch {
      alert("Copy failed");
    }
  };

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
              onValueChange={(val) => setCode(val)}
              highlight={(code) => Prism.highlight(code, Prism.languages.javascript, "javascript")}
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

          <div
            onClick={() => !loading && reviewCode()}
            className={`review ${loading ? "disabled" : ""}`}
          >
            {loading ? "Analyzing..." : "Review"}
          </div>
        </div>

        <div className="right">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Analyzing your code... Please wait</p>
            </div>
          ) : review ? (
            <div className="review-content">
              <div className="review-header">
                <h2>AI Code Review</h2>
                <button className="copy-btn" onClick={copyReview}>
                  📋 Copy
                </button>
              </div>
              <div className="review-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {review}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="placeholder">💡 Click “Review” to get AI feedback</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
