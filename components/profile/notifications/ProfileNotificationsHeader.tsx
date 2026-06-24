"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell } from "lucide-react";
import { useProfileNotifications } from "./ProfileNotificationsContext";

export function ProfileNotificationsHeader() {
  const router = useRouter();
  const { saving } = useProfileNotifications();

  return (
    <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-4 bg-white relative z-20 shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()} 
          disabled={saving}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold font-jakarta text-[#075E54] uppercase tracking-widest flex items-center gap-1">
          <Bell className="w-4 h-4" />
          Alertas
        </span>
        <div className="w-10"></div>
      </div>
      
      <h1 className="font-outfit font-black text-2xl text-gray-900 tracking-tight leading-tight mb-2">
        Controle de <br />
        <span className="text-[#075E54]">Notificações</span>
      </h1>
      <p className="font-manrope text-sm text-gray-500 max-w-[280px]">
        Escolha o que você quer receber para não perder oportunidades reais.
      </p>
    </header>
  );
}
