"use client";

import React from "react";
import { useProfileVerify } from "./ProfileVerifyContext";
import { Camera, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";

export function ProfileVerifyActions() {
  const { photoUrl, takePhoto, retakePhoto, submitVerification, isAnalyzing, cameraActive } = useProfileVerify();

  return (
    <div className="bg-white border-t border-gray-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-4">
      
      {!photoUrl ? (
        <button 
          onClick={takePhoto}
          disabled={!cameraActive}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #1DA1F2, #0A74B2)", boxShadow: "0 8px 32px rgba(29,161,242,0.3)" }}
        >
          <Camera className="w-8 h-8 text-white" />
        </button>
      ) : (
        <div className="w-full flex items-center gap-3">
          <button 
            onClick={retakePhoto}
            disabled={isAnalyzing}
            className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            Tentar de Novo
          </button>
          
          <button 
            onClick={submitVerification}
            disabled={isAnalyzing}
            className="flex-[1.5] py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1DA1F2, #0A74B2)", boxShadow: "0 8px 24px rgba(29,161,242,0.25)" }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Confirmar
              </>
            )}
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400 font-manrope text-center px-4">
        Sua foto será mantida em sigilo e usada apenas para cruzar dados com as suas fotos de perfil.
      </p>
    </div>
  );
}
