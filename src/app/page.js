"use client";

import { useState } from "react";

export default function AIPromptPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      // Cloudflare AI returns the response in `response` field
      const text = data.response || "No response from AI.";
      setResponse(text);
    } catch (err) {
      console.error(err);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Prompt</h1>
          <p className="text-gray-400 text-sm mt-1">Ask anything and get an instant response.</p>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Your Prompt
          </label>
          <textarea
            className="w-full h-44 bg-gray-900 text-gray-100 placeholder-gray-600 border border-gray-700 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Type your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!prompt.trim() || loading}
          className="self-end flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              Send Request
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        {/* Response Box */}
        {response && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Response</p>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}

      </div>
    </div>
  );
}