"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useProfileVerify } from "./ProfileVerifyContext";

export function ProfileVerifyHeader() {
  const router = useRouter();
  const { isAnalyzing } = useProfileVerify();

  return (
    <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-4 bg-white relative z-20 shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()} 
          disabled={isAnalyzing}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold font-jakarta text-[#1DA1F2] uppercase tracking-widest flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          Selo Azul
        </span>
        <div className="w-10"></div>
      </div>
      
      <h1 className="font-outfit font-black text-2xl text-gray-900 tracking-tight leading-tight mb-2">
        Prove que você é <br />
        <span className="text-[#1DA1F2]">Real</span>
      </h1>
      <p className="font-manrope text-sm text-gray-500 max-w-[280px] mb-4">
        Tire uma selfie nítida para ativarmos sua biometria. Perfis verificados recebem até 3x mais conexões!
      </p>

      {/* Alertas de Biometria */}
      <div className="bg-[#1DA1F2]/5 rounded-xl p-3 border border-[#1DA1F2]/10 flex flex-col gap-2">
        <p className="text-xs font-bold font-jakarta text-[#1DA1F2] uppercase tracking-wider mb-1">
          Regras para Análise de IA
        </p>
        <ul className="text-xs font-manrope text-gray-600 space-y-1.5 ml-1">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Sem óculos escuros ou de grau refletivos
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Sem bonés, chapéus ou capuz
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Sem objetos cobrindo o rosto (ex: máscaras)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
            Fique em um ambiente bem iluminado
          </li>
        </ul>
      </div>
    </header>
  );
}
