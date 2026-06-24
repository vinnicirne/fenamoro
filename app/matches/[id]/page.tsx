"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Image, Lock, Clock, ShieldCheck, Phone, Video, MoreVertical } from "lucide-react";
import Link from "next/link";

const MOCK_MATCH = {
  name: "Ana Beatriz",
  age: 26,
  emoji: "🌿",
  online: true,
};

const INITIAL_MESSAGES = [
  { id: 1, sender: "them", text: "Gostei muito do seu testemunho! Que história linda de transformação 🙏", time: "14:32", read: true },
  { id: 2, sender: "me", text: "Obrigado! O seu também me tocou muito. A graça de Deus é incrível mesmo 💚", time: "14:35", read: true },
  { id: 3, sender: "them", text: "Com certeza! Estou animada com essa conversa. Como você conheceu o Senhor?", time: "14:36", read: true },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [text, setText] = useState("");
  const [mediaUnlocked] = useState(false); // false = ainda em 3 dias
  const [timeLeft] = useState("46h 23m");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", text: text.trim(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), read: false },
    ]);
    setText("");
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#EFEAE2" }}>

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top)] pt-3 pb-3"
        style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
        <Link href="/matches" className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)" }}>
          <span className="text-xl">{MOCK_MATCH.emoji}</span>
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold font-jakarta text-base leading-tight">{MOCK_MATCH.name}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
            <span className="text-white/70 text-xs font-jakarta">online agora</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2"><Phone className="w-4 h-4 text-white/80" /></button>
          <button className="p-2"><Video className="w-4 h-4 text-white/80" /></button>
          <button className="p-2"><MoreVertical className="w-4 h-4 text-white/80" /></button>
        </div>
      </header>

      {/* Timer banner */}
      <div className="flex items-center gap-2 px-4 py-2"
        style={{ background: "rgba(7,94,84,0.12)", borderBottom: "1px solid rgba(7,94,84,0.15)" }}>
        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#075E54" }} />
        <p className="text-xs font-jakarta" style={{ color: "#075E54" }}>
          <span className="font-semibold">{timeLeft}</span> para responder — mantenha a conexão viva!
        </p>
      </div>

      {/* Shield banner */}
      {!mediaUnlocked && (
        <div className="flex items-center gap-2 px-4 py-2"
          style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d97706" }} />
          <p className="text-xs font-manrope" style={{ color: "#92400e" }}>
            📸 Envio de fotos liberado em <span className="font-semibold">2 dias</span> — foque no caráter primeiro
          </p>
        </div>
      )}

      {/* Chat background with pattern */}
      <div className="flex-1 overflow-y-auto px-4 py-3 chat-bg">
        {/* Data */}
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-jakarta"
            style={{ background: "rgba(0,0,0,0.08)", color: "#666" }}>
            Hoje
          </span>
        </div>

        {/* Mensagem de sistema: Match */}
        <div className="flex justify-center mb-4">
          <div className="px-4 py-2 rounded-2xl max-w-[80%] text-center"
            style={{ background: "rgba(7,94,84,0.1)", border: "1px solid rgba(7,94,84,0.2)" }}>
            <p className="text-xs font-jakarta" style={{ color: "#075E54" }}>
              🕊️ Vocês se conectaram com propósito
            </p>
          </div>
        </div>

        {/* Mensagens */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-3 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "them" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-auto"
                style={{ background: "linear-gradient(135deg, #1a4a3a, #0d2d22)" }}>
                <span className="text-xs">{MOCK_MATCH.emoji}</span>
              </div>
            )}
            <div>
              <div className={`px-4 py-2.5 max-w-[75vw] font-manrope text-sm leading-relaxed ${
                msg.sender === "me"
                  ? "rounded-2xl rounded-br-sm text-white"
                  : "rounded-2xl rounded-bl-sm text-gray-800 shadow-sm"
              }`}
                style={msg.sender === "me"
                  ? { background: "#128C7E" }
                  : { background: "white" }}>
                {msg.text}
              </div>
              <div className={`flex items-center gap-1 mt-0.5 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <span className="text-[10px] font-jakarta text-gray-400">{msg.time}</span>
                {msg.sender === "me" && msg.read && (
                  <ShieldCheck className="w-2.5 h-2.5 text-[#25D366]" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-3 pb-[env(safe-area-inset-bottom)]"
        style={{ background: "#F0F2F5", borderTop: "1px solid #E5E7EB" }}>

        <button
          disabled={!mediaUnlocked}
          className="p-3 rounded-full flex-shrink-0 transition-all"
          style={{ background: mediaUnlocked ? "white" : "rgba(0,0,0,0.05)", color: mediaUnlocked ? "#128C7E" : "#ccc" }}
          title={mediaUnlocked ? "Enviar foto" : "Liberado em 2 dias"}>
          {mediaUnlocked ? <Image className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </button>

        <div className="flex-1 flex items-end rounded-3xl overflow-hidden"
          style={{ background: "white", border: "1px solid #E5E7EB" }}>
          <textarea
            placeholder="Mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={1}
            className="flex-1 px-4 py-3 text-sm font-manrope text-gray-800 resize-none outline-none bg-transparent"
            style={{ maxHeight: 100 }}
          />
        </div>

        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
