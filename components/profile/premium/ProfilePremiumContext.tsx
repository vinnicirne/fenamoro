"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export type PlanPeriod = "monthly" | "quarterly" | "semiannual";

export interface PlanConfig {
  id: PlanPeriod;
  title: string;
  price: string;
  monthlyPrice: string;
  link: string;
  discountBadge?: string;
  isPopular?: boolean;
}

export const PREMIUM_PLANS: PlanConfig[] = [
  {
    id: "monthly",
    title: "Mensal",
    price: "R$ 59,99",
    monthlyPrice: "59,99",
    link: "https://pay.kiwify.com.br/6SYzNoJ",
  },
  {
    id: "quarterly",
    title: "Trimestral",
    price: "R$ 89,90",
    monthlyPrice: "29,96",
    link: "https://pay.kiwify.com.br/pDB1qtz",
    isPopular: true,
  },
  {
    id: "semiannual",
    title: "Semestral",
    price: "R$ 119,90",
    monthlyPrice: "19,98",
    link: "https://pay.kiwify.com.br/FqJ2cYZ",
    discountBadge: "Economize 33%",
  }
];

interface ProfilePremiumContextData {
  selectedPlan: PlanPeriod;
  setSelectedPlan: (plan: PlanPeriod) => void;
  userEmail: string | null;
  userId: string | null;
  handleCheckout: () => void;
}

const ProfilePremiumContext = createContext<ProfilePremiumContextData | undefined>(undefined);

export function ProfilePremiumProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanPeriod>("quarterly");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
      setUserEmail(data.user.email || null);
    });
  }, [router]);

  const handleCheckout = async () => {
    const plan = PREMIUM_PLANS.find(p => p.id === selectedPlan);
    if (!plan || !userId) return;

    // 1. Registro da Intenção de Compra (Carrinho Abandonado)
    try {
      await supabase.from("dating_profiles").update({
        last_checkout_click_at: new Date().toISOString(),
        last_checkout_plan: plan.id,
        abandoned_cart_step: 0
      }).eq("id", userId);
    } catch (err) {
      console.error("Erro ao registrar intenção de compra:", err);
    }

    // 2. Construção da URL e Redirecionamento
    let checkoutUrl = plan.link;
    const params = new URLSearchParams();
    
    // Injeção de Segurança para Webhook Tracking (Kiwify usa 'email' e 'src')
    if (userEmail) params.append("email", userEmail);
    if (userId) params.append("src", userId);

    if (params.toString()) {
      checkoutUrl += `?${params.toString()}`;
    }

    // Abre o Checkout na mesma aba
    window.location.href = checkoutUrl;
  };

  return (
    <ProfilePremiumContext.Provider value={{ selectedPlan, setSelectedPlan, userEmail, userId, handleCheckout }}>
      {children}
    </ProfilePremiumContext.Provider>
  );
}

export function useProfilePremium() {
  const context = useContext(ProfilePremiumContext);
  if (!context) throw new Error("useProfilePremium deve ser usado dentro do provider");
  return context;
}
