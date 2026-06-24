"use client";

import React from "react";
import { useProfileFilters } from "./ProfileFiltersContext";
import { Loader2 } from "lucide-react";

export function ProfileFiltersForm() {
  const { filters, updateFilter, loading } = useProfileFilters();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#075E54] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-6 space-y-8">
      
      {/* Faixa de Idade */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Faixa de Idade</label>
          <span className="text-sm font-jakarta text-[#075E54] font-semibold">
            {filters.min_age_pref} - {filters.max_age_pref} anos
          </span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-gray-500 font-manrope">Mínima</label>
            <input 
              type="number" 
              value={filters.min_age_pref}
              onChange={(e) => updateFilter("min_age_pref", parseInt(e.target.value) || 18)}
              min={18} max={99}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-jakarta outline-none focus:ring-2 focus:ring-[#075E54]/20 focus:border-[#075E54] transition-all"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-gray-500 font-manrope">Máxima</label>
            <input 
              type="number" 
              value={filters.max_age_pref}
              onChange={(e) => updateFilter("max_age_pref", parseInt(e.target.value) || 99)}
              min={18} max={99}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-jakarta outline-none focus:ring-2 focus:ring-[#075E54]/20 focus:border-[#075E54] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Distância */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Distância Máxima</label>
          <span className="text-sm font-jakarta text-[#075E54] font-semibold">
            Até {filters.max_distance_pref} km
          </span>
        </div>
        <input 
          type="range" 
          value={filters.max_distance_pref}
          onChange={(e) => updateFilter("max_distance_pref", parseInt(e.target.value))}
          min={1} max={200} step={1}
          className="w-full accent-[#075E54]"
        />
        <div className="flex justify-between text-xs text-gray-400 font-manrope">
          <span>1 km</span>
          <span>200 km</span>
        </div>
      </div>

      {/* Denominação Preferida */}
      <div className="space-y-4">
        <label className="block text-sm font-bold font-jakarta text-gray-900">Denominação Preferida</label>
        <div className="space-y-2">
          {["todas", "batista", "assembleia", "presbiteriana", "adventista", "universal", "quadrangular", "outra"].map(denom => {
            const isCustom = !["todas", "batista", "assembleia", "presbiteriana", "adventista", "universal", "quadrangular"].includes(filters.preferred_denomination);
            const isSelected = denom === "outra" ? isCustom : filters.preferred_denomination === denom;
            
            return (
              <div key={denom}>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="preferred_denomination"
                      checked={isSelected}
                      onChange={() => updateFilter("preferred_denomination", denom === "outra" ? "" : denom)}
                      className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[#075E54] checked:bg-[#075E54] transition-all"
                    />
                    <div className="absolute w-2 h-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-sm font-jakarta text-gray-800 capitalize">
                    {denom === "todas" ? "Mostrar todas as igrejas" : denom}
                  </span>
                </label>
                
                {/* Custom Input for 'Outra' */}
                {denom === "outra" && isCustom && (
                  <div className="mt-2 pl-8">
                    <input
                      type="text"
                      placeholder="Digite a denominação..."
                      value={filters.preferred_denomination}
                      onChange={(e) => updateFilter("preferred_denomination", e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-jakarta outline-none focus:ring-2 focus:ring-[#075E54]/20 focus:border-[#075E54] transition-all text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
