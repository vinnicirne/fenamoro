"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useProfileEdit } from "./ProfileEditContext";

export function ProfileEditHeader() {
  const router = useRouter();
  const { saving } = useProfileEdit();

  return (
    <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-4 bg-white sticky top-0 z-20 border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()} 
          disabled={saving}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold font-jakarta text-amber-700 uppercase tracking-widest">Seu Testemunho</span>
        </div>
      </div>
      
      <h1 className="font-outfit font-black text-2xl text-gray-900 tracking-tight leading-tight">
        Apresente-se com<br />
        <span className="text-[#075E54]">Propósito</span>
      </h1>
      <p className="font-manrope text-sm text-gray-500 mt-2 max-w-[280px]">
        Preencha seus dados para aumentar suas chances de encontrar pessoas compatíveis com a sua fé.
      </p>
    </header>
  );
}
