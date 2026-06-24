"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SSOCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");
      const source = searchParams.get("source");

      if (!token || !email) {
        setError("Parâmetros de autenticação inválidos.");
        return;
      }

      try {
        // Estabelece a sessão validando o token (OTP) do tipo magiclink gerado pelo backend
        const { data, error: authError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "magiclink",
        });

        if (authError || !data.user) {
          throw authError || new Error("Falha ao estabelecer sessão");
        }

        // Store source in localStorage if user came from feconecta
        if (source === "feconecta") {
          localStorage.setItem("fenamoro_source", "feconecta");
        }

        toast.success("Login via FéConecta bem-sucedido! 🕊️");
        router.push("/feed");

      } catch (err: any) {
        console.error("SSO Error:", err);
        setError("Sua sessão expirou ou o token é inválido.");
      }
    };

    authenticate();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[#0a1f1c] text-white text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="font-bold text-xl mb-2">Erro no Login</h1>
        <p className="text-white/60 text-sm mb-6">{error}</p>
        <button onClick={() => router.push("/login")} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold">
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#0a1f1c] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: "rgba(37,211,102,0.15)" }} />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center animate-pulse"
          style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        <h2 className="text-white font-outfit font-bold text-2xl mb-2">Conectando...</h2>
        <p className="text-white/60 text-sm font-jakarta flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Estabelecendo sessão segura
        </p>
      </div>
    </div>
  );
}
