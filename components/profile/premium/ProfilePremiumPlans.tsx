"use client";

import React from "react";
import { useProfilePremium, PREMIUM_PLANS } from "./ProfilePremiumContext";
import { Check } from "lucide-react";

export function ProfilePremiumPlans() {
  const { selectedPlan, setSelectedPlan } = useProfilePremium();

  return (
    <div className="bg-[#F0F2F5] px-5 py-8 pb-32">
      <h2 className="font-jakarta font-bold text-gray-900 text-center mb-6">
        Escolha o seu plano
      </h2>
      
      <div className="space-y-4">
        {PREMIUM_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${
                isSelected 
                  ? "bg-white border-[#FFD700] shadow-[0_8px_30px_rgba(255,215,0,0.15)]" 
                  : "bg-white border-transparent shadow-sm"
              }`}
            >
              {/* Badges */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111111] text-[#FFD700] text-[10px] font-bold font-jakarta uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                  Mais Popular
                </div>
              )}
              {plan.discountBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold font-jakarta uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                  {plan.discountBadge}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-jakarta font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {plan.title}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-sm text-gray-500 font-manrope">R$</span>
                    <span className={`text-2xl font-black font-outfit ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                      {plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-gray-500 font-manrope">/mês</span>
                  </div>
                  <p className="text-xs text-gray-400 font-manrope mt-1">
                    Faturado como {plan.price}
                  </p>
                </div>

                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "border-[#FFD700] bg-[#FFD700]" : "border-gray-200"
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-[#111111]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
