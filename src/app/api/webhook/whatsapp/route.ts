import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Se o modo e o token baterem, retornamos o challenge
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFICADO COM SUCESSO! ✅");
    return new NextResponse(challenge, { status: 200 });
  }

  // Se não bater, rejeitamos (403 Forbidden)
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Log para você ver o formato da mensagem chegando no terminal
    // console.log("Evento Recebido:", JSON.stringify(body, null, 2));

    // Verifica se é um evento do WhatsApp
    if (body.object === "whatsapp_business_account") {
      // Loop para processar as entradas (pode vir mais de uma msg no pacote)
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            const message = change.value.messages[0];

            // Aqui filtramos apenas mensagens de TEXTO por enquanto
            if (message.type === "text") {
              const from = message.from; // Número do cliente (ex: 5511999999999)
              const text = message.text.body; // O que ele escreveu
              const name = change.value.contacts[0]?.profile?.name; // Nome dele

              console.log(`📩 Nova Mensagem de ${name} (${from}): ${text}`);

              // =====================================================
              // AQUI ENTRARÁ A LÓGICA DO SEU BOT (Barberfy)
              // 1. Verificar se esse número já é cliente no Banco
              // 2. Chamar o OpenAI para gerar resposta
              // 3. Responder via API
              // =====================================================
            }
          }
        }
      }

      // IMPORTANTE: Retornar 200 OK imediatamente.
      // Se você demorar ou der erro, o WhatsApp fica reenviando a msg.
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
