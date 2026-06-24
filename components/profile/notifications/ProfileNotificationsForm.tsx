"use client";

import React from "react";
import { useProfileNotifications } from "./ProfileNotificationsContext";
import { Loader2, Heart, MessageCircle, Eye, Mail } from "lucide-react";

export function ProfileNotificationsForm() {
  const { notifications, toggleNotification, loading } = useProfileNotifications();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#075E54] animate-spin" />
      </div>
    );
  }

  const notificationOptions = [
    {
      id: "notify_new_matches" as const,
      icon: Heart,
      title: "Novos Matches",
      description: "Quando alguém curtir você de volta",
      iconColor: "text-red-500",
      iconBg: "bg-red-50"
    },
    {
      id: "notify_new_messages" as const,
      icon: MessageCircle,
      title: "Mensagens",
      description: "Quando receber mensagens no chat",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50"
    },
    {
      id: "notify_profile_views" as const,
      icon: Eye,
      title: "Visualizações de Perfil",
      description: "Quando alguém ver o seu perfil",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50"
    },
    {
      id: "notify_email_digest" as const,
      icon: Mail,
      title: "Resumo por E-mail",
      description: "Sugestões de novos perfis na sua região (Semanal)",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-6">
      
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
        {notificationOptions.map((opt) => {
          const isActive = notifications[opt.id];
          
          return (
            <div key={opt.id} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${opt.iconBg}`}>
                <opt.icon className={`w-5 h-5 ${opt.iconColor}`} />
              </div>
              
              <div className="flex-1">
                <p className="text-gray-900 font-bold font-jakarta text-sm">{opt.title}</p>
                <p className="text-gray-500 text-xs font-manrope">{opt.description}</p>
              </div>
              
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => toggleNotification(opt.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-[#075E54]' : 'bg-gray-200'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
