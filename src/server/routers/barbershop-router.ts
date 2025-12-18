import ky from 'ky'
import z from 'zod'
import { env } from '@/env'
import { protectedProcedure, router } from '../trpc'

export const barbershopRouter = router({
  // ... outras rotas

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
