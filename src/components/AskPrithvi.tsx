import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, Info } from "lucide-react";
import { useStore } from "@/data/store";
import { getAiRepository } from "@/lib/ai/createAiRepository";
import { AssistantContext, AssistantIntent } from "@/lib/ai/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AskPrithvi() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; isFallback?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const { categoryTotals, estimates, recommendations } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Close with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setPrompt("");
    setLoading(true);

    try {
      const low = estimates.reduce((sum, e) => sum + e.low, 0);
      const central = estimates.reduce((sum, e) => sum + e.central, 0);
      const high = estimates.reduce((sum, e) => sum + e.high, 0);

      const context: AssistantContext = {
        aggregatedCategories: Object.fromEntries(
          Object.entries(categoryTotals).map(([k, v]) => [k, v.central])
        ),
        totalEmissionsLow: low,
        totalEmissionsCentral: central,
        totalEmissionsHigh: high,
        topRecommendations: recommendations.slice(0, 5).map((r) => r.title),
      };

      // Heuristic intent detection based on prompt text
      let intent: AssistantIntent = "explain-estimate";
      const p = userMessage.toLowerCase();
      if (p.includes("why") && (p.includes("range") || p.includes("wide"))) intent = "why-range-wide";
      if (p.includes("clarify") || p.includes("next")) intent = "what-to-clarify";
      if (p.includes("recommend") || p.includes("action")) intent = "explain-recommendation";
      if (p.includes("log") || p.includes("add")) intent = "help-log-activity";
      if (p.includes("project") || p.includes("verif")) intent = "explain-projected-vs-verified";

      const repo = await getAiRepository();
      const response = await repo.askAssistant({
        prompt: userMessage,
        intent,
        context,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: response.answer, isFallback: response.isFallback },
      ]);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I'm having trouble connecting right now. Please try again later.",
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest-700 text-white shadow-lg hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 transition-transform hover:scale-105 active:scale-95"
        aria-label={isOpen ? "Close Ask Prithvi" : "Open Ask Prithvi"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Floating Panel / Bottom Sheet */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Ask Prithvi AI Assistant"
          aria-modal="true"
          className="fixed bottom-0 left-0 right-0 z-40 flex h-[80vh] w-full flex-col bg-surface shadow-2xl transition-transform sm:bottom-24 sm:left-auto sm:right-6 sm:h-[500px] sm:w-[380px] sm:rounded-card border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-forest-700 p-4 text-white sm:rounded-t-card">
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles size={18} /> Ask Prithvi
            </h2>
            <button onClick={toggleOpen} aria-label="Close dialog" className="hover:text-forest-200">
              <X size={20} />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas-subtle">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-text-secondary mt-8 space-y-4">
                <Sparkles size={32} className="mx-auto text-forest-300" />
                <p>I can help explain your carbon estimate, uncertainty ranges, and recommendations.</p>
                <p>Calculations are always strictly deterministic and never altered by AI.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-forest-700 text-white"
                        : "bg-surface border border-border text-text-primary"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "ai" && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-text-secondary">
                      {msg.isFallback ? (
                        <>
                          <Info size={10} /> Deterministic fallback mode
                        </>
                      ) : (
                        <>
                          <Sparkles size={10} /> AI-assisted explanation
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-text-secondary">
                  <Loader2 size={16} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-border bg-surface p-3 flex gap-2">
            <Input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about your estimate..."
              maxLength={500}
              className="flex-1 rounded-full text-sm"
              disabled={loading}
              aria-label="Your question"
            />
            <Button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0"
              aria-label="Send"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
