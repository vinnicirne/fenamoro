"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle2, Shield, Eye, Settings2, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const PLANS = [
  { id: "1_month", months: 1, price: "59,90", label: "Mensal", savings: null },
  { id: "3_months", months: 3, price: "89,90", label: "Trimestral", savings: "Mais Popular", isPopular: true },
  { id: "6_months", months: 6, price: "119,90", label: "Semestral", savings: "Melhor Valor" }
];

const FEATURES = [
  { icon: <Eye className="w-5 h-5" />, title: "Veja quem te curtiu", desc: "Descubra quem enviou um 'Orar Por' antes de retribuir." },
  { icon: <Settings2 className="w-5 h-5" />, title: "Filtros Avançados", desc: "Filtre por denominação, cargo na igreja e mais." },
  { icon: <Heart className="w-5 h-5" />, title: "Curtidas Ilimitadas", desc: "Envie quantos 'Orar Por' quiser todos os dias." },
  { icon: <Shield className="w-5 h-5" />, title: "Destaque Premium", desc: "Seu perfil ganha prioridade no feed da sua região." }
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Simulação do pagamento / webhook
      toast("Processando pagamento seguro...");
      await new Promise(r => setTimeout(r, 1500));

      const { error } = await supabase.rpc("upgrade_to_premium", {
        p_user_id: user.id,
        p_months: selectedPlan.months
      });

      if (error) throw error;

      toast.success("Pagamento aprovado! Bem-vindo ao FéNamoro Premium 🎉");
      router.push("/matches");

    } catch (err: any) {
      toast.error(err.message || "Erro ao processar assinatura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col relative" style={{ background: "linear-gradient(160deg, #0a1f1c 0%, #111B21 50%, #0a1a14 100%)" }}>
      
      {/* Background glow effects - No Gold, Only Teal/Emerald */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "rgba(37,211,102,0.15)" }} />
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: "rgba(18,140,126,0.15)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-[env(safe-area-inset-top)] pt-6 pb-2 flex justify-between items-center">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 relative z-10">
        
        {/* Title */}
        <div className="text-center mt-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 12px 32px rgba(37,211,102,0.3)" }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-outfit font-black text-3xl text-white tracking-tight mb-2">FéNamoro Premium</h1>
          <p className="font-manrope text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
            Aumente suas chances de encontrar conexões com propósito de forma mais rápida e focada.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-10">
          {FEATURES.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="mt-0.5 text-whatsapp-green">{feat.icon}</div>
              <div>
                <h3 className="text-white font-semibold font-jakarta text-sm mb-1">{feat.title}</h3>
                <p className="text-white/50 text-xs font-manrope leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative cursor-pointer transition-all duration-300 rounded-3xl p-5 border-2 ${selectedPlan.id === plan.id ? 'border-whatsapp-green bg-whatsapp-green/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
            >
              {plan.savings && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${plan.isPopular ? 'bg-whatsapp-green text-[#0a1f1c]' : 'bg-white/20 text-white'}`}>
                  {plan.savings}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-jakarta mb-1">{plan.label}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-white font-bold text-xl">R$</span>
                    <span className="text-white font-black text-3xl font-outfit leading-none">{plan.price}</span>
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${selectedPlan.id === plan.id ? 'border-whatsapp-green bg-whatsapp-green' : 'border-white/20'}`}>
                  {selectedPlan.id === plan.id && <CheckCircle2 className="w-4 h-4 text-[#0a1f1c]" />}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* CTA Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pt-8 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        style={{ background: "linear-gradient(to top, #0a1a14 70%, transparent)" }}>
        <button 
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 24px rgba(37,211,102,0.25)" }}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Assinar plano de ${selectedPlan.months} ${selectedPlan.months === 1 ? 'Mês' : 'Meses'}`}
        </button>
        <p className="text-center text-white/30 text-[10px] font-jakarta mt-3">
          Pagamento seguro. Cancele quando quiser nas configurações.
        </p>
      </div>

    </div>
  );
}
