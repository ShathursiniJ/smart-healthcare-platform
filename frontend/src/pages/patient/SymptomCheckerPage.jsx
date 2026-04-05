import { useState } from "react";

const QUICK_SYMPTOMS = ["Headache", "Fever", "Chest Pain", "Cough", "Fatigue", "Nausea", "Back Pain", "Shortness of Breath"];

function SymptomCheckerPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI health assistant. Describe your symptoms and I'll suggest possible conditions and recommended specialties. Note: This is not a medical diagnosis." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a helpful medical AI assistant for a healthcare platform called MediConnect. When patients describe symptoms, provide: 1) Possible conditions (non-diagnostic), 2) Recommended doctor specialty to consult, 3) Urgency level (low/medium/high), 4) General health tips. Always remind that this is not a medical diagnosis and they should consult a real doctor. Keep responses concise and friendly.",
          messages: [
            ...messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI Symptom Checker</h1>
        <p className="text-sm text-slate-500">Describe your symptoms for preliminary health suggestions</p>
      </div>

      {/* Quick Symptoms */}
      <div className="flex flex-wrap gap-2">
        {QUICK_SYMPTOMS.map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100">
            {s}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                msg.role === "assistant" ? "bg-teal-100" : "bg-blue-100"
              }`}>
                {msg.role === "assistant" ? (
                  <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${
                msg.role === "assistant" ? "bg-slate-100 text-slate-800" : "bg-teal-600 text-white"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SymptomCheckerPage;