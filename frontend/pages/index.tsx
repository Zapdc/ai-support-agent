import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

interface ChatResponse {
  reply: string;
  error?: string;
  supabase_error?: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input || loading) return;

    setLoading(true);
    const userInput = input;
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");

    try {
      const res = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
        text: userInput,
      });

      const botReply = res.data.reply || "No reply";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Failed to get response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #121212, #1c1c1c, #0d0d0d)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Floating background animation */}
      <canvas
        id="floatingCanvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      <h2
        style={{
          textAlign: "center",
          marginBottom: 15,
          color: "#f0f0f0",
          zIndex: 1,
        }}
      >
        AI Chat Bot
      </h2>

      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 500,
          border: "1px solid #333",
          borderRadius: 12,
          padding: 12,
          height: 350,
          overflowY: "auto",
          marginBottom: 10,
          backgroundColor: "rgba(30,30,30,0.9)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              display: "flex",
              justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 16,
                backgroundColor: m.sender === "user" ? "#0d6efd" : "#2c2c2c",
                color: "#fff",
                maxWidth: "75%",
                wordBreak: "break-word",
                boxShadow:
                  m.sender === "user"
                    ? "0 2px 6px rgba(13,110,253,0.5)"
                    : "0 2px 6px rgba(0,0,0,0.4)",
                transition: "all 0.2s ease-in-out",
                fontSize: 14,
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && (
          <p style={{ color: "#aaa", textAlign: "center" }}>
            <i>Bot is typing...</i>
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          width: "100%",
          maxWidth: 500,
          zIndex: 1,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #555",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            outline: "none",
            fontSize: 14,
          }}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: loading ? "#555" : "#0d6efd",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 500,
            fontSize: 14,
            transition: "background-color 0.2s ease",
          }}
          disabled={loading}
        >
          Send
        </button>
      </div>

      {/* Floating animation script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
      const canvas = document.getElementById('floatingCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const shapes = [];
      for (let i = 0; i < 30; i++) {
        const alpha = Math.random() * 0.5 + 0.2;
        shapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 6 + 2,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          color: 'rgba(13,110,253,' + alpha + ')'
        });
      }

      function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        shapes.forEach(s => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
          ctx.fillStyle = s.color;
          ctx.fill();
          s.x += s.dx;
          s.y += s.dy;

          if (s.x < 0 || s.x > canvas.width) s.dx *= -1;
          if (s.y < 0 || s.y > canvas.height) s.dy *= -1;
        });
        requestAnimationFrame(animate);
      }
      animate();

      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    `,
        }}
      />
      <Analytics />
      <SpeedInsights/>
    </div>
  );
}
