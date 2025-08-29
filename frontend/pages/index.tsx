import { useState } from "react";
import axios from "axios";

interface ChatResponse {
  reply: string;
  error?: string;
  supabase_error?: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input || loading) return;

    setLoading(true);
    const userInput = input;
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");

    try {
      const res = await axios.post<ChatResponse>(
        "http://127.0.0.1:8000/chat",
        { text: userInput }
      );

      const botReply = res.data.reply || "No reply";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Failed to get response" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 20,
      maxWidth: 600,
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#1e1e1e",
      color: "#fff",
      minHeight: "100vh"
    }}>
      <h2 style={{ textAlign: "center" }}>AI Support Agent</h2>
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 8,
          padding: 10,
          height: 400,
          overflowY: "scroll",
          marginBottom: 10,
          backgroundColor: "#2c2c2c"
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 8,
              textAlign: m.sender === "user" ? "right" : "left"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 12,
                backgroundColor: m.sender === "user" ? "#007bff" : "#444",
                color: "#fff",
                maxWidth: "80%"
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: "#aaa" }}><i>Bot is typing...</i></p>}
      </div>
      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 4,
            border: "1px solid #555",
            backgroundColor: "#1e1e1e",
            color: "#fff"
          }}
          placeholder="Type a message..."
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 15px",
            marginLeft: 5,
            borderRadius: 4,
            border: "none",
            backgroundColor: loading ? "#555" : "#007bff",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
