import { NextRequest, NextResponse } from "next/server";

// SSO Bridge: FéConecta → FéNamoro
// Redireciona para a tela de login do FéConecta para autenticação cruzada
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get("redirect") || "/feed";

  // Por enquanto redireciona para a tela de login normal do FéNamoro
  // Quando o SSO real for implementado, este endpoint vai:
  // 1. Gerar um ticket único com TTL de 30s
  // 2. Redirecionar para o FéConecta com deep link
  // 3. FéConecta valida e retorna com token assinado
  
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("sso", "feconecta");
  loginUrl.searchParams.set("redirect", redirect);

  return NextResponse.redirect(loginUrl);
}
