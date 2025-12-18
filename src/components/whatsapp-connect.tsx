'use client'

import { useEffect, useState } from 'react'
import { env } from '@/env'
import { trpc } from '@/lib/trpc' // Ajuste seu import

// Tipagem global para o SDK do Facebook
declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

export function WhatsappConnect() {
  const [loading, setLoading] = useState(false)
  const utils = trpc.useUtils()

  // Mutation que vamos criar no passo 4
  const connectMutation = trpc.barbershop.saveWhatsappCredentials.useMutation({
    onSuccess: () => {
      alert('WhatsApp Conectado com Sucesso! 🎉')
      utils.barbershop.getMyShop.invalidate()
    },
    onError: (err) => {
      alert('Erro ao salvar: ' + err.message)
    }
  })

  // 1. Carregar SDK do Facebook ao iniciar
  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v24.0'
      })
    }

    // Script Loader
    ;((d, s, id) => {
      var js: HTMLScriptElement,
        fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) return
      js = d.createElement(s) as HTMLScriptElement
      js.id = id
      js.src = 'https://connect.facebook.net/en_US/sdk.js'
      fjs.parentNode?.insertBefore(js, fjs)
    })(document, 'script', 'facebook-jssdk')
  }, [])

  // 2. Ação do Botão
  const launchWhatsAppSignup = () => {
    setLoading(true)

    // O login dispara o popup
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse

          // O Facebook retorna o code/token.
          // Agora precisamos buscar os dados do telefone que ele escolheu.
          // Para simplificar, enviamos o token para o backend resolver.
          connectMutation.mutate({ accessToken })
        } else {
          console.log('Usuário cancelou o login ou não autorizou.')
          setLoading(false)
        }
      },
      {
        // ⚠️ Substitua pelo ID que você pegou no painel da Meta
        config_id: 'SEU_CONFIGURATION_ID_AQUI',
        response_type: 'code', // ou 'token'
        override_default_response_type: true,
        extras: {
          setup: {
            // Isso pré-seleciona "WhatsApp" no popup
          },
          feature: 'whatsapp_embedded_signup',
          sessionInfoVersion: '2'
        }
      }
    )
  }

  return (
    <button
      type="button"
      onClick={launchWhatsAppSignup}
      disabled={loading || connectMutation.isPending}
      className="rounded bg-[#1877F2] px-4 py-2 font-bold text-white transition hover:bg-[#166fe5]"
    >
      {loading ? 'Conectando...' : 'Conectar WhatsApp Business'}
    </button>
  )
}
