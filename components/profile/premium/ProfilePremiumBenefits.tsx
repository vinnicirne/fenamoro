"use client";

import React from "react";
import { HeartHandshake, Eye, Rocket, ShieldCheck } from "lucide-react";

export function ProfilePremiumBenefits() {
  const benefits = [
    {
      icon: HeartHandshake,
      title: "Orações Ilimitadas",
      description: "Envie propostas para quantas pessoas o Senhor tocar no seu coração.",
    },
    {
      icon: Eye,
      title: "Veja quem te curtiu",
      description: "Saiba exatamente quem enviou orações para o seu perfil.",
    },
    {
      icon: Rocket,
      title: "Boost de Perfil",
      description: "Seu perfil aparece em destaque para mais pessoas da sua região.",
    },
    {
      icon: ShieldCheck,
      title: "Selo Premium",
      description: "Destaque-se com um selo dourado de confiança no feed.",
    }
  ];

  return (
    <div className="bg-white px-5 py-8">
      <h2 className="font-jakarta font-bold text-gray-900 text-sm uppercase tracking-widest mb-6">
        Benefícios Exclusivos
      </h2>
      
      <div className="space-y-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF9E5] flex items-center justify-center flex-shrink-0">
              <benefit.icon className="w-6 h-6 text-[#FDB931]" />
            </div>
            <div>
              <h3 className="font-jakarta font-bold text-gray-900 mb-1">{benefit.title}</h3>
              <p className="font-manrope text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
