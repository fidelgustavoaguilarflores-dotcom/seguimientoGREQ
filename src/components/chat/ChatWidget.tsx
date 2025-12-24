// Floating chat widget that posts messages to a webhook and renders responses.
// Keeps a session id in localStorage to maintain continuity.
import React, { useState, useEffect, useRef } from "react";
import "./ChatWidget.css";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
}

// Webhook endpoint for chat interactions.
const WEBHOOK_URL =
  "http://desa.vuce.gob.bo:5678/webhook/e8cebf37-df51-42ce-baf8-e2916c17cefa";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem("ia_chat_session_id");
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2);
      localStorage.setItem("ia_chat_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);

    // Optional: Add initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: "Hola. Soy tu asistente virtual. ¿En qué puedo ayudarte con los GREQs hoy?",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Send user message and append the assistant reply.
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userText = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          userMessage: userText,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la conexión con el asistente");
      }

      const data = await response.json();

      let replyText = "Lo siento, no pude procesar la respuesta.";

      // Support multiple response shapes (array or object).
      if (Array.isArray(data) && data.length > 0) {
        replyText =
          data[0].output || data[0].reply || data[0].text || replyText;
      } else if (typeof data === "object") {
        replyText = data.output || data.reply || data.text || replyText;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        text: "Ha ocurrido un error al conectar con el asistente IA. Inténtalo de nuevo más tarde.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Allow Enter to send, Shift+Enter to add a new line.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: isOpen ? "none" : "flex" }} // Optional: hide when open, or keep visible? Design says clicking opens/closes
      >
        <MessageCircle size={30} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <h3>Asistente IA VUCE</h3>
              <span>Seguimiento de GREQs</span>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                {msg.role === "assistant" && (
                  <Bot
                    size={16}
                    style={{ marginBottom: "-2px", marginRight: "5px" }}
                  />
                )}
                {msg.text}
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="message assistant">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Escribe tu consulta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
