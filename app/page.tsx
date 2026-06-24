"use client";

import React, { useState, useRef } from "react";
import { Heart, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

// Dados de preview do carrossel (Marketing: Hook Model — Trigger)
const PREVIEW_PROFILES = [
  { name: "Ana B.", age: 26, city: "SP", denomination: "Batista", blur: true },
  { name: "Marcos T.", age: 29, city: "RJ", denomination: "Presbiteriana", blur: true },
  { name: "Camila R.", age: 24, city: "BH", denomination: "Pentecostal", blur: false },
];

export default function FenamoroHome() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <div className="min-h-dvh bg-whatsapp-dark text-white overflow-hidden relative">

      {/* ── Ambient background glow ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-whatsapp-teal/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-whatsapp-darkTeal/15 blur-[100px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 px-6 pt-[env(safe-area-inset-top)] pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="w-10 h-10 rounded-2xl bg-premium-gradient flex items-center justify-center shadow-premium">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-outfit font-bold text-xl text-white">FéNamoro</span>
        </div>
        <Link
          href="/login"
          className="text-whatsapp-green text-sm font-semibold font-jakarta hover:text-[#20bd5a] transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-whatsapp-green/10 border border-whatsapp-green/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-whatsapp-green animate-pulse-slow" />
          <span className="text-whatsapp-green text-xs font-jakarta font-semibold tracking-wide">
            🕊️ Mais de 12.000 cristãos ativos
          </span>
        </div>

        <h1 className="font-outfit font-black text-4xl leading-tight mb-4 text-balance">
          O amor que{" "}
          <span className="text-gradient-green">transforma</span>{" "}
          começa com{" "}
          <span className="text-gradient-gold">propósito</span>
        </h1>

        <p className="font-manrope text-white/60 text-base leading-relaxed mb-8 text-balance">
          Relacionamentos construídos sobre caráter, fé e intenção real — não sobre aparências.
        </p>

        {/* CTA principal */}
        <Link href="/register" className="btn-primary max-w-sm mx-auto">
          <Heart className="w-5 h-5 fill-white" />
          Começar minha jornada
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-white/30 text-xs font-jakarta mt-3">
          Gratuito • Sem cartão de crédito
        </p>
      </section>

      {/* ── Preview Cards (Hook Model: Curiosity Trigger) ── */}
      <section className="relative z-10 px-6 pb-8">
        <p className="text-white/40 text-xs font-jakarta text-center mb-4 uppercase tracking-wider">
          Pessoas com o mesmo propósito perto de você
        </p>

        <div className="flex gap-3 overflow-hidden justify-center">
          {PREVIEW_PROFILES.map((p, i) => (
            <div
              key={i}
              onClick={() => setActiveCard(i)}
              className={`flex-shrink-0 w-28 rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer
                ${activeCard === i ? "border-whatsapp-green scale-105" : "border-white/5 scale-100"}`}
            >
              {/* Photo placeholder with blur */}
              <div className={`h-36 relative ${p.blur ? "bg-gradient-to-b from-whatsapp-teal/30 to-whatsapp-darkTeal/50" : "bg-gradient-to-b from-fe-rose/20 to-fe-spirit/30"}`}>
                <div className={`absolute inset-0 flex items-center justify-center ${p.blur ? "backdrop-blur-md" : ""}`}>
                  <div className={`w-12 h-12 rounded-full ${p.blur ? "bg-white/20" : "bg-white/30"} flex items-center justify-center`}>
                    <span className="text-2xl">{p.blur ? "👤" : "👤"}</span>
                  </div>
                </div>
                {p.blur && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <span className="text-[9px] text-white/60 font-jakarta bg-black/40 px-2 py-0.5 rounded-full">
                      Faça login para ver
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-whatsapp-darkMid p-2">
                <p className="text-white text-xs font-semibold font-jakarta">{p.name}, {p.age}</p>
                <p className="text-whatsapp-green text-[10px] font-jakarta">{p.denomination}</p>
                <p className="text-white/40 text-[10px] font-jakarta">{p.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Diferenciais (Marketing: Jobs-to-be-Done) ── */}
      <section className="relative z-10 px-6 pb-8">
        <div className="card-dark p-5 space-y-4">
          <h2 className="font-outfit font-bold text-lg text-white">
            Por que o FéNamoro é diferente?
          </h2>

          {[
            {
              icon: "🎙️",
              title: "Testemunho em Áudio",
              desc: "Conheça a voz e a história antes de ver. A alma fala primeiro.",
            },
            {
              icon: "🕊️",
              title: "\"Orar Por\" — o Super Like respeitoso",
              desc: "Demonstre interesse com respeito e intenção cristã real.",
            },
            {
              icon: "💬",
              title: "Icebreaker Obrigatório",
              desc: "Sem 'Oi, tudo bem?'. Conversas que importam desde a primeira mensagem.",
            },
            {
              icon: "🛡️",
              title: "Escudo de Mídia",
              desc: "Fotos só após 3 dias. O caráter vem antes da imagem.",
            },
            {
              icon: "✅",
              title: "Perfil Autêntico FéConecta",
              desc: "Validação real de identidade pela nossa rede social cristã.",
            },
          ].map((feat, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{feat.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm font-jakarta">{feat.title}</p>
                <p className="text-white/50 text-xs font-manrope mt-0.5 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testemunho (Marketing: Social Proof) ── */}
      <section className="relative z-10 px-6 pb-8">
        <div className="bg-premium-gradient rounded-3xl p-5 shadow-glow-match">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👫</div>
            <div>
              <p className="text-white font-semibold text-sm font-jakarta">Lucas & Rebeca</p>
              <p className="text-white/60 text-xs font-jakarta">Casados em Março/2025</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-fe-gold fill-fe-gold" />
              ))}
            </div>
          </div>
          <p className="text-white/90 text-sm font-manrope leading-relaxed italic">
            "O icebreaker perguntou qual versículo mais moldou meu caráter. Respondi Pv 3:5-6. 
            Ele respondeu a mesma coisa. Três meses depois, a aliança."
          </p>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="relative z-10 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <Link href="/register" className="btn-primary">
          <Heart className="w-5 h-5 fill-white" />
          Criar meu perfil gratuito
        </Link>

        <p className="text-center text-white/30 text-xs font-jakarta mt-4">
          Ao continuar, você aceita os{" "}
          <Link href="/terms" className="text-white/50 underline">Termos</Link>
          {" "}e a{" "}
          <Link href="/privacy" className="text-white/50 underline">Privacidade</Link>
        </p>
      </section>

    </div>
  );
}
