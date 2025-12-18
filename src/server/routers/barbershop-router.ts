import ky from 'ky'
import z from 'zod'
import { env } from '@/env'
import { protectedProcedure, router } from '../trpc'

export const barbershopRouter = router({
  saveWhatsappCredentials: protectedProcedure
    .input(z.object({ accessToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      // 1. Buscar qual WABA (WhatsApp Business Account) foi compartilhada
      // Documentação: https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts
      const debugTokenUrl = `https://graph.facebook.com/v22.0/debug_token?input_token=${input.accessToken}&access_token=${input.accessToken}`

      // Nota: Em produção, o ideal é usar um App Token para debugar, mas o User Token funciona para pegar os scopes.
      // O jeito mais direto no Embedded Signup é listar as contas que o usuário tem acesso.

      try {
        // A. Pega os negócios (Businesses) e WABAs acessíveis com esse token
        const wabaResponse: any = await ky
          .get(
            `https://graph.facebook.com/v21.0/me?fields=id,name,accounts,granular_scopes&access_token=${input.accessToken}`
          )
          .json()

        // O Embedded Signup geralmente retorna o ID da WABA dentro dos granular_scopes ou precisamos listar.
        // Vamos supor um fluxo onde pegamos a primeira WABA disponível.

        // ATENÇÃO: O fluxo real de Embedded Signup é complexo.
        // O Facebook retorna os IDs via Webhook ou precisamos consultar o endpoint `shared_waba` se configurado.
        // Ppara facilitar, vamos listar os números de telefone da WABA associada.

        // Estratégia Simplificada:
        // O token do usuário permite listar os números de telefone. Vamos tentar descobrir o ID assim.

        // Primeiro, precisamos descobrir o WABA ID. Se o token for de System User (criado pelo Embedded), ele tem acesso direto.
        // Vamos tentar pegar os números direto da conta conectada.

        // Dica: Para MVP, muitas vezes é mais fácil pedir para o usuário digitar o PhoneID se a automação falhar,
        // mas vamos tentar automatizar:

        // Passo A: Trocar token curto por longo (opcional mas recomendado)
        const longLivedToken: any = await ky
          .get(
            `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${input.accessToken}`
          )
          .json()

        const finalToken = longLivedToken.access_token || input.accessToken

        // Passo B: Buscar WABAs
        const meAccounts: any = await ky
          .get(`https://graph.facebook.com/v22.0/me/accounts?access_token=${finalToken}`)
          .json()

        // Isso aqui é meio "tiro no escuro" sem saber a resposta exata do seu setup,
        // mas geralmente o Embedded Signup vincula o número ao token.

        // Se formos salvar AGORA, salvamos apenas o token e pedimos o PhoneID via Webhook (que é o padrão do Facebook).
        // Quando o cadastro termina, o Facebook manda um Webhook para sua URL com os dados da WABA e Phone.

        // MAS, para resolver na hora (Síncrono), vamos salvar o Token no banco e deixar os IDs null.
        // Depois criamos uma função para "Buscar Telefones" usando esse token salvo.

        await ctx.prisma.barbershop.update({
          where: { ownerId: user.id },
          data: {
            whatsappToken: finalToken
            // wabaId e phoneId tentaremos preencher em um segundo passo ou via webhook
          }
        })

        return { success: true }
      } catch (error) {
        console.error('Erro ao vincular WhatsApp:', error)
        throw new Error('Falha ao conectar com o Facebook.')
      }
    }),

  connectWhatsapp: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        wabaId: z.string(),
        phoneId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      try {
        const tokenUrl = `https://graph.facebook.com/v22.0/oauth/access_token`

        const response: { access_token: string } = await ky
          .get(tokenUrl, {
            searchParams: {
              client_id: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
              client_secret: env.FACEBOOK_CLIENT_SECRET,
              code: input.code,
              redirect_uri: '' // Em fluxos de SDK JS, às vezes envia vazio ou a URL atual. Se der erro, tente a URL do seu site.
            }
          })
          .json()

        const accessToken = response.access_token

        if (!accessToken) {
          throw new Error('Não foi possível gerar o token de acesso.')
        }

        // 2. (Opcional) Inscrever nos Webhooks
        // É boa prática inscrever a WABA para receber eventos de mensagem
        try {
          await ky.post(`https://graph.facebook.com/v22.0/${input.wabaId}/subscribed_apps`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            json: {
              messaging_product: 'whatsapp'
            }
          })
        } catch (e) {
          console.log('Aviso: Falha ao inscrever webhook automaticamente.', e)
        }

        // 3. Salvar tudo no banco
        await ctx.prisma.barbershop.update({
          where: { ownerId: user.id },
          data: {
            wabaId: input.wabaId,
            phoneId: input.phoneId,
            whatsappToken: accessToken
          }
        })

        return { success: true }
      } catch (error) {
        console.error('Erro na integração WhatsApp:', error)
        throw new Error('Falha ao conectar com o Facebook. Verifique os logs.')
      }
    })
})
