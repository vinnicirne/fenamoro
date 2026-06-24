"use client";

import React from "react";
import { useProfilePremium } from "./ProfilePremiumContext";
import { Lock } from "lucide-react";

export function ProfilePremiumActions() {
  const { handleCheckout } = useProfilePremium();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button 
        onClick={handleCheckout}
        className="w-full py-4 rounded-2xl font-bold font-jakarta text-[#111111] flex items-center justify-center gap-2 transition-transform active:scale-95"
        style={{ background: "linear-gradient(135deg, #FFD700, #FDB931)", boxShadow: "0 8px 24px rgba(253,185,49,0.3)" }}
      >
        <Lock className="w-4 h-4" />
        Continuar para Pagamento Seguro
      </button>
      <p className="text-center text-[10px] text-gray-400 font-manrope mt-3">
        Pagamento processado de forma segura pela Kiwify.
      </p>
    </div>
  );
}
