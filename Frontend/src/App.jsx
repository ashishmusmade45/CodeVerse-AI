import { useState, useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";


function getReviewUrl() {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return base ? `${base}/ai/get-review` : "/ai/get-review";
}

function backendUnreachableHelp() {
  return [
    "**Nothing is listening on port 3000.** The Vite proxy forwards `/ai` to `http://localhost:3000`. If the API is stopped, the proxy fails (you may see `ECONNREFUSED` in the terminal) and the browser often gets HTTP **500** with no JSON body.",
    "",
    "**Fix:** start the backend, then run review again.",
    "",
    "1. In a terminal: `cd Backend` → `npm start`",
    "2. Wait for: `Server is running on port: 3000`",
    "3. Keep that terminal open while you use the app",
    "",
    "**Or** from the repo root (after `npm install` there): `npm run dev` — starts API + Vite together.",
  ].join("\n");
}

function isLikelyViteProxyFailure(status, data) {
  if (status === 502 || status === 503 || status === 504) return true;
  if (status !== 500) return false;
  const hasJsonError =
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof data.error === "string" &&
    data.error.length > 0;
  if (hasJsonError) return false;
  if (data == null || data === "") return true;
  if (typeof data === "string") {
    const s = data.trim();
    if (s.startsWith("<")) return true;
    if (/proxy error|econnrefused/i.test(s)) return true;
  }
  return !hasJsonError;
}

function formatReviewError(err) {
  if (axios.isAxiosError(err)) {
    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      return backendUnreachableHelp();
    }
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 404) {
      return [
        "**API route not found.**",
        "",
        "If you are using `vite preview` or hosting only the static frontend, set **`VITE_API_URL`** in a `.env` file to your backend base URL (example: `http://localhost:3000`).",
      ].join("\n");
    }

    if (status != null && isLikelyViteProxyFailure(status, data)) {
      return backendUnreachableHelp();
    }

    const serverText =
      data && typeof data === "object" && data.error != null
        ? String(data.error)
        : typeof data === "string"
          ? data
          : data != null
            ? JSON.stringify(data)
            : "";
    if (status && serverText) {
      return `**Request failed (${status}).** ${serverText}`;
    }
    if (status) {
      return `**Request failed (${status}).** Try again or check the backend logs.`;
    }
  }
  const msg = err?.message ? String(err.message) : String(err);
  return `**Something went wrong.** ${msg}`;
}

const EDITOR_STYLE = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: 15,
  color: "#e2e8f0",
  minHeight: "100%",
  backgroundColor: "transparent",
  lineHeight: 1.65,
  caretColor: "#22d3ee",
};

function App() {
  const [promptText, setPromptText] = useState("Review my code and find any bugs.");
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("javascript"); // Default language

  const languages = [
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
    { label: "HTML", value: "html" },
    { label: "CSS", value: "css" },
  ];

  const {getToken} = useAuth();

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    setLoading(true);
    setReview("");

    try {
      const token = await getToken();
      const resp = await axios.post(
        getReviewUrl(), 
        { prompt: promptText, code, language },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


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

      if (!reviewText.trim()) reviewText = "No review was returned. Try again or check your prompt.";
      setReview(reviewText);
    } catch (err) {
      console.error("Review request failed:", err);
      setReview(formatReviewError(err));
    } finally {
      setLoading(false);
    }
  }

  const copyReview = async () => {
    if (!review) return;
    try {
      await navigator.clipboard.writeText(review);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="navbar" role="banner">
        <div className="navbar-inner">
          
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">CodeVerse</span>
            <span className="brand-suffix">AI</span>
          </div>

          <p className="tagline" style={{ marginRight: 'auto', marginLeft: '1rem' }}>
            AI code review
          </p>

        
          <div className="auth-buttons">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

        </div>
      </header>

      <main className="main">
        <section className="panel panel-editor" aria-label="Code editor">
          <div className="panel-head">
            <span className="panel-title">Editor</span>
            <select 
              className="lang-selector" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="prompt-container">
            <input 
              className="prompt-input" 
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Find the bug in my logic or focus on time complexity..."
            />
          </div>
          <div className="editor-shell">
            <div className="code">
              <Editor
                value={code}
                onValueChange={(val) => setCode(val)}
                highlight={(c) => Prism.highlight(c, Prism.languages[language] || Prism.languages.javascript, language)}
                padding={20}
                style={EDITOR_STYLE}
              />
            </div>
          </div>
          <div className="panel-footer">
            <button
              type="button"
              className={`btn-primary ${loading ? "is-loading" : ""}`}
              onClick={() => !loading && reviewCode()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  Run review
                </>
              )}
            </button>
          </div>
        </section>

        <section className="panel panel-review" aria-label="AI review output">
          <div className="panel-head">
            <span className="panel-title">Review</span>
            {review && !loading && (
              <button type="button" className="btn-ghost" onClick={copyReview}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="review-scroll">
            {loading ? (
              <div className="loading-container">
                <div className="spinner" role="status" aria-label="Loading" />
                <p className="loading-title">Analyzing your code</p>
                <p className="loading-text">This may take a few seconds.</p>
              </div>
            ) : review ? (
              <article className="review-body markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {review}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-4z"
                      stroke="url(#g)"
                      strokeWidth="1.25"
                      strokeLinejoin="round"
                    />
                    <path d="M12 8v4l2 2" stroke="url(#g)" strokeWidth="1.25" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="g" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1" />
                        <stop offset="1" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <p className="empty-title">Ready when you are</p>
                <p className="empty-desc">Paste or edit code, then run a review to see structured AI feedback here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
