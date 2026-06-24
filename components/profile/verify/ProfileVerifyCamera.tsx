"use client";

import React from "react";
import { useProfileVerify } from "./ProfileVerifyContext";
import { Loader2, ScanFace } from "lucide-react";

export function ProfileVerifyCamera() {
  const { videoRef, canvasRef, photoUrl, isAnalyzing, cameraActive } = useProfileVerify();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 bg-gray-900 relative overflow-hidden">
      
      {/* Container principal (Câmera ou Preview) */}
      <div className="w-full max-w-sm aspect-[3/4] relative rounded-[2rem] overflow-hidden bg-black shadow-2xl">
        
        {/* Lente Oculta para Extração */}
        <canvas ref={canvasRef} className="hidden" />

        {photoUrl ? (
          /* Preview da Foto */
          <div className="w-full h-full relative">
            <img 
              src={photoUrl} 
              alt="Preview" 
              className={`w-full h-full object-cover transition-all duration-700 ${isAnalyzing ? "scale-105 blur-sm" : ""}`}
            />
            
            {/* Efeito de Scanner Fake AI */}
            {isAnalyzing && (
              <>
                <div className="absolute inset-0 bg-[#1DA1F2]/20 mix-blend-overlay" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#1DA1F2] shadow-[0_0_20px_#1DA1F2] animate-[scan_2s_ease-in-out_infinite]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 drop-shadow-lg">
                  <ScanFace className="w-16 h-16 text-white mb-4 animate-pulse" />
                  <p className="text-white font-bold font-jakarta text-lg">Analisando Biometria...</p>
                  <p className="text-white/80 font-manrope text-sm text-center px-6 mt-2">
                    Cruzando dados de profundidade facial e autenticidade geométrica.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Câmera ao Vivo */
          <div className="w-full h-full relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }} // mirror
            />
            
            {/* Máscara de Rosto (Overlay Oval) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Uma borda tracejada oval guiando o usuário */}
              <div className="w-48 h-64 border-2 border-dashed border-white/60 rounded-[100%] transition-transform duration-1000"
                   style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" }}>
              </div>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none">
              <span className="bg-black/50 text-white text-sm font-jakarta px-4 py-2 rounded-full backdrop-blur-md">
                Encaixe seu rosto no oval
              </span>
            </div>

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                <Loader2 className="w-8 h-8 text-[#1DA1F2] animate-spin mb-2" />
                <p className="text-white/60 text-sm font-jakarta">Iniciando câmera...</p>
              </div>
            )}
          </div>
        )}
        
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
