import React from "react";
import { ShieldCheck, Church, MapPin, Play, Pause, Volume2 } from "lucide-react";
import { useProfileCard } from "./ProfileCardContext";

export default function ProfileCardMedia() {
  const { profile, isPlaying, setIsPlaying } = useProfileCard();

  return (
    <>
      <div className={`relative h-72 ${profile.main_photo ? "bg-black" : `bg-gradient-to-br ${profile.gradient}`} flex items-center justify-center overflow-hidden`}>
        {profile.main_photo ? (
          <img src={profile.main_photo} alt={profile.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
        ) : (
          <div className="flex flex-col items-center gap-3 relative z-10">
            <span className="text-7xl">{profile.emoji}</span>
            <p className="text-white/60 text-xs font-jakarta">Sem foto</p>
          </div>
        )}

        {/* Overlay gradiente para legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {profile.feconecta_verified && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-jakarta"
              style={{ background: "rgba(37,211,102,0.9)", color: "white" }}>
              <ShieldCheck className="w-3 h-3" />
              Perfil Autêntico
            </div>
          )}
          {profile.church_verified && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-jakarta"
              style={{ background: "rgba(7,94,84,0.85)", color: "white" }}>
              <Church className="w-3 h-3" />
              Igreja Verificada
            </div>
          )}
        </div>

        {/* Nome overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="font-outfit font-bold text-2xl text-white leading-tight">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-white/80 text-xs font-jakarta">
              <MapPin className="w-3 h-3" />
              {profile.city}, {profile.state}
            </div>
            <span className="text-white/40">•</span>
            <span className="text-white/80 text-xs font-jakarta">{profile.denomination}</span>
          </div>
        </div>
      </div>

      {/* Testemunho player */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#F0F2F5" }}>
          <button
            onClick={() => setIsPlaying((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
            {isPlaying
              ? <Pause className="w-4 h-4 text-white fill-white" />
              : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}
          </button>

          {/* Waveform simulada */}
          <div className="flex-1 flex items-center gap-0.5 h-8">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i}
                className="flex-1 rounded-full transition-all"
                style={{
                  background: i < (isPlaying ? 14 : 0) ? "#25D366" : "#128C7E",
                  height: `${20 + Math.sin(i * 0.8) * 12}px`,
                  opacity: 0.6 + Math.sin(i * 0.5) * 0.4,
                  ...(isPlaying ? { animation: `waveform ${0.8 + (i % 3) * 0.2}s ease-in-out infinite alternate` } : {}),
                }} />
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-jakarta" style={{ color: "#128C7E" }}>
            <Volume2 className="w-3 h-3" />
            <span>0:45</span>
          </div>
        </div>
      </div>
    </>
  );
}
