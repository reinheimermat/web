"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

// --- CONFIGURAÇÃO ---
const FACEBOOK_APP_ID = "1707142250734460"; // Seu App ID
const EMBEDDED_SIGNUP_CONFIG_ID = "785994377776007"; // Seu Config ID

// Definições de Tipos (essencial para TypeScript e acesso global)
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (callback: (response: any) => void, options: any) => void;
    };
    fbAsyncInit: () => void;
  }
}

export default function EmbeddedSignup() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // 1. FUNÇÃO DE CALLBACK PARA O FB.login (SDK response)
  const fbLoginCallback = useCallback((response: any) => {
    setSdkResponse(response);
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log("Código de Cadastro Incorporado (Code):", code);
      // **AÇÃO:** Envie o 'code' para seu backend para troca.
    }
  }, []);

  // 2. FUNÇÃO PARA INICIAR O FLUXO (CHAMADA PELO BOTÃO)
  const launchWhatsAppSignup = useCallback(() => {
    if (!sdkLoaded || typeof window.FB === "undefined") {
      console.error(
        "Facebook SDK ainda não está disponível. Tente novamente em breve.",
      );
      return;
    }

    // Launch Facebook login (Abre o POPUP do Embedded Signup)
    window.FB.login(fbLoginCallback, {
      config_id: EMBEDDED_SIGNUP_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  }, [sdkLoaded, fbLoginCallback]);

  // 3. OUvinte de MessageEvent (Session Info)
  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          setSessionInfo(data);
          if (data.event === "FINISH") {
            const { phone_number_id, waba_id } = data.data;
            console.log(
              "Sucesso! Phone ID:",
              phone_number_id,
              " | WABA ID:",
              waba_id,
            );
          } else if (data.event === "CANCEL") {
            console.warn("Fluxo cancelado na etapa:", data.data.current_step);
          } else if (data.event === "ERROR") {
            console.error("Erro no Embedded Signup:", data.data.error_message);
          }
        }
      } catch (e) {
        console.log("Non JSON Responses", event.data);
      }
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  // 4. Carregamento e Inicialização do SDK
  const handleSDKLoad = () => {
    // Esta função é chamada assim que o script é baixado.
    // Agora precisamos garantir que o FB.init rode:

    // Define a função fbAsyncInit que será chamada pelo SDK
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v24.0",
      });
      console.log("Facebook SDK Inicializado.");
      setSdkLoaded(true);
    };

    // Se o script for carregado via next/script, ele não executará o código
    // de carregamento assíncrono do seu HTML. Para simular o comportamento
    // do seu código HTML (que define fbAsyncInit e carrega o script),
    // a inicialização é feita diretamente via window.fbAsyncInit.
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Elemento de Estrutura (equivalente ao <div id="fb-root"></div>) */}
      <div id="fb-root"></div>

      {/* Carregamento do SDK (Substitui o script async defer) */}
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={handleSDKLoad} // Chama o handleSDKLoad quando o script é baixado
      />

      <h2>Embedded Signup (WhatsApp Business)</h2>

      {/* Botão para iniciar o fluxo (chama a função launchWhatsAppSignup) */}
      <button
        type="button"
        onClick={launchWhatsAppSignup}
        disabled={!sdkLoaded}
        className="rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
      >
        {sdkLoaded ? "Login with Facebook" : "Loading SDK..."}
      </button>

      {/* --- Visualização das Respostas (Replicando as tags <pre>) --- */}

      <p style={{ marginTop: "20px" }}>Session info response:</p>
      <pre
        style={{
          backgroundColor: "#f4f4f4",
          padding: "10px",
          borderRadius: "4px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {sessionInfo
          ? JSON.stringify(sessionInfo, null, 2)
          : "Aguardando MessageEvent..."}
      </pre>

      <p style={{ marginTop: "20px" }}>SDK response:</p>
      <pre
        style={{
          backgroundColor: "#f4f4f4",
          padding: "10px",
          borderRadius: "4px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {sdkResponse
          ? JSON.stringify(sdkResponse, null, 2)
          : "Aguardando FB.login response..."}
      </pre>
    </div>
  );
}
