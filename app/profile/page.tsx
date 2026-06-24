"use client";

import React, { useState, useEffect } from "react";
import { Heart, Settings, ShieldCheck, Edit3, ChevronRight, Star, LogOut, Home, Compass, MessageCircle, User, Camera, Bell } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ImageCropperModal } from "@/components/profile/ImageCropperModal";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cropper States
  const [cropperFile, setCropperFile] = useState<string | null>(null);
  const [cropperConfig, setCropperConfig] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        
        supabase
          .from("dating_profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle()
          .then(({ data: profileData }) => {
            if (profileData) setProfile(profileData);
          });
          
        supabase
          .from("dating_photos")
          .select("*")
          .eq("profile_id", data.user.id)
          .eq("is_main", true)
          .maybeSingle()
          .then(({ data: photoData }) => {
            if (photoData) setUserPhoto(photoData.url);
          });

        supabase
          .from("notifications")
          .select("id", { count: 'exact' })
          .eq("recipient_id", data.user.id)
          .eq("is_read", false)
          .then(({ count }) => {
            if (count !== null) setUnreadCount(count);
          });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo! 🕊️");
    window.location.href = "/login";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropperFile(imageUrl);
    setCropperConfig({
      aspect: 3 / 4,
      title: 'Ajustar Foto do FéNamoro',
      isCircular: false
    });
  };

  const onCropDone = async (blob: Blob) => {
    if (!user?.id) return;
    const fileName = `${user.id}-dating-${Date.now()}.jpg`;

    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);

      // Desmarcar foto atual
      await supabase.from('dating_photos').update({ is_main: false }).eq('profile_id', user.id);

      // Inserir nova foto como principal
      await supabase.from('dating_photos').insert({
        profile_id: user.id,
        url: publicUrl,
        is_main: true
      });

      setUserPhoto(publicUrl);
      toast.success("Foto de perfil atualizada!");

      if (cropperFile) URL.revokeObjectURL(cropperFile);
      setCropperFile(null);
      setCropperConfig(null);
    } catch (err: any) {
      toast.error(`Erro no upload: ` + err.message);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Meu Perfil";

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#F0F2F5" }}>

      {/* Header */}
      <header className="px-5 pt-[env(safe-area-inset-top)] pt-4 pb-6"
        style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-outfit font-bold text-xl text-white">Meu Perfil</h1>
          <div className="flex gap-2">
            <Link href="/notifications" className="p-2 relative">
              <Bell className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border border-[#075E54] flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile/edit" className="p-2">
              <Settings className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full border-3 border-white flex items-center justify-center overflow-hidden"
              style={{ background: "rgba(255,255,255,0.15)", border: "3px solid white" }}>
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">😊</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95"
              style={{ background: "#25D366" }}>
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
            </label>
          </div>

          <div>
            <h2 className="font-outfit font-bold text-xl text-white">{displayName}</h2>
            <p className="text-white/60 text-sm font-jakarta">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {profile?.is_verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(37,211,102,0.2)", border: "1px solid rgba(37,211,102,0.3)" }}>
                  <ShieldCheck className="w-3 h-3" style={{ color: "#25D366" }} />
                  <span className="text-[10px] font-jakarta font-semibold" style={{ color: "#25D366" }}>Verificado</span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                <span className="text-[10px] font-jakarta text-white">Free</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 -mt-3 mb-4">
        <div className="rounded-3xl p-4 grid grid-cols-3 divide-x shadow-sm"
          style={{ background: "white", borderColor: "#F3F4F6" }}>
          {[
            { label: "Orações", value: profile?.orar_sent_total || "0", emoji: "🙏" },
            { label: "Matches", value: profile?.matches_count || "0", emoji: "💚" },
            { label: "Vistas", value: profile?.profile_views || "0", emoji: "👁️" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-xl">{stat.emoji}</span>
              <p className="font-outfit font-bold text-gray-800 text-xl">{stat.value}</p>
              <p className="text-gray-400 text-xs font-jakarta">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium CTA */}
      <Link href="/profile/premium" className="mx-4 mb-4 block active:scale-[0.98] transition-transform">
        <div className="rounded-3xl p-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold font-jakarta text-sm">Upgrade para Premium</p>
            <p className="text-white/60 text-xs font-manrope">Orações ilimitadas · Ver quem curtiu · Boost</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </div>
      </Link>

      {/* Menu sections */}
      <div className="px-4 space-y-3">

        {/* Meu perfil */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: "white" }}>
          <p className="px-4 pt-4 pb-2 text-xs font-jakarta uppercase tracking-wider text-gray-400">Meu perfil de namoro</p>
          {[
            { icon: Edit3, label: "Editar perfil", sub: "Foto, bio, denominação", href: "/profile/edit" },
            { icon: Heart, label: "Meu testemunho", sub: "Áudio/vídeo de 45s", href: "/profile/testimony" },
            { 
              icon: ShieldCheck, 
              label: profile?.is_verified ? "Conta verificada" : "Verificação de conta", 
              sub: profile?.is_verified ? "Selo Azul ativo" : "Perfil Autêntico FéConecta", 
              href: profile?.is_verified ? "#" : "/profile/verify" 
            },
          ].map(({ icon: Icon, label, sub, href }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-t"
              style={{ borderColor: "#F9FAFB" }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(7,94,84,0.08)" }}>
                <Icon className="w-4 h-4" style={{ color: "#075E54" }} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-semibold font-jakarta text-sm">{label}</p>
                <p className="text-gray-400 text-xs font-manrope">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>

        {/* Preferências */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: "white" }}>
          <p className="px-4 pt-4 pb-2 text-xs font-jakarta uppercase tracking-wider text-gray-400">Preferências</p>
          {[
            { icon: Settings, label: "Filtros de busca", sub: "Idade, raio, denominação", href: "/profile/filters" },
            { icon: Bell, label: "Notificações", sub: "Push, e-mail", href: "/profile/notifications" },
          ].map(({ icon: Icon, label, sub, href }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-t"
              style={{ borderColor: "#F9FAFB" }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(7,94,84,0.08)" }}>
                <Icon className="w-4 h-4" style={{ color: "#075E54" }} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-semibold font-jakarta text-sm">{label}</p>
                <p className="text-gray-400 text-xs font-manrope">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>

        {/* Sair */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-3xl shadow-sm transition-all active:scale-98"
          style={{ background: "white" }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-red-500 font-semibold font-jakarta text-sm">Sair da conta</span>
        </button>

        <div className="pb-6" />
      </div>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-4 py-3 pb-[env(safe-area-inset-bottom)] sticky bottom-0"
        style={{ background: "white", borderTop: "1px solid #E5E7EB" }}>
        {[
          { icon: Home, label: "Início", href: "/feed", active: false },
          { icon: Compass, label: "Explorar", href: "/explore", active: false },
          { icon: MessageCircle, label: "Matches", href: "/matches", active: false },
          { icon: User, label: "Perfil", href: "/profile", active: true },
        ].map(({ icon: Icon, label, href, active }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all"
            style={{ color: active ? "#075E54" : "#9CA3AF" }}>
            <Icon className="w-5 h-5" style={{ strokeWidth: active ? 2.5 : 1.8 }} />
            <span className="text-[10px] font-jakarta font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {cropperFile && cropperConfig && (
        <ImageCropperModal
          image={cropperFile}
          isOpen={!!cropperFile}
          onClose={() => {
            if (cropperFile) URL.revokeObjectURL(cropperFile);
            setCropperFile(null);
            setCropperConfig(null);
          }}
          onCropComplete={onCropDone}
          aspect={cropperConfig.aspect}
          title={cropperConfig.title}
          isCircular={cropperConfig.isCircular}
        />
      )}
    </div>
  );
}
