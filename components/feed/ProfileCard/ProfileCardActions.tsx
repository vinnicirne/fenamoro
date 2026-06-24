import React from "react";
import { X, Heart, Star } from "lucide-react";
import { useProfileCard } from "./ProfileCardContext";

export default function ProfileCardActions() {
  const { handlePass, handleOrar, handleSuper } = useProfileCard();

  return (
    <>
      <div className="flex items-center justify-center gap-5 mt-5 mb-2">
        {/* Passar */}
        <button onClick={handlePass}
          className="action-btn-pass transition-all active:scale-90"
          style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X className="w-7 h-7" style={{ color: "#ef4444" }} />
        </button>

        {/* ORAR POR — botão central maior */}
        <button onClick={handleOrar}
          className="transition-all active:scale-90"
          style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 32px rgba(37,211,102,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
          <Heart className="w-8 h-8 text-white fill-white" />
        </button>

        {/* Super Orar */}
        <button onClick={handleSuper}
          className="transition-all active:scale-90"
          style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Star className="w-6 h-6" style={{ color: "#f59e0b" }} />
        </button>
      </div>

      {/* Labels dos botões */}
      <div className="flex items-center justify-center gap-5 mb-4">
        <span className="text-[10px] font-jakarta text-gray-400 w-[60px] text-center">Passar</span>
        <span className="text-[10px] font-jakarta font-semibold w-[72px] text-center" style={{ color: "#25D366" }}>Orar Por</span>
        <span className="text-[10px] font-jakarta text-gray-400 w-[60px] text-center">Super ⭐</span>
      </div>

      {/* Dica */}
      <p className="text-center text-gray-400 text-[11px] font-manrope px-8">
        Escute o testemunho antes de interagir 🕊️
      </p>
    </>
  );
}
