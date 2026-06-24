"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";

export function ProfilePremiumHeader() {
  const router = useRouter();

  return (
    <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-6 relative z-20"
      style={{ background: "linear-gradient(135deg, #111111, #1A1A1A)" }}>
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="w-10"></div>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#FDB931] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
          <Star className="w-8 h-8 text-[#111111] fill-[#111111]" />
        </div>
        <h1 className="font-outfit font-black text-3xl text-white tracking-tight leading-tight mb-2">
          FéNamoro <span className="text-[#FFD700]">Premium</span>
        </h1>
        <p className="font-manrope text-sm text-gray-400 max-w-[280px]">
          Desbloqueie o máximo de oportunidades e encontre o seu propósito mais rápido.
        </p>
      </div>
    </header>
  );
}
