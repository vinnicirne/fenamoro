"use client";

import React, { useState, useEffect } from "react";
import { Heart, Bell, User, Home, Compass, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ProfileCard from "@/components/feed/ProfileCard/ProfileCard";

const DEMO_PROFILES = [
  {
    id: "1",
    name: "Ana Beatriz",
    age: 26,
    city: "São Paulo",
    state: "SP",
    denomination: "Batista",
    church: "Igreja Batista Central",
    church_verified: true,
    feconecta_verified: true,
    bio: "Professora de música na Igreja, apaixonada por louvor e pela Palavra. Busco alguém que ame a Deus acima de tudo.",
    testimony_type: "audio" as "audio" | "video",
    faith_importance: 5,
    looking_for: "marriage",
    photos: [],
    gradient: "from-[#1a4a3a] to-[#0d2d22]",
    emoji: "🌿",
  },
  {
    id: "2",
    name: "Marcos Tadeu",
    age: 29,
    city: "Belo Horizonte",
    state: "MG",
    denomination: "Presbiteriana",
    church: "Igreja Presbiteriana Central",
    church_verified: true,
    feconecta_verified: false,
    bio: "Engenheiro de dia, líder de células à noite. Busco uma parceria de vida que cresça junto em santidade.",
    testimony_type: "video" as "audio" | "video",
    faith_importance: 5,
    looking_for: "marriage",
    photos: [],
    gradient: "from-[#1a2d4a] to-[#0d1d35]",
    emoji: "📖",
  },
  {
    id: "3",
    name: "Camila Rocha",
    age: 24,
    city: "Curitiba",
    state: "PR",
    denomination: "Pentecostal",
    church: "Assembleia de Deus",
    church_verified: true,
    feconecta_verified: true,
    bio: "Missionária em formação. Meu coração é para as nações e para construir um lar que glorifique a Deus.",
    testimony_type: "audio" as "audio" | "video",
    faith_importance: 5,
    looking_for: "marriage",
    photos: [],
    gradient: "from-[#3a1a2d] to-[#220d1d]",
    emoji: "🕊️",
  },
];

import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showOrarAnim, setShowOrarAnim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromFeconecta, setFromFeconecta] = useState(false);

  useEffect(() => {
    // Check if user came from Feconecta
    const source = localStorage.getItem("fenamoro_source");
    if (source === "feconecta") {
      setFromFeconecta(true);
    }

    const fetchFeed = async () => {
      console.log("fetchFeed started");
      const { data: userData, error: authError } = await supabase.auth.getUser();
      console.log("getUser done", userData, authError);

      if (!userData?.user) {
        console.log("No user, redirecting to login");
        setLoading(false);
        router.push("/login");
        return;
      }
      const currentUser = userData.user;
      setUser(currentUser);

      try {
        console.log("Calling rpc get_proposito_score_feed");
        const { data: dbProfiles, error } = await supabase.rpc("get_proposito_score_feed", { p_user_id: currentUser.id });
        console.log("rpc done", dbProfiles, error);
        if (error) throw error;

        // 2. Fetch photos and tags for the returned profiles
        let profilesWithExtras = dbProfiles || [];
        if (profilesWithExtras.length > 0) {
          const profileIds = profilesWithExtras.map((p: any) => p.id);
          
          const [{ data: photos }, { data: tags }] = await Promise.all([
            supabase.from("dating_photos").select("profile_id, url, is_main").in("profile_id", profileIds),
            supabase.from("dating_theology_tags").select("profile_id, tag").in("profile_id", profileIds)
          ]);

          profilesWithExtras = profilesWithExtras.map((p: any) => ({
            ...p,
            dating_photos: (photos || []).filter((ph: any) => ph.profile_id === p.id),
            dating_theology_tags: (tags || []).filter((t: any) => t.profile_id === p.id)
          }));
        }

        const availableProfiles = profilesWithExtras;
        
        // Transform data to match UI needs
        const mappedProfiles = availableProfiles.map((p: any) => {
          const photos = p.dating_photos || [];
          const tags = p.dating_theology_tags?.map((t: any) => t.tag) || [];
          const mainPhoto = photos.find((ph: any) => ph.is_main) || photos[0];
          
          let calculatedAge = 25;
          if (p.birth_date) {
            const birth = new Date(p.birth_date);
            const diff = Date.now() - birth.getTime();
            calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
          }

          return {
            id: p.id,
            name: p.name || (p.city ? `${p.church_frequency || "Membro"} em ${p.city}` : "Usuário"),
            age: calculatedAge,
            city: p.city || "Brasil",
            state: p.state || "",
            denomination: p.denomination || "Cristão",
            church: p.church_name || "Igreja Local",
            church_verified: p.is_verified,
            feconecta_verified: p.feconecta_verified,
            bio: p.bio || "Buscando o propósito de Deus.",
            testimony_type: p.testimony_type || "audio",
            faith_importance: p.faith_importance,
            looking_for: p.looking_for,
            photos: photos.map((ph: any) => ph.url),
            main_photo: mainPhoto?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
            gradient: "from-[#1a4a3a] to-[#0d2d22]",
            emoji: "🕊️",
            tags: tags
          };
        });

        setProfiles(mappedProfiles);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar o feed");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleOrarAction = async (targetId: string, isSuper: boolean = false) => {
    if (!user) return;
    try {
      // 1. Insert into dating_orar
      await supabase.from("dating_orar").insert({
        sender_id: user.id,
        receiver_id: targetId,
        is_super: isSuper
      });
      // 2. Check for mutual Match
      const { data: mutual } = await supabase.from("dating_orar")
        .select("id")
        .eq("sender_id", targetId)
        .eq("receiver_id", user.id)
        .maybeSingle();
        
      if (mutual) {
        // MATCH!
        const user1_id = user.id < targetId ? user.id : targetId;
        const user2_id = user.id < targetId ? targetId : user.id;
        
        await supabase.from("dating_matches").upsert({
          user1_id,
          user2_id,
        }, { onConflict: "user1_id,user2_id" });
        
        toast.success("Deu Match Divino! 🎉 Vá para a tela de Mensagens.", { duration: 4000 });
        // Optionally redirect: router.push("/match");
      } else {
        toast.success("Oração enviada! 🙏 Aguardando confirmação.");
      }
    } catch(e: any) {
      console.error(e);
      // Supabase UNIQUE constraint error code is 23505
      if (e.code === '23505') {
         toast.error("Você já enviou uma oração para este perfil.");
      } else {
         toast.error("Erro ao enviar oração.");
      }
    }
  };

  const handlePassAction = async (targetId: string) => {
    if (!user) return;
    try {
      // 1. Insert into dating_passes (Geladeira)
      await supabase.from("dating_passes").upsert({
        sender_id: user.id,
        receiver_id: targetId
      }, { onConflict: "sender_id,receiver_id" });
    } catch(e) {
      console.error("Erro ao colocar na geladeira:", e);
    }
  };

  const nextProfile = () => {
    setCurrentIdx((i) => i + 1);
  };

  const handleBackToFeconecta = () => {
    localStorage.removeItem("fenamoro_source");
    if (!process.env.NEXT_PUBLIC_FECONECTA_URL && process.env.NODE_ENV === 'production') {
      alert("Erro: URL de retorno (FéConecta) não configurada no servidor.");
      return;
    }
    const feconectaUrl = process.env.NEXT_PUBLIC_FECONECTA_URL || "http://localhost:3000";
    window.location.href = `${feconectaUrl}/feed`;
  };

  const profile = profiles[currentIdx];

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#F0F2F5" }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] pt-4 pb-3"
        style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
        <div className="flex items-center gap-2">
          {fromFeconecta ? (
            <button
              onClick={handleBackToFeconecta}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">Voltar ao FéConecta</span>
            </button>
          ) : (
            <>
              <Heart className="w-6 h-6 text-white fill-white" />
              <span className="font-outfit font-bold text-lg text-white">FéNamoro</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/matches")}
            className="relative p-2 transition-transform active:scale-95"
          >
            <MessageCircle className="w-6 h-6 text-white/90" />
            <span className="absolute top-1.5 right-1 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
          </button>
          <button 
            onClick={() => router.push("/settings")}
            className="w-8 h-8 rounded-full border-2 border-white/30 overflow-hidden flex items-center justify-center transition-transform active:scale-95"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* ── Subtitle bar ── */}
      <div className="px-5 py-2.5 flex items-center justify-between"
        style={{ background: "#128C7E" }}>
        <p className="text-white/80 text-xs font-jakarta">
          🕊️ Suas conexões de hoje
        </p>
        <span className="text-white/60 text-xs font-jakarta">
          {currentIdx + 1} / {Math.max(1, profiles.length)}
        </span>
      </div>

      {/* ── Card Principal ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-2 relative">
        {loading ? (
           <div className="w-full max-w-sm flex-1 flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075E54]"></div>
           </div>
        ) : !profile ? (
           <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center text-center">
             <div className="text-6xl mb-4">🙌</div>
             <h2 className="text-xl font-bold text-gray-900 mb-2 font-outfit">Você viu todos por hoje!</h2>
             <p className="text-sm text-gray-500 font-jakarta max-w-[280px]">
               Volte mais tarde para encontrar novas conexões na sua região.
             </p>
           </div>
        ) : (
          <ProfileCard
            key={profile.id}
            profile={profile}
            nextProfile={nextProfile}
            showOrarAnim={showOrarAnim}
            setShowOrarAnim={setShowOrarAnim}
            onOrar={handleOrarAction}
            onPass={handlePassAction}
          />
        )}

        {/* Orar Por Animation Overlay Global */}
        {showOrarAnim && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-8xl animate-heart-pop">🙏</div>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="flex items-center justify-around px-4 py-3 pb-[env(safe-area-inset-bottom)]"
        style={{ background: "white", borderTop: "1px solid #E5E7EB" }}>
        {[
          { icon: Home, label: "Início", href: "/feed", active: true },
          { icon: Compass, label: "Explorar", href: "/explore", active: false },
          { icon: MessageCircle, label: "Matches", href: "/matches", active: false },
          { icon: User, label: "Perfil", href: "/profile", active: false },
        ].map(({ icon: Icon, label, href, active }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all"
            style={{ color: active ? "#075E54" : "#9CA3AF" }}>
            <Icon className={`w-5 h-5 ${active ? "fill-current" : ""}`} style={{ strokeWidth: active ? 2.5 : 1.8 }} />
            <span className="text-[10px] font-jakarta font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
