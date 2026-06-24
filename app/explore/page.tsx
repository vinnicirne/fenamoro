"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Compass, Home, MessageCircle, User, Sparkles, MapPin, ShieldCheck, Heart, Users } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "new",
    title: "Novos na plataforma",
    subtitle: "Conheça quem acabou de entrar",
    icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  {
    id: "nearby",
    title: "Perto de mim",
    subtitle: "Pessoas na sua cidade",
    icon: <MapPin className="w-6 h-6 text-blue-500" />,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    id: "verified",
    title: "Perfis Verificados",
    subtitle: "Conexões 100% autênticas",
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    id: "denomination",
    title: "Sua Denominação",
    subtitle: "Da mesma igreja que você",
    icon: <Users className="w-6 h-6 text-purple-500" />,
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  }
];

export default function ExplorePage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh flex flex-col bg-[#F0F2F5]">
      {/* ── Header ── */}
      <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-4"
        style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-7 h-7 text-white" />
          <h1 className="font-outfit font-black text-2xl text-white tracking-tight">Explorar</h1>
        </div>
        <p className="text-white/80 text-sm font-jakarta">
          Encontre conexões focadas no seu propósito.
        </p>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 p-5 overflow-y-auto pb-24">
        
        {/* Banner Premium Upsell */}
        <div 
          onClick={() => router.push("/premium")}
          className="mb-6 p-4 rounded-3xl cursor-pointer relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #111B21, #0a1f1c)", border: "1px solid rgba(37,211,102,0.2)" }}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#25D366]/10 rounded-full blur-xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-[#25D366] fill-[#25D366]" />
            </div>
            <div>
              <h3 className="text-white font-bold font-outfit text-base mb-0.5">Exploração Ilimitada</h3>
              <p className="text-white/60 text-xs font-jakarta leading-tight">
                Use filtros avançados e veja quem curtiu você com o Premium.
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <h2 className="text-gray-900 font-bold font-outfit text-lg mb-4">Categorias</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => router.push(`/feed?filter=${cat.id}`)}
              className={`p-4 rounded-3xl border cursor-pointer hover:scale-[0.98] transition-transform ${cat.bg} ${cat.border}`}
              style={{ backgroundColor: "white" }}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${cat.bg}`}>
                {cat.icon}
              </div>
              <h3 className="font-bold font-jakarta text-sm text-gray-900 mb-1 leading-tight">
                {cat.title}
              </h3>
              <p className="text-xs text-gray-500 font-manrope leading-tight">
                {cat.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        style={{ background: "white", borderTop: "1px solid #E5E7EB" }}>
        {[
          { icon: Home, label: "Início", href: "/feed", active: false },
          { icon: Compass, label: "Explorar", href: "/explore", active: true },
          { icon: MessageCircle, label: "Matches", href: "/matches", active: false },
          { icon: User, label: "Perfil", href: "/profile", active: false },
        ].map(({ icon: Icon, label, href, active }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all"
            style={{ color: active ? "#075E54" : "#9CA3AF" }}>
            <Icon className={`w-6 h-6 ${active ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold font-jakarta">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
