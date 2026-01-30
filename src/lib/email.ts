import type { ProfessionalType } from "@/lib/types"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_KEY,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(options: SendEmailOptions) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || "GestMais <noreply@gestmais.pt>",
    ...options,
  })
}

// Email templates
export function getVerificationEmailTemplate(url: string) {
  return {
    text: `Clique no link para verificar o seu email: ${url}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Verifique o seu email
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Clique no botão abaixo para verificar o seu endereço de email e completar o registo na GestMais.
                      </p>
                      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Verificar Email
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Este link expira em 1 hora. Se não solicitou esta verificação, pode ignorar este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getPasswordResetEmailTemplate(url: string) {
  return {
    text: `Clique no link para redefinir a sua palavra-passe: ${url}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Redefinir palavra-passe
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Recebemos um pedido para redefinir a sua palavra-passe. Clique no botão abaixo para criar uma nova palavra-passe.
                      </p>
                      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Redefinir Palavra-passe
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Este link expira em 1 hora. Se não solicitou esta alteração, pode ignorar este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

// ============================================
// NOTIFICATION EMAIL TEMPLATES
// ============================================

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export function getPaymentOverdueEmailTemplate(
  residentName: string,
  amount: number,
  overdueMonths: number,
  link: string
) {
  const safeName = escapeHtml(residentName)
  const formattedAmount = formatCents(amount)
  const monthText = overdueMonths === 1 ? 'mês' : 'meses'

  return {
    text: `Olá ${residentName}, tem pagamentos em atraso no valor de ${formattedAmount}€, referentes a ${overdueMonths} ${monthText} de quota de condomínio. Por favor regularize a sua situação. Ver pagamentos: ${link}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Pagamento em Atraso
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Olá ${safeName},
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Tem pagamentos em atraso no valor de <strong>${formattedAmount}€</strong>, referentes a <strong>${overdueMonths} ${monthText}</strong> de quota de condomínio.
                      </p>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Por favor regularize a sua situação para evitar encargos adicionais.
                      </p>
                      <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Ver Pagamentos Pendentes
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Se já efetuou o pagamento, por favor ignore este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getUrgentOccurrenceEmailTemplate(
  buildingName: string,
  title: string,
  description: string | null,
  creatorName: string,
  link: string
) {
  const safeBuildingName = escapeHtml(buildingName)
  const safeTitle = escapeHtml(title)
  const safeDescription = description ? escapeHtml(description) : null
  const safeCreatorName = escapeHtml(creatorName)

  const descriptionHtml = safeDescription
    ? `<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;"><strong>Descrição:</strong> ${safeDescription}</p>`
    : ''

  return {
    text: `⚠️ Ocorrência Urgente - ${buildingName}\n\nFoi reportada uma ocorrência urgente.\n\nTítulo: ${title}\n${description ? `Descrição: ${description}\n` : ''}Reportado por: ${creatorName}\n\nVer ocorrência: ${link}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #D4848C;">
                        ⚠️ Ocorrência Urgente
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Foi reportada uma ocorrência urgente no edifício <strong>${safeBuildingName}</strong>.
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        <strong>Título:</strong> ${safeTitle}
                      </p>
                      ${descriptionHtml}
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        <strong>Reportado por:</strong> ${safeCreatorName}
                      </p>
                      <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Ver Ocorrência
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getCalendarEventEmailTemplate(
  buildingName: string,
  title: string,
  date: string,
  time: string | null,
  description: string | null,
  link: string
) {
  const safeBuildingName = escapeHtml(buildingName)
  const safeTitle = escapeHtml(title)
  const safeDescription = description ? escapeHtml(description) : null

  const descriptionHtml = safeDescription
    ? `<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">${safeDescription}</p>`
    : ''

  const timeHtml = time
    ? `<p style="margin: 0 0 8px; font-size: 14px; line-height: 1.5; color: #495057;">🕐 <strong>Hora:</strong> ${time}</p>`
    : ''

  return {
    text: `📅 ${title} - ${buildingName}\n\nData: ${date}${time ? `\nHora: ${time}` : ''}${description ? `\n\n${description}` : ''}\n\nVer calendário: ${link}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #212529;">
                        📅 Novo Evento
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 12px; color: #8E9AAF;">
                        ${safeBuildingName}
                      </p>
                      <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #343A40;">
                        ${safeTitle}
                      </h2>
                      <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.5; color: #495057;">
                        📆 <strong>Data:</strong> ${date}
                      </p>
                      ${timeHtml}
                      ${descriptionHtml}
                      <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Ver Calendário
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getPollCreatedEmailTemplate(
  buildingName: string,
  title: string,
  description: string | null,
  link: string
) {
  const safeBuildingName = escapeHtml(buildingName)
  const safeTitle = escapeHtml(title)
  const safeDescription = description ? escapeHtml(description) : null

  const descriptionHtml = safeDescription
    ? `<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">${safeDescription}</p>`
    : ''

  return {
    text: `🗳️ Nova Votação - ${buildingName}\n\n${title}${description ? `\n\n${description}` : ''}\n\nA sua participação é importante para as decisões do condomínio.\n\nVotar: ${link}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #212529;">
                        🗳️ Nova Votação Disponível
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 12px; color: #8E9AAF;">
                        ${safeBuildingName}
                      </p>
                      <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #343A40;">
                        ${safeTitle}
                      </h2>
                      ${descriptionHtml}
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        A sua participação é importante para as decisões do condomínio.
                      </p>
                      <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Votar Agora
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getExtraordinaryPaymentOverdueEmailTemplate(
  residentName: string,
  projectName: string,
  amount: number,
  overdueInstallments: number,
  link: string
) {
  const safeName = escapeHtml(residentName)
  const safeProjectName = escapeHtml(projectName)
  const formattedAmount = formatCents(amount)
  const installmentText = overdueInstallments === 1 ? 'prestação' : 'prestações'

  return {
    text: `Olá ${residentName}, tem pagamentos extraordinários em atraso no valor de ${formattedAmount}€, referentes a ${overdueInstallments} ${installmentText} do projeto "${projectName}". Por favor regularize a sua situação. Ver pagamentos: ${link}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Pagamento Extraordinário em Atraso
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Olá ${safeName},
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Tem pagamentos extraordinários em atraso no valor de <strong>${formattedAmount}€</strong>, referentes a <strong>${overdueInstallments} ${installmentText}</strong> do projeto:
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #343A40; font-weight: 600;">
                        "${safeProjectName}"
                      </p>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Por favor regularize a sua situação para evitar encargos adicionais.
                      </p>
                      <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Ver Pagamentos Pendentes
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Se já efetuou o pagamento, por favor ignore este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getSubscriptionPaymentFailedEmailTemplate(
  managerName: string,
  buildingName: string,
  updatePaymentLink: string
) {
  const safeName = escapeHtml(managerName)
  const safeBuildingName = escapeHtml(buildingName)

  return {
    text: `Olá ${managerName}, o pagamento da subscrição do edifício "${buildingName}" falhou. Tem 3 dias para atualizar o método de pagamento antes da suspensão do serviço. Atualizar método de pagamento: ${updatePaymentLink}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #D4848C;">
                        Pagamento da Subscrição Falhou
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Olá ${safeName},
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        O pagamento da subscrição do edifício <strong>${safeBuildingName}</strong> não foi processado com sucesso.
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #E5C07B; font-weight: 600;">
                        Tem 3 dias para atualizar o método de pagamento antes da suspensão do serviço.
                      </p>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Por favor atualize o seu método de pagamento para continuar a utilizar o GestMais sem interrupções.
                      </p>
                      <a href="${updatePaymentLink}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Atualizar Método de Pagamento
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Se precisar de ajuda, contacte o suporte em suporte@gestmais.pt
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getResidentInvitationEmailTemplate(
  recipientEmail: string,
  buildingName: string,
  inviterName: string,
  invitationLink: string
) {
  const safeBuildingName = escapeHtml(buildingName)
  const safeInviterName = escapeHtml(inviterName)

  return {
    text: `Foi convidado por ${inviterName} para se juntar ao edifício "${buildingName}" na plataforma GestMais. Clique no link para aceitar o convite e criar a sua conta: ${invitationLink}. Este convite expira em 7 dias. Se já tens conta na aplicação, ignora este email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Convite para Residente
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        <strong>${safeInviterName}</strong> convidou-o para se juntar ao edifício:
                      </p>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #343A40; font-weight: 600;">
                        "${safeBuildingName}"
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        A <strong>GestMais</strong> é uma plataforma de gestão de condomínios. Como residente, poderá consultar quotas, documentos, votações e muito mais.
                      </p>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Clique no botão abaixo para aceitar o convite e criar a sua conta.
                      </p>
                      <a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Aceitar Convite
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Este convite expira em 7 dias. Se já tens conta na aplicação, ignora este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

const PROFESSIONAL_TYPE_LABELS: Record<ProfessionalType, string> = {
  accountant: "Contabilista",
  lawyer: "Advogado",
  consultant: "Consultor",
}

export function getProfessionalInvitationEmailTemplate(
  recipientEmail: string,
  buildingName: string,
  inviterName: string,
  professionalType: ProfessionalType,
  invitationLink: string
) {
  const safeBuildingName = escapeHtml(buildingName)
  const safeInviterName = escapeHtml(inviterName)
  const typeLabel = PROFESSIONAL_TYPE_LABELS[professionalType]

  return {
    text: `Foi convidado por ${inviterName} para colaborar como ${typeLabel} na gestão do edifício "${buildingName}" na plataforma GestMais. A GestMais é uma plataforma de gestão de condomínios que permite aos gestores e profissionais externos colaborar na administração de edifícios. Clique no link para aceitar o convite: ${invitationLink}. Este convite expira em 7 dias.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Convite para Profissional Externo
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        <strong>${safeInviterName}</strong> convidou-o para colaborar como <strong>${typeLabel}</strong> na gestão do edifício:
                      </p>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #343A40; font-weight: 600;">
                        "${safeBuildingName}"
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        A <strong>GestMais</strong> é uma plataforma de gestão de condomínios. Como profissional externo, terá acesso de consulta a quotas, documentos e relatórios do edifício.
                      </p>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Clique no botão abaixo para aceitar o convite e criar a sua conta.
                      </p>
                      <a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Aceitar Convite
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Este convite expira em 7 dias. Se não pretende aceitar, pode simplesmente ignorar este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}

export function getCollaboratorInvitationEmailTemplate(
  recipientName: string,
  buildingName: string,
  inviterName: string,
  invitationLink: string
) {
  const safeName = escapeHtml(recipientName)
  const safeBuildingName = escapeHtml(buildingName)
  const safeInviterName = escapeHtml(inviterName)

  return {
    text: `Olá ${recipientName}, foi convidado por ${inviterName} para colaborar na gestão do edifício "${buildingName}". Como colaborador, poderá ajudar na gestão de quotas, eventos, votações e muito mais. Aceitar convite: ${invitationLink}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F8F8F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; border: 1px solid #E9ECEF;">
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #212529;">
                        Convite para Colaborador
                      </h1>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Olá ${safeName},
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #495057;">
                        <strong>${safeInviterName}</strong> convidou-o para colaborar na gestão do edifício:
                      </p>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #343A40; font-weight: 600;">
                        "${safeBuildingName}"
                      </p>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #495057;">
                        Como colaborador, poderá ajudar na gestão de quotas, eventos, votações, ocorrências e muito mais.
                      </p>
                      <a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background-color: #8FB996; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                        Ver Convite
                      </a>
                      <p style="margin: 24px 0 0; font-size: 12px; color: #8E9AAF;">
                        Este convite expira em 7 dias. Se não pretende aceitar, pode simplesmente ignorar este email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }
}
