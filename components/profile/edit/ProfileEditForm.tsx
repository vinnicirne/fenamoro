"use client";

import React from "react";
import { useProfileEdit } from "./ProfileEditContext";

export function ProfileEditForm() {
  const { formData, updateField, loading } = useProfileEdit();

  if (loading) {
    return (
      <div className="flex-1 px-5 py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075E54]"></div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6 flex-1 overflow-y-auto">
      
      {/* Identidade */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">
            Seu Gênero <span className="text-red-500">*</span>
          </label>
          <select 
            value={formData.gender || ""}
            onChange={(e) => updateField("gender", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all outline-none appearance-none"
          >
            <option value="" disabled className="text-gray-900">Selecione...</option>
            <option value="male" className="text-gray-900">Homem</option>
            <option value="female" className="text-gray-900">Mulher</option>
          </select>
          <p className="text-[10px] text-gray-500 font-manrope">
            O FéNamoro usa isso para sugerir perfis apenas do sexo oposto.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">
            Data de Nascimento <span className="text-red-500">*</span>
          </label>
          <input 
            type="date"
            value={formData.birth_date || ""}
            onChange={(e) => updateField("birth_date", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] outline-none"
          />
          <p className="text-[10px] text-gray-500 font-manrope">
            Você deve ter pelo menos 18 anos. Sua idade será calculada automaticamente.
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Bio */}
      <div className="space-y-2">
        <label className="block text-sm font-bold font-jakarta text-gray-900">
          Sua Biografia <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 font-manrope">
          Como você descreveria seu relacionamento com Deus e seus hobbies?
        </p>
        <textarea 
          value={formData.bio || ""}
          onChange={(e) => updateField("bio", e.target.value)}
          placeholder="Ex: Amo louvar, ler a bíblia e tomar café..."
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 min-h-[120px] font-jakarta text-sm text-gray-900 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all outline-none resize-none"
        />
        <div className="text-right text-[10px] text-gray-400 font-bold">
          {(formData.bio || "").length}/500
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Religião */}
      <h3 className="font-outfit font-bold text-lg text-gray-900">Sua Fé</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Denominação</label>
          <input 
            type="text"
            value={formData.denomination || ""}
            onChange={(e) => updateField("denomination", e.target.value)}
            placeholder="Ex: Batista, Presbiteriana, Assembleia..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Nome da sua Igreja Local</label>
          <input 
            type="text"
            value={formData.church_name || ""}
            onChange={(e) => updateField("church_name", e.target.value)}
            placeholder="Ex: Igreja Batista da Lagoinha"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all outline-none"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Qual o seu cargo / frequência?</label>
          <select 
            value={formData.church_frequency || ""}
            onChange={(e) => updateField("church_frequency", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all outline-none appearance-none"
          >
            <option value="" disabled className="text-gray-900">Selecione...</option>
            <option value="Membro Ativo" className="text-gray-900">Membro Ativo</option>
            <option value="Líder de Célula" className="text-gray-900">Líder / Obreiro</option>
            <option value="Pastor/Missionário" className="text-gray-900">Pastor / Missionário</option>
            <option value="Visitante" className="text-gray-900">Apenas Visitante</option>
          </select>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Localização */}
      <h3 className="font-outfit font-bold text-lg text-gray-900">Localização</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Cidade</label>
          <input 
            type="text"
            value={formData.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Ex: São Paulo"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold font-jakarta text-gray-900">Estado (UF)</label>
          <input 
            type="text"
            maxLength={2}
            value={formData.state || ""}
            onChange={(e) => updateField("state", e.target.value.toUpperCase())}
            placeholder="SP"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-jakarta text-sm text-gray-900 focus:border-[#25D366] outline-none uppercase"
          />
        </div>
      </div>

      {/* Paddings Extras para o botão não sobrepor */}
      <div className="h-24"></div>
    </div>
  );
}
