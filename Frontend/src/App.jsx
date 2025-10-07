import { useState, useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // ✅ For GitHub-style markdown (tables, lists)
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight"; // ✅ Syntax highlighting

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    setLoading(true);
    setReview("🧠 Analyzing your code... please wait.");

    try {
      const response = await axios.post("http://localhost:3000/ai/get-review", { code });

      let reviewText;
      // ✅ Handle different response formats
      if (typeof response.data === "object") {
        if (response.data.review) {
          reviewText = response.data.review;
        } else {
          reviewText = "```json\n" + JSON.stringify(response.data, null, 2) + "\n```";
        }
      } else {
        reviewText = response.data;
      }

      // ✅ Clean up unwanted sections like "Confidence Rating"
      reviewText = reviewText.replace(/Confidence Rating:[\s\S]*?(\n|$)/gi, "");

      setReview(reviewText);
    } catch (error) {
      console.error("❌ Review request failed:", error);
      setReview("⚠️ Failed to fetch review. Check your backend or API key.");
    } finally {
      setLoading(false);
    }
  }

  function copyReview() {
    navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="app-wrapper">
      {/* ---------- Navbar ---------- */}
      <nav className="navbar">
        <h1 className="logo">
          <span className="white">CodeVerse</span>
          <span className="violet">-AI</span>
        </h1>
      </nav>

      {/* ---------- Main Layout ---------- */}
      <main className="main">
        {/* ---------- Left Panel (Editor) ---------- */}
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
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
          <div onClick={reviewCode} className="review">
            {loading ? "Reviewing..." : "Review"}
          </div>
        </div>

        {/* ---------- Right Panel (AI Review Output) ---------- */}
        <div className="right">
          {review ? (
            <div className="review-output">
              <button className="copy-btn" onClick={copyReview}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="code-block">
                        <pre className={className}>
                          <code {...props}>{children}</code>
                        </pre>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {review}
              </ReactMarkdown>
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
