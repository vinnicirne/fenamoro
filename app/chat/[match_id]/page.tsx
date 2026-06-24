"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical, Send, ShieldAlert, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const match_id = Array.isArray(params.match_id) ? params.match_id[0] : params.match_id;
  
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [icebreakerAnswered, setIcebreakerAnswered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const loadChat = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }
      const currentUser = userData.user;
      setUser(currentUser);

      try {
        // 1. Validar e buscar o Match
        const { data: match } = await supabase
          .from("dating_matches")
          .select("*")
          .eq("id", match_id)
          .single();

        if (!match) {
          toast.error("Match não encontrado");
          router.push("/matches");
          return;
        }

        const partnerId = match.user1_id === currentUser.id ? match.user2_id : match.user1_id;

        // 2. Buscar Perfil do Parceiro
        const { data: partnerProfile } = await supabase
          .from("dating_profiles")
          .select("id, name, icebreaker_question")
          .eq("id", partnerId)
          .single();

        const { data: partnerPhoto } = await supabase
          .from("dating_photos")
          .select("url")
          .eq("profile_id", partnerId)
          .eq("is_main", true)
          .single();

        setPartner({
          ...partnerProfile,
          photo: partnerPhoto?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800"
        });

        // 3. Buscar Mensagens
        const { data: dbMessages } = await supabase
          .from("dating_messages")
          .select("*")
          .eq("match_id", match_id)
          .order("created_at", { ascending: true });

        setMessages(dbMessages || []);

        // 4. Checar destrave do Icebreaker
        const hasAnswered = dbMessages?.some(m => m.sender_id === currentUser.id && m.is_icebreaker_answer === true);
        setIcebreakerAnswered(!!hasAnswered);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    // 5. Iniciar Realtime de forma segura para StrictMode
    channel = supabase.channel(`match_${match_id}`);
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "dating_messages", filter: `match_id=eq.${match_id}` },
      (payload) => {
        setMessages((prev) => {
          // Prevenir duplicação no optimistic UI
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        if (payload.new.is_icebreaker_answer) {
          setIcebreakerAnswered(true);
        }
      }
    ).subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [match_id, router]);

  const handleSendMessage = async (isIcebreaker: boolean = false) => {
    if (!inputText.trim() || !user) return;
    
    const text = inputText.trim();
    setInputText(""); // Optimistic clear

    try {
      const { error } = await supabase.from("dating_messages").insert({
        match_id: match_id,
        sender_id: user.id,
        content: text,
        is_icebreaker_answer: isIcebreaker
      });
      
      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Erro ao enviar: ${error.message}`);
        throw error;
      }

      if (isIcebreaker) {
        setIcebreakerAnswered(true);
      }
    } catch (e: any) {
      console.error("Catch Error:", e);
    }
  };

  if (loading || !partner) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075E54]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F0F2F5]">
      {/* ── Header ── */}
      <header className="flex items-center px-4 pt-[env(safe-area-inset-top)] pt-4 pb-3 shadow-sm z-10"
        style={{ background: "white" }}>
        <button onClick={() => router.push("/matches")} className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-1 items-center gap-3 ml-2">
          <img src={partner.photo} alt={partner.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          <div>
            <h1 className="font-outfit font-bold text-base text-gray-900 leading-tight">{partner.name}</h1>
            <p className="font-jakarta text-[10px] text-[#25D366] font-bold tracking-wide uppercase">Match Divino</p>
          </div>
        </div>
        <button className="p-2 -mr-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Aviso de Segurança */}
        <div className="flex items-start gap-2 bg-[#075E54]/5 p-3 rounded-xl border border-[#075E54]/10">
          <ShieldAlert className="w-4 h-4 text-[#075E54] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#075E54]/80 font-jakarta leading-relaxed">
            Por segurança e foco no caráter, o envio de fotos e mídias está desativado nas primeiras 48h do Match.
          </p>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${isMe ? "self-end" : "self-start"}`}>
              {msg.is_icebreaker_answer && (
                <div className="text-[10px] font-bold text-[#075E54] uppercase tracking-wider mb-1 ml-1">
                  Resposta do Quebra-Gelo
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm font-jakarta ${
                isMe 
                  ? "bg-[#DCF8C6] text-gray-900 rounded-tr-sm shadow-sm" 
                  : "bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100"
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 mx-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="bg-white p-4 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-t border-gray-100">
        {!icebreakerAnswered ? (
          <div className="bg-[#075E54] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <LockKeyhole className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <LockKeyhole className="w-4 h-4 text-[#25D366]" />
                <h3 className="font-outfit font-bold text-sm text-[#25D366] uppercase tracking-wide">Desbloqueie o Chat</h3>
              </div>
              <p className="text-white/90 font-jakarta text-sm mb-4 leading-relaxed">
                Para iniciar a conversa, responda a pergunta obrigatória de {partner.name}:
              </p>
              <div className="bg-black/20 p-3 rounded-xl border border-white/10 mb-4">
                <p className="font-outfit font-medium text-white italic">
                  "{partner.icebreaker_question || "Qual passagem bíblica mais marcou seu ano?"}"
                </p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Sua resposta..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#25D366]"
                />
                <button 
                  onClick={() => handleSendMessage(true)}
                  disabled={!inputText.trim()}
                  className="bg-[#25D366] text-[#0a1a14] p-3 rounded-xl hover:bg-[#20bd5a] transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-gray-100 border border-transparent rounded-full px-5 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:bg-white focus:border-[#25D366] transition-all"
            />
            <button 
              onClick={() => handleSendMessage(false)}
              disabled={!inputText.trim()}
              className="bg-[#075E54] text-white p-3 rounded-full hover:bg-[#064e46] transition-colors shadow-md disabled:opacity-50"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
