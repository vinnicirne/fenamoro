"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"menu" | "delete_reason" | "success_story">("menu");
  const [deleteReason, setDeleteReason] = useState("");
  const [story, setStory] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const deactivateAccount = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Desativar perfil nas buscas
      await supabase.from("dating_profiles").update({ is_active: false }).eq("id", user.id);

      // Salvar testemunho se for o caso
      if (deleteReason === "found_partner" && story.trim()) {
        await supabase.from("dating_success_stories").insert({
          profile_id: user.id,
          partner_name: partnerName,
          story: story
        });
      }

      await supabase.auth.signOut();
      toast.success("Conta desativada com sucesso. Que Deus te abençoe!");
      router.push("/");
    } catch (e: any) {
      toast.error(e.message || "Erro ao desativar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(160deg, #0a1f1c 0%, #111B21 60%, #0a1a14 100%)" }}>
      
      {/* Header */}
      <div className="flex items-center gap-4 p-5 pt-[env(safe-area-inset-top)] pt-8 border-b border-white/5 bg-black/20">
        <button onClick={() => step === "menu" ? router.push("/feed") : setStep("menu")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <h1 className="text-xl font-bold font-outfit text-white">Configurações</h1>
      </div>

      <div className="flex-1 p-5 animate-fade-in">
        {step === "menu" && (
          <div className="space-y-4">
            <button 
              onClick={handleSignOut}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-white/80 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold font-jakarta text-left flex-1">Sair da Conta</span>
            </button>

            <button 
              onClick={() => setStep("delete_reason")}
              className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="font-semibold font-jakarta text-left flex-1">Excluir / Pausar Conta</span>
            </button>
          </div>
        )}

        {step === "delete_reason" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-outfit text-white">Sentiremos sua falta!</h2>
            <p className="text-white/60 text-sm font-jakarta">Por que você está pausando sua conta?</p>

            <div className="space-y-3">
              <button onClick={() => { setDeleteReason("found_partner"); setStep("success_story"); }}
                className="w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]">
                <Heart className="w-5 h-5 fill-[#25D366]" />
                <span className="font-semibold font-jakarta">Encontrei alguém no FéNamoro! 🙏</span>
              </button>
              
              <button onClick={() => { setDeleteReason("other"); deactivateAccount(); }}
                className="w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
                <span className="font-semibold font-jakarta">Vou dar um tempo dos aplicativos</span>
              </button>

              <button onClick={() => { setDeleteReason("not_liked"); deactivateAccount(); }}
                className="w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
                <span className="font-semibold font-jakarta">Não gostei do aplicativo</span>
              </button>
            </div>
          </div>
        )}

        {step === "success_story" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#25D366] fill-[#25D366]" />
              </div>
              <h2 className="text-2xl font-bold font-outfit text-white">Glória a Deus! 🎉</h2>
              <p className="text-[#25D366] text-sm font-jakarta">Ficamos extremamente felizes por vocês.</p>
            </div>

            <div className="p-5 rounded-3xl bg-black/30 border border-[#25D366]/20 space-y-4 mt-6">
              <p className="text-white/70 text-sm font-jakarta leading-relaxed">
                Nossa maior recompensa é ver famílias nascendo. Você gostaria de compartilhar um breve testemunho de como se conheceram?
              </p>

              <div>
                <label className="block text-white/50 text-xs mb-1">Nome de quem você conheceu (Opcional)</label>
                <input value={partnerName} onChange={e => setPartnerName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#25D366]" />
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1">Breve testemunho (Opcional)</label>
                <textarea value={story} onChange={e => setStory(e.target.value)} rows={4}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#25D366]" />
              </div>
            </div>

            <button onClick={deactivateAccount} disabled={loading}
              className="w-full py-4 rounded-2xl font-bold font-outfit text-white flex justify-center items-center gap-2 mt-4"
              style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Concluir e Desativar Conta"}
            </button>
            <button onClick={deactivateAccount} disabled={loading}
              className="w-full py-3 text-white/40 text-sm font-jakarta text-center">
              Pular testemunho
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
