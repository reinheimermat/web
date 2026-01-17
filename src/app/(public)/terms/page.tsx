import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade – Barberfy</h1>
      <p className="mb-4">
        Bem-vindo à Barberfy! Esta Política de Privacidade explica como coletamos, usamos,
        armazenamos e protegemos suas informações ao utilizar nosso serviço SaaS de atendimento para
        barbearias, incluindo o uso de chatbot.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Informações que coletamos</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <b>Dados de cadastro:</b> Nome, e-mail, telefone, nome da barbearia e outros dados
          fornecidos no momento do cadastro.
        </li>
        <li>
          <b>Dados de uso:</b> Informações sobre o uso do sistema, agendamentos, interações com o
          chatbot e preferências.
        </li>
        <li>
          <b>Dados de comunicação:</b> Mensagens trocadas via chatbot, WhatsApp ou outros canais
          integrados.
        </li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. Uso das informações</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Fornecer e aprimorar nossos serviços de atendimento e agendamento para barbearias.</li>
        <li>
          Personalizar a experiência do usuário e facilitar o contato entre clientes e barbearias.
        </li>
        <li>Enviar comunicações importantes, como confirmações, lembretes e atualizações.</li>
        <li>Garantir a segurança e integridade dos dados.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Compartilhamento de dados</h2>
      <p className="mb-4">
        Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para o
        funcionamento do serviço (por exemplo, integrações com WhatsApp ou Google Calendar) ou
        quando exigido por lei.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Segurança</h2>
      <p className="mb-4">
        Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não
        autorizado, alteração, divulgação ou destruição.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Direitos do usuário</h2>
      <p className="mb-4">
        Você pode solicitar acesso, correção ou exclusão de seus dados pessoais a qualquer momento.
        Para isso, entre em contato conosco pelo e-mail de suporte informado na plataforma.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Alterações nesta política</h2>
      <p className="mb-4">
        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças
        relevantes por meio do próprio aplicativo.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Contato</h2>
      <p>
        Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados,
        entre em contato pelo e-mail:{' '}
        <a href="mailto:suporte@barberfy.com" className="text-blue-600 underline">
          suporte@barberfy.com
        </a>
        .
      </p>
    </main>
  )
}
