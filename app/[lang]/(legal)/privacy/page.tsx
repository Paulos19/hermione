"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const PRIVACY_CONTENT = {
  pt: {
    title: "Política de Privacidade",
    subtitle: "Última atualização: Agosto de 2026",
    back: "Voltar",
    sections: [
      {
        title: "1. Introdução",
        content: `A Hermione ("Empresa", "nós") valoriza a privacidade dos nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de escrita inteligente ("Serviço").`

      },
      {
        title: "2. Dados Coletados",
        content: `Coletamos os seguintes tipos de dados pessoais:

**Dados de Cadastro:**
• Nome completo
• Endereço de e-mail
• Senha (armazenada com hash bcrypt)
• Foto de perfil (opcional)

**Dados de Uso:**
• Conteúdo dos documentos criados
• Histórico de conversas com IA
• Métricas de escrita (palavras escritas, progresso diário)
• Feedbacks e avaliações
• Localização geográfica (cidade/país, opcional e temporária)

**Dados de Pagamento:**
• Informações processadas pela Stripe (não armazenamos dados de cartão)
• Customer ID Stripe
• Histórico de cobranças

**Dados de Segurança:**
• PIN Mestre (para criptografia local)
• Tokens JWT (para autenticação)`
      },
      {
        title: "3. Finalidade do Tratamento",
        content: `Utilizamos seus dados para:

**Execução de Contrato:**
• Fornecer e manter o Serviço
• Processar sua assinatura e pagamentos
• Sincronizar seu conteúdo entre dispositivos
• Fornecer suporte técnico

**Legítimo Interesse:**
• Melhorar nossos serviços e funcionalidades
• Enviar comunicações sobre atualizações importantes
• Prevenir fraude e garantir segurança

**Consentimento:**
• Enviar comunicações de marketing (quando autorizado)
• Coletar dados de localização para métricas
• Utilizar cookies de rastreamento`

      },
      {
        title: "4. Compartilhamento com Terceiros",
        content: `Compartilhamos seus dados apenas conforme necessário:

**Serviços Essenciais:**
• Stripe - Processamento de pagamentos
• Vercel - Hospedagem da aplicação
• UploadThing - Armazenamento de mídia

**Serviços de IA (quando você utiliza):**
• OpenAI/Anthropic - Processamento de texto para IA

**Não compartilhamos:**
• Seus dados pessoais com terceiros para fins de marketing
• Seu conteúdo com outros usuários sem sua autorização
• Informações de pagamento diretamente (processadas pela Stripe)`

      },
      {
        title: "5. Armazenamento e Segurança",
        content: `Suas informações são protegidas por:

**Criptografia:**
• TLS 1.3 para dados em trânsito
• Senhas hasheadas com bcrypt (salt rounds = 12)
• PIN Mestre com criptografia AES-256

**Armazenamento:**
• Banco de dados PostgreSQL com backup regular
• Dados de pagamento processados pela Stripe (PCI DSS)
• Tokens JWT com expiração de 7 dias

**Acesso:**
• Acesso restrito a funcionários autorizados
• Logs de auditoria para acessos sensíveis
• Monitoramento contínuo para atividades suspeitas`

      },
      {
        title: "6. Retenção de Dados",
        content: `Mantemos seus dados pelo seguinte período:

**Conta Ativa:**
• Todos os dados enquanto sua conta estiver ativa

**Após Exclusão da Conta:**
• Dados de conta: excluídos imediatamente
• Conteúdo: excluído após 30 dias (para recuperação)
• Dados de pagamento: mantidos por 5 anos (obrigação legal)
• Logs de segurança: mantidos por 1 ano

**Dados Anonimizados:**
• Métricas de uso podem ser anonimizadas e mantidas indefinidamente para melhorias do serviço`

      },
      {
        title: "7. Seus Direitos (LGPD/GDPR)",
        content: `Você tem os seguintes direitos sobre seus dados:

**Acesso:** Solicitar cópia de todos os seus dados pessoais
**Correção:** Solicitar correção de dados incorretos
**Exclusão:** Solicitar exclusão de seus dados pessoais
**Portabilidade:** Solicitar exportação de seus dados em formato legível
**Oposição:** Oponhar-se ao tratamento de seus dados
**Revogação:** Revogar consentimentos dados anteriormente

Para exercer seus direitos, entre em contato através do suporte ou acesse as configurações da sua conta.`

      },
      {
        title: "8. Cookies e Rastreamento",
        content: `Utilizamos os seguintes cookies:

**Essenciais (Obrigatórios):**
• next-auth.session-token - Sessão autenticada (7 dias)
• next-auth.csrf-token - Proteção CSRF (sessão)

**Preferências (Opcionais):**
• hermione-theme - Preferência de tema (1 ano)

**Não utilizamos:**
• Cookies de rastreamento de terceiros
• Cookies de publicidade
• Pixels de rastreamento`

      },
      {
        title: "9. Menores de Idade",
        content: `O Serviço não é destinado a menores de 16 anos (ou 13 anos no caso do COPPA). Não coletamos intencionalmente dados de menores de idade. Se descobrirmos que coletamos dados de um menor, excluiremos imediatamente essas informações.`

      },
      {
        title: "10. Transferência Internacional",
        content: `Alguns de nossos serviços terceiros podem armazenar dados fora do Brasil. Quando isso ocorre, garantimos que:
• O país de destino possui lei de proteção de dados adequada
• São implementadas garantias contratuais adequadas
• Você é informado sobre a transferência quando aplicável`

      },
      {
        title: "11. Alterações nesta Política",
        content: `Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão comunicadas por:
• E-mail para o endereço cadastrado
• Notificação na plataforma
• Publicação nesta página com data de atualização

Recomendamos que você revise esta política regularmente.`

      },
      {
        title: "12. Contato",
        content: `Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados, entre em contato:

**E-mail:** paulohenrique.012araujo@gmail.com
**Controlador:** Hermione Ltda.
**Encarregado de Dados (DPO):** paulohenrique.012araujo@gmail.com

Para exercício de direitos LGPD, você também pode contatar a ANPD (Autoridade Nacional de Proteção de Dados).`
      }
    ]
  },
  en: {
    title: "Privacy Policy",
    subtitle: "Last updated: August 2026",
    back: "Back",
    sections: [
      {
        title: "1. Introduction",
        content: `Hermione ("Company", "we") values the privacy of our users. This Privacy Policy describes how we collect, use, store, and protect your personal information when you use our intelligent writing platform ("Service").`

      },
      {
        title: "2. Data Collected",
        content: `We collect the following types of personal data:

**Registration Data:**
• Full name
• Email address
• Password (stored with bcrypt hash)
• Profile picture (optional)

**Usage Data:**
• Content of documents created
• AI conversation history
• Writing metrics (words written, daily progress)
• Feedbacks and ratings
• Geographic location (city/country, optional and temporary)

**Payment Data:**
• Information processed by Stripe (we do not store card data)
• Stripe Customer ID
• Billing history

**Security Data:**
• Master PIN (for local encryption)
• JWT tokens (for authentication)`
      },
      {
        title: "3. Purpose of Processing",
        content: `We use your data for:

**Contract Performance:**
• Providing and maintaining the Service
• Processing your subscription and payments
• Syncing your content across devices
• Providing technical support

**Legitimate Interest:**
• Improving our services and features
• Sending communications about important updates
• Preventing fraud and ensuring security

**Consent:**
• Sending marketing communications (when authorized)
• Collecting location data for metrics
• Using tracking cookies`

      },
      {
        title: "4. Sharing with Third Parties",
        content: `We share your data only as necessary:

**Essential Services:**
• Stripe - Payment processing
• Vercel - Application hosting
• UploadThing - Media storage

**AI Services (when you use them):**
• OpenAI/Anthropic - Text processing for AI

**We do not share:**
• Your personal data with third parties for marketing purposes
• Your content with other users without your authorization
• Payment information directly (processed by Stripe)`

      },
      {
        title: "5. Storage and Security",
        content: `Your information is protected by:

**Encryption:**
• TLS 1.3 for data in transit
• Passwords hashed with bcrypt (salt rounds = 12)
• Master PIN with AES-256 encryption

**Storage:**
• PostgreSQL database with regular backups
• Payment data processed by Stripe (PCI DSS)
• JWT tokens with 7-day expiration

**Access:**
• Restricted access to authorized personnel
• Audit logs for sensitive access
• Continuous monitoring for suspicious activities`

      },
      {
        title: "6. Data Retention",
        content: `We keep your data for the following period:

**Active Account:**
• All data while your account is active

**After Account Deletion:**
• Account data: deleted immediately
• Content: deleted after 30 days (for recovery)
• Payment data: kept for 5 years (legal obligation)
• Security logs: kept for 1 year

**Anonymized Data:**
• Usage metrics may be anonymized and kept indefinitely for service improvements`

      },
      {
        title: "7. Your Rights (LGPD/GDPR)",
        content: `You have the following rights over your data:

**Access:** Request a copy of all your personal data
**Correction:** Request correction of incorrect data
**Deletion:** Request deletion of your personal data
**Portability:** Request export of your data in readable format
**Objection:** Object to the processing of your data
**Revocation:** Revoke previously given consents

To exercise your rights, contact us through support or access your account settings.`

      },
      {
        title: "8. Cookies and Tracking",
        content: `We use the following cookies:

**Essential (Required):**
• next-auth.session-token - Authenticated session (7 days)
• next-auth.csrf-token - CSRF protection (session)

**Preferences (Optional):**
• hermione-theme - Theme preference (1 year)

**We do not use:**
• Third-party tracking cookies
• Advertising cookies
• Tracking pixels`

      },
      {
        title: "9. Children's Privacy",
        content: `The Service is not intended for minors under 16 years of age (or 13 years under COPPA). We do not intentionally collect data from minors. If we discover that we have collected data from a minor, we will immediately delete that information.`

      },
      {
        title: "10. International Transfer",
        content: `Some of our third-party services may store data outside Brazil. When this occurs, we ensure that:
• The destination country has adequate data protection law
• Adequate contractual guarantees are implemented
• You are informed about the transfer when applicable`

      },
      {
        title: "11. Changes to This Policy",
        content: `We may update this Privacy Policy periodically. Significant changes will be communicated by:
• Email to your registered address
• Notification on the platform
• Publication on this page with update date

We recommend that you review this policy regularly.`

      },
      {
        title: "12. Contact",
        content: `If you have questions about this Privacy Policy or about the treatment of your data, please contact:

**Email:** paulohenrique.012araujo@gmail.com
**Controller:** Hermione Ltda.
**Data Protection Officer (DPO):** paulohenrique.012araujo@gmail.com

For LGPD rights requests, you may also contact the ANPD (National Data Protection Authority).`
      }
    ]
  },
  es: {
    title: "Política de Privacidad",
    subtitle: "Última actualización: Agosto de 2026",
    back: "Volver",
    sections: [
      {
        title: "1. Introducción",
        content: `Hermione ("Empresa", "nosotros") valora la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando utiliza nuestra plataforma de escritura inteligente ("Servicio").`

      },
      {
        title: "2. Datos Recopilados",
        content: `Recopilamos los siguientes tipos de datos personales:

**Datos de Registro:**
• Nombre completo
• Dirección de correo electrónico
• Contraseña (almacenada con hash bcrypt)
• Foto de perfil (opcional)

**Datos de Uso:**
• Contenido de documentos creados
• Historial de conversaciones con IA
• Métricas de escritura (palabras escritas, progreso diario)
• Comentarios y evaluaciones
• Ubicación geográfica (ciudad/país, opcional y temporal)

**Datos de Pago:**
• Información procesada por Stripe (no almacenamos datos de tarjeta)
• Customer ID de Stripe
• Historial de facturación

**Datos de Seguridad:**
• PIN Maestro (para cifrado local)
• Tokens JWT (para autenticación)`
      },
      {
        title: "3. Finalidad del Tratamiento",
        content: `Usamos sus datos para:

**Ejecución de Contrato:**
• Proporcionar y mantener el Servicio
• Procesar su suscripción y pagos
• Sincronizar su contenido entre dispositivos
• Proporcionar soporte técnico

**Interés Legítimo:**
• Mejorar nuestros servicios y funcionalidades
• Enviar comunicaciones sobre actualizaciones importantes
• Prevenir fraude y garantizar seguridad

**Consentimiento:**
• Enviar comunicaciones de marketing (cuando autorizado)
• Recopilar datos de ubicación para métricas
• Usar cookies de rastreo`

      },
      {
        title: "4. Compartición con Terceros",
        content: `Compartimos sus datos solo según sea necesario:

**Servicios Esenciales:**
• Stripe - Procesamiento de pagos
• Vercel - Alojamiento de la aplicación
• UploadThing - Almacenamiento de medios

**Servicios de IA (cuando los usa):**
• OpenAI/Anthropic - Procesamiento de texto para IA

**No compartimos:**
• Sus datos personales con terceros para fines de marketing
• Su contenido con otros usuarios sin su autorización
• Información de pago directamente (procesada por Stripe)`

      },
      {
        title: "5. Almacenamiento y Seguridad",
        content: `Su información está protegida por:

**Cifrado:**
• TLS 1.3 para datos en tránsito
• Contraseñas hasheadas con bcrypt (salt rounds = 12)
• PIN Maestro con cifrado AES-256

**Almacenamiento:**
• Base de datos PostgreSQL con copias de seguridad regulares
• Datos de pago procesados por Stripe (PCI DSS)
• Tokens JWT con expiración de 7 días

**Acceso:**
• Acceso restringido a personal autorizado
• Registros de auditoría para accesos sensibles
• Monitoreo continuo para actividades sospechosas`

      },
      {
        title: "6. Retención de Datos",
        content: `Mantenemos sus datos por el siguiente período:

**Cuenta Activa:**
• Todos los datos mientras su cuenta esté activa

**Después de Eliminación de Cuenta:**
• Datos de cuenta: eliminados inmediatamente
• Contenido: eliminado después de 30 días (para recuperación)
• Datos de pago: mantenidos por 5 años (obligación legal)
• Registros de seguridad: mantenidos por 1 año

**Datos Anonimizados:**
• Las métricas de uso pueden ser anonimizadas y mantenidas indefinidamente para mejoras del servicio`

      },
      {
        title: "7. Sus Derechos (LGPD/GDPR)",
        content: `Usted tiene los siguientes derechos sobre sus datos:

**Acceso:** Solicitar una copia de todos sus datos personales
**Corrección:** Solicitar corrección de datos incorrectos
**Eliminación:** Solicitar eliminación de sus datos personales
**Portabilidad:** Solicitar exportación de sus datos en formato legible
**Oposición:** Oponerse al tratamiento de sus datos
**Revocación:** Revocar consentimientos dados anteriormente

Para ejercer sus derechos, contáctenos a través del soporte o acceda a la configuración de su cuenta.`

      },
      {
        title: "8. Cookies y Rastreo",
        content: `Usamos las siguientes cookies:

**Esenciales (Obligatorias):**
• next-auth.session-token - Sesión autenticada (7 días)
• next-auth.csrf-token - Protección CSRF (sesión)

**Preferencias (Opcionales):**
• hermione-theme - Preferencia de tema (1 año)

**No usamos:**
• Cookies de rastreo de terceros
• Cookies de publicidad
• Píxeles de rastreo`

      },
      {
        title: "9. Privacidad de Menores",
        content: `El Servicio no está destinado a menores de 16 años (o 13 años bajo COPPA). No recopilamos intencionalmente datos de menores. Si descubrimos que hemos recopilado datos de un menor, eliminaremos inmediatamente esa información.`

      },
      {
        title: "10. Transferencia Internacional",
        content: `Algunos de nuestros servicios de terceros pueden almacenar datos fuera de Brasil. Cuando esto ocurre, nos aseguramos de que:
• El país de destino tenga ley de protección de datos adecuada
• Se implementen garantías contractuales adecuadas
• Se le informe sobre la transferencia cuando sea aplicable`

      },
      {
        title: "11. Cambios en esta Política",
        content: `Podemos actualizar esta Política de Privacidad periódicamente. Los cambios significativos se comunicarán por:
• Correo electrónico a su dirección registrada
• Notificación en la plataforma
• Publicación en esta página con fecha de actualización

Recomendamos que revise esta política regularmente.`

      },
      {
        title: "12. Contacto",
        content: `Si tiene preguntas sobre esta Política de Privacidad o sobre el tratamiento de sus datos, contáctenos:

**Correo electrónico:** paulohenrique.012araujo@gmail.com
**Controlador:** Hermione Ltda.
**Oficial de Protección de Datos (DPO):** paulohenrique.012araujo@gmail.com

Para ejercer derechos LGPD, también puede contactar a la ANPD (Autoridad Nacional de Protección de Datos).`
      }
    ]
  }
};

export default function PrivacyPage() {
  const params = useParams();
  const currentLang = (params?.lang as string) || "pt";
  const content = PRIVACY_CONTENT[currentLang as keyof typeof PRIVACY_CONTENT] || PRIVACY_CONTENT.pt;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href={`/${currentLang}`}
            className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-white/40 hover:text-white transition-colors uppercase mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {content.back}
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] sm:text-[48px] md:text-[56px] font-bold text-white/90 tracking-tight mb-4"
          >
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[13px] text-white/30"
          >
            {content.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {content.sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <h2 className="text-[18px] md:text-[20px] font-bold text-white/90 mb-4">
                {section.title}
              </h2>
              <div className="text-[14px] text-white/50 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-white/[0.04]">
          <p className="text-[12px] text-white/30 text-center">
            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através do suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
