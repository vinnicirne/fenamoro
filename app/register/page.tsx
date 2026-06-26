"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Heart, ArrowRight, Church, Book, Mic, Users, Image as ImageIcon, Check, Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { scanImageForNsfw } from "@/features/moderation/NsfwScanner";

const STEPS = [
  { id: 1, icon: Church, title: "Sua Igreja", sub: "Afiliação eclesiástica", color: "#075E54" },
  { id: 2, icon: Book,   title: "Sua Doutrina", sub: "Tags teológicas", color: "#128C7E" },
  { id: 3, icon: Mic,    title: "Seu Testemunho", sub: "Áudio ou vídeo de 45s", color: "#25D366" },
  { id: 4, icon: Users,  title: "Seus Valores", sub: "O que você busca", color: "#075E54" },
  { id: 5, icon: ImageIcon, title: "Finalizar", sub: "Foto e Senha", color: "#128C7E" },
];

const DENOMINATIONS = [
  "Assembleia de Deus", "Evangelho Quadrangular", "Congregação Cristã (CCB)", 
  "Universal", "Bola de Neve", "Mundial",
  "Batista", "Presbiteriana", "Metodista", "Luterana", 
  "Adventista", "Católica", "Ortodoxa", "Outra"
];
const THEOLOGY_TAGS = [
  "Pentecostal", "Neopentecostal", "Tradicional / Histórica",
  "Reformada / Calvinista", "Arminiana", "Conservadora",
  "Carismática", "Continuacionista", "Cessacionista",
  "Guerra Espiritual"
];
const LOOKING_FOR_OPTIONS = [
  { value: "marriage", label: "💍 Casamento", sub: "Busco parceria vitalícia" },
  { value: "relationship", label: "❤️ Relacionamento sério", sub: "Com intenção de futuro" },
  { value: "undecided", label: "🙏 Deixando Deus guiar", sub: "Aberto ao que Deus preparou" },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [scanningPhoto, setScanningPhoto] = useState(false);

  const [form, setForm] = useState({
    churchName: "",
    denomination: "",
    churchRole: "",
    tags: [] as string[],
    testimony_type: "audio" as "audio" | "video",
    lookingFor: "",
    icebreaker: "",
    password: "",
    name: "",
    customDenomination: "",
    customChurchRole: "",
    customTag: "",
    gender: "",
    birthdate: "",
    termsAccepted: false,
    photoFile: null as File | null,
    photoPreviewUrl: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSessionUser(data.user));
  }, []);

  const progress = (step / STEPS.length) * 100;

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login com Google.");
      setLoading(false);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      let userId = sessionUser?.id;

      // 1. Criar Auth User se não estiver logado
      if (!userId) {
        if (!initialEmail || !form.password || !form.name) {
          toast.error("Preencha nome e senha");
          setLoading(false);
          return;
        }
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: initialEmail,
          password: form.password,
          options: {
            data: { full_name: form.name }
          }
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      }

      if (!userId) throw new Error("Erro ao criar usuário");

      const finalDenomination = form.denomination === "Outra" ? form.customDenomination : form.denomination;
      const finalRole = form.churchRole === "Outro" ? form.customChurchRole : form.churchRole;

      // 2. Inserir no Dating Profiles
      const { error: profileError } = await supabase.from("dating_profiles").upsert({
        id: userId,
        name: form.name,
        gender: form.gender,
        birth_date: form.birthdate,
        church_name: form.churchName,
        denomination: finalDenomination,
        church_frequency: finalRole,
        testimony_type: form.testimony_type,
        looking_for: form.lookingFor,
        icebreaker_question: form.icebreaker || "Qual versículo mais moldou seu caráter?",
        is_active: true
      });

      if (profileError) throw profileError;

      // 3. Inserir Tags Teológicas
      let finalTags = [...form.tags];
      if (finalTags.includes("Outra") && form.customTag.trim()) {
        finalTags = finalTags.filter(t => t !== "Outra");
        finalTags.push(form.customTag.trim());
      }

      if (finalTags.length > 0) {
        const tagsData = finalTags.map(tag => ({
          profile_id: userId,
          tag: tag
        }));
        await supabase.from("dating_theology_tags").delete().eq("profile_id", userId);
        await supabase.from("dating_theology_tags").insert(tagsData);
      }

      if (form.photoFile) {
        const fileExt = form.photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${userId}-dating-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, form.photoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

        await supabase.from("dating_photos").insert({
          profile_id: userId,
          url: publicUrl,
          is_main: true
        });
      }

      toast.success("Perfil criado! Bem-vindo ao FéNamoro 🕊️");
      router.push("/feed");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validações básicas por step (Security Review)
    if (step === 1) {
      if (!form.name || !form.gender || !form.birthdate || !form.churchName || !form.denomination || !form.churchRole) {
        toast.error("Preencha todos os campos obrigatórios.");
        return;
      }
      if (form.denomination === "Outra" && !form.customDenomination.trim()) {
        toast.error("Preencha a sua denominação");
        return;
      }
      if (form.churchRole === "Outro" && !form.customChurchRole.trim()) {
        toast.error("Preencha o seu envolvimento na igreja");
        return;
      }
      
      // Validar maior de 18 anos
      const birthDate = new Date(form.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toast.error("Você precisa ter pelo menos 18 anos para usar o FéNamoro.");
        return;
      }
    }
    if (step === 2) {
      if (form.tags.includes("Outra") && !form.customTag.trim()) {
        toast.error("Especifique a sua doutrina");
        return;
      }
    }
    if (step === 4 && (!form.lookingFor)) {
      toast.error("Selecione o que você busca");
      return;
    }

    if (step < STEPS.length) {
      setStep((s) => s + 1);
    } else {
      submitForm();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-[env(safe-area-inset-top)] pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-outfit font-bold text-white text-lg">Aliança</span>
          <span className="ml-auto text-white/40 text-sm font-jakarta">{step}/{STEPS.length}</span>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #075E54, #25D366)" }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6">
        <div className="flex items-center gap-3 mb-6">
          {React.createElement(STEPS[step - 1].icon, { className: "w-6 h-6", style: { color: "#25D366" } })}
          <div>
            <h2 className="font-outfit font-bold text-xl text-white">{STEPS[step - 1].title}</h2>
            <p className="text-white/50 text-sm font-jakarta">{STEPS[step - 1].sub}</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Google Login */}
            {!sessionUser && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white text-black py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Preencher dados via Google
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ou responda as perguntas abaixo</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 text-xs font-jakarta uppercase tracking-wider mb-2">Gênero</label>
                <select 
                  value={form.gender} 
                  onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10 appearance-none"
                >
                  <option value="" disabled className="text-gray-900">Selecione</option>
                  <option value="male" className="text-gray-900">Homem</option>
                  <option value="female" className="text-gray-900">Mulher</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-xs font-jakarta uppercase tracking-wider mb-2">Nascimento</label>
                <input 
                  type="date"
                  value={form.birthdate} 
                  onChange={(e) => setForm(f => ({ ...f, birthdate: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10 [color-scheme:dark]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-jakarta uppercase tracking-wider mb-2">Nome da sua Igreja</label>
              <input value={form.churchName} onChange={(e) => setForm(f => ({ ...f, churchName: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10" />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-jakarta uppercase tracking-wider mb-2">Denominação</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DENOMINATIONS.map((d) => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, denomination: d }))}
                    className="px-4 py-2 rounded-2xl text-sm transition-all"
                    style={{
                      background: form.denomination === d ? "linear-gradient(135deg, #075E54, #128C7E)" : "rgba(255,255,255,0.06)",
                      color: form.denomination === d ? "white" : "rgba(255,255,255,0.6)",
                    }}>{d}</button>
                ))}
              </div>
              {form.denomination === "Outra" && (
                <input 
                  autoFocus
                  placeholder="Qual é a sua denominação?"
                  value={form.customDenomination} 
                  onChange={(e) => setForm(f => ({ ...f, customDenomination: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10" 
                />
              )}
            </div>
            <div>
              <label className="block text-white/60 text-xs font-jakarta uppercase tracking-wider mb-2">Seu envolvimento</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Membro", "Louvor", "Liderança", "Missionário", "Outro"].map((role) => (
                  <button key={role} onClick={() => setForm(f => ({ ...f, churchRole: role }))}
                    className="px-4 py-2 rounded-2xl text-sm transition-all"
                    style={{
                      background: form.churchRole === role ? "rgba(37,211,102,0.2)" : "rgba(255,255,255,0.06)",
                      color: form.churchRole === role ? "#25D366" : "rgba(255,255,255,0.6)",
                    }}>{role}</button>
                ))}
              </div>
              {form.churchRole === "Outro" && (
                <input 
                  autoFocus
                  placeholder="Especifique seu envolvimento"
                  value={form.customChurchRole} 
                  onChange={(e) => setForm(f => ({ ...f, customChurchRole: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10" 
                />
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {[...THEOLOGY_TAGS, "Outra"].map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className="px-4 py-2.5 rounded-2xl text-sm transition-all flex items-center gap-2"
                  style={{
                    background: form.tags.includes(tag) ? "linear-gradient(135deg, #075E54, #128C7E)" : "rgba(255,255,255,0.06)",
                    color: form.tags.includes(tag) ? "white" : "rgba(255,255,255,0.6)",
                  }}>
                  {form.tags.includes(tag) && <Check className="w-3.5 h-3.5" />} {tag}
                </button>
              ))}
            </div>
            {form.tags.includes("Outra") && (
              <input 
                autoFocus
                placeholder="Especifique a sua doutrina"
                value={form.customTag} 
                onChange={(e) => setForm(f => ({ ...f, customTag: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10" 
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              {(["audio", "video"] as const).map((type) => (
                <button key={type} onClick={() => setForm(f => ({ ...f, testimony_type: type }))}
                  className="flex-1 py-4 rounded-3xl flex flex-col items-center gap-2 transition-all"
                  style={{ background: form.testimony_type === type ? "linear-gradient(135deg, #075E54, #128C7E)" : "rgba(255,255,255,0.06)" }}>
                  <span className="text-3xl">{type === "audio" ? "🎙️" : "🎥"}</span>
                  <span className="text-sm font-semibold text-white">{type === "audio" ? "Áudio" : "Vídeo"}</span>
                </button>
              ))}
            </div>
            <button className="w-full py-6 rounded-3xl flex flex-col items-center border-2 border-dashed border-[#25D366]/30">
              <span className="font-outfit font-bold text-white">Upload Testemunho</span>
              <span className="text-white/40 text-xs">Para esta etapa, simularemos o upload</span>
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {LOOKING_FOR_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setForm(f => ({ ...f, lookingFor: opt.value }))}
                className="w-full p-4 rounded-3xl text-left flex items-center gap-3 transition-all"
                style={{ background: form.lookingFor === opt.value ? "rgba(7,94,84,0.3)" : "rgba(255,255,255,0.05)" }}>
                <div className="flex-1">
                  <p className="font-semibold text-white">{opt.label}</p>
                  <p className="text-white/50 text-xs">{opt.sub}</p>
                </div>
                {form.lookingFor === opt.value && <Check className="w-4 h-4 text-[#25D366]" />}
              </button>
            ))}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-white/60 text-xs mb-2">Sexo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, gender: "male" }))}
                    className={`flex-1 py-3 rounded-2xl font-outfit font-medium text-sm transition-all border ${
                      form.gender === "male" 
                      ? "bg-[#075E54] text-white border-transparent" 
                      : "bg-white/5 text-white/80 border-white/10"
                    }`}
                  >
                    Masculino
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, gender: "female" }))}
                    className={`flex-1 py-3 rounded-2xl font-outfit font-medium text-sm transition-all border ${
                      form.gender === "female" 
                      ? "bg-[#075E54] text-white border-transparent" 
                      : "bg-white/5 text-white/80 border-white/10"
                    }`}
                  >
                    Feminino
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => setForm(f => ({ ...f, birthdate: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-3xl bg-black/20 border border-white/5">
              <label className="block text-white/90 text-sm font-semibold mb-1 font-outfit">Pergunta Quebra-Gelo <span className="text-white/40 text-xs font-normal font-jakarta tracking-wide">(OPCIONAL)</span></label>
              <p className="text-white/50 text-xs mb-3 font-manrope leading-relaxed">
                Quando ocorrer um match, o chat <b>não</b> será liberado imediatamente. A outra pessoa precisará responder a essa sua pergunta para destravar a conversa. Isso filtra contatos superficiais!
              </p>
              <input value={form.icebreaker} onChange={(e) => setForm(f => ({ ...f, icebreaker: e.target.value }))}
                placeholder="Ex: Qual versículo mais moldou seu caráter?"
                className="w-full px-4 py-3.5 rounded-2xl text-white text-sm outline-none bg-white/5 border border-white/10 placeholder:text-white/20" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold font-outfit text-white mb-2">Finalizar</h2>
            <p className="text-white/60 text-sm font-jakarta">Foto e Senha</p>

            <div className="mt-6 flex items-start gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
              <input 
                type="checkbox" 
                id="terms" 
                checked={form.termsAccepted}
                onChange={(e) => setForm(f => ({ ...f, termsAccepted: e.target.checked }))}
                className="mt-1 w-5 h-5 rounded border-gray-400 text-[#075E54] focus:ring-[#25D366] bg-transparent"
              />
              <label htmlFor="terms" className="text-xs text-white/70 font-jakarta leading-relaxed">
                Declaro que tenho <strong>mais de 18 anos</strong>, sou o titular desta foto, e concordo com os Termos de Responsabilidade e Diretrizes de Comunidade do FéNamoro.
              </label>
            </div>

            <div className="relative h-40 border-2 border-dashed border-[#25D366]/50 rounded-3xl flex flex-col items-center justify-center bg-[#25D366]/5 overflow-hidden group">
              {scanningPhoto ? (
                <div className="flex flex-col items-center justify-center text-[#25D366]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366] mb-2"></div>
                  <span className="font-jakarta text-xs font-bold uppercase tracking-widest text-center px-4">Analisando segurança da foto (IA Local)...</span>
                </div>
              ) : form.photoPreviewUrl ? (
                <img src={form.photoPreviewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mb-2 text-[#25D366] opacity-80" />
                  <span className="font-jakarta text-sm text-[#25D366] font-medium">Adicionar foto do perfil (Obrigatório)</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*"
                disabled={scanningPhoto}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setScanningPhoto(true);
                  try {
                    const objectUrl = URL.createObjectURL(file);
                    const img = new Image();
                    img.src = objectUrl;
                    await new Promise((resolve) => (img.onload = resolve));
                    
                    const isSafe = await scanImageForNsfw(img);
                    if (!isSafe) {
                      toast.error("Foto inadequada bloqueada! Nosso ambiente é cristão e seguro.");
                      e.target.value = ''; // clear input
                      return;
                    }
                    
                    setForm(f => ({ ...f, photoFile: file, photoPreviewUrl: objectUrl }));
                    toast.success("Foto analisada e aprovada com segurança!");
                  } catch(error) {
                    console.error(error);
                    toast.error("Erro ao analisar imagem.");
                  } finally {
                    setScanningPhoto(false);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
            

            {!sessionUser && (
              <div className="p-4 rounded-3xl bg-black/20 mt-4 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-[#25D366]" />
                  <span className="text-white text-sm font-semibold">Criação da Conta</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Seu Nome</label>
                    <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none bg-white/5" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">E-mail</label>
                    <input type="text" disabled value={initialEmail}
                      className="w-full px-4 py-2.5 rounded-xl text-white/50 text-sm outline-none bg-white/5 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Crie uma Senha</label>
                    <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none bg-white/5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de avançar */}
      <div className="px-5 pb-8">
        <button onClick={nextStep} disabled={loading || scanningPhoto || (step === STEPS.length && (!form.termsAccepted || !form.photoFile))}
          className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 24px rgba(37,211,102,0.25)" }}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            step === STEPS.length ? (
              <><span>Criar meu perfil 🕊️</span><Heart className="w-5 h-5 fill-white" /></>
            ) : (
              <><span>Continuar</span><ArrowRight className="w-5 h-5" /></>
            )
          )}
        </button>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(160deg, #0a1f1c 0%, #111B21 60%, #0a1a14 100%)" }}>
      <Suspense fallback={<div className="p-8 text-center text-white/50">Carregando...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
