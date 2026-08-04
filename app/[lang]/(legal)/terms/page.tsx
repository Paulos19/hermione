"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TERMS_CONTENT = {
  pt: {
    title: "Termos de Uso",
    subtitle: "Última atualização: Agosto de 2026",
    back: "Voltar",
    sections: [
      {
        title: "1. Aceitação dos Termos",
        content: `Ao acessar ou utilizar a plataforma Hermione ("Serviço"), você concorda com estes Termos de Uso. Se não concordar com algum dos termos, não utilize o Serviço. Estes termos constituem um acordo legal entre você ("Usuário") e Hermione ("Empresa").`
      },
      {
        title: "2. Descrição do Serviço",
        content: `A Hermione é um Estúdio de Escrita Inteligente que oferece:
• Editor de texto rico com colaboração em tempo real
• Assistente de Inteligência Artificial integrada
• Sincronização entre dispositivos (web, mobile, tablet)
• Exportação de documentos (PDF, DOCX, EPUB)
• Sistema de worldbuilding para escritores
• Chat com IA para brainstorming e revisão`
      },
      {
        title: "3. Conta de Usuário",
        content: `Para utilizar certainas funcionalidades, você precisa criar uma conta. Você é responsável por:
• Manter a confidencialidade de suas credenciais
• Todas as atividades que ocorram em sua conta
• Notificar-nos imediatamente sobre uso não autorizado
• Fornecer informações verdadeiras e precisas no cadastro

Você deve ter pelo menos 16 anos de idade para criar uma conta.`
      },
      {
        title: "4. Conteúdo do Usuário",
        content: `Você mantém todos os direitos sobre o conteúdo que cria na Hermione (textos, documentos, personagens, notas). Ao utilizar o Serviço:
• Você nos concede uma licença limitada para armazenar e processar seu conteúdo
• Você pode exportar seu conteúdo a qualquer momento
• Nós não reivindicamos propriedade sobre seus trabalhos
• Você é responsável pelo conteúdo que cria e compartilha`
      },
      {
        title: "5. Uso Aceitável",
        content: `Ao utilizar a Hermione, você concorda em NÃO:
• Criar ou armazenar conteúdo ilegal, difamatório ou que infrinja direitos autorais
• Tentar acessar contas de outros usuários não autorizadamente
• Utilizar bots ou scripts para automação não autorizada
• Sobrecarregar o Serviço com requisições excessivas
• Compartilhar credenciais de acesso
• Utilizar o Serviço para fins comerciais não autorizados`
      },
      {
        title: "6. Propriedade Intelectual",
        content: `O Serviço, incluindo seu design, código, funcionalidades e conteúdo (exceto o conteúdo do Usuário), é de propriedade da Hermione e protegido por leis de propriedade intelectual. Você não pode:
• Copiar, modificar ou distribuir partes do Serviço
• Fazer engenharia reversa de qualquer parte do Serviço
• Remover avisos de propriedade intelectual
• Usar marcas registradas da Hermione sem autorização`
      },
      {
        title: "7. Assinaturas e Pagamentos",
        content: `A Hermione oferece planos gratuitos e pagos:
• O plano gratuito oferece funcionalidades limitadas
• Planos pagos (Pro e Premium) oferecem funcionalidades expandidas
• Assinaturas são cobradas mensalmente ou anualmente
• O cancelamento pode ser feito a qualquer momento nas configurações
• Reembolsos são avaliados caso a caso dentro de 7 dias
• Preços podem ser alterados com aviso prévio de 30 dias`
      },
      {
        title: "8. Isenção de Responsabilidade",
        content: `O Serviço é fornecido "como está" e "conforme disponível". Não garantimos:
• Que o Serviço será ininterrupto ou livre de erros
• A precisão das sugestões geradas por IA
• A adequação do Serviço para fins específicos
• A segurança absoluta de dados (embora tomemos medidas razoáveis)

Não seremos responsáveis por danos indiretos, incidentais ou consequenciais.`
      },
      {
        title: "9. Limitação de Responsabilidade",
        content: `Em nenhuma circunstância a Hermione será responsável por:
• Perda de dados causada por falhas do Usuário
• Danos decorrentes do uso ou impossibilidade de uso do Serviço
• Conteúdo gerado por IA que possa estar incorreto
• Interrupções temporárias do Serviço para manutenção

Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.`
      },
      {
        title: "10. Rescisão",
        content: `Podemos suspender ou encerrar sua conta se:
• Você violar estes Termos de Uso
• Sua conta estiver inativa por mais de 24 meses
• Recebermos ordem judicial para tal

Ao rescindir:
• Seus dados serão mantidos por 30 dias para possível recuperação
• Após 30 dias, seus dados serão permanentemente excluídos
• Você pode solicitar exclusão antecipada através do suporte`
      },
      {
        title: "11. Modificações dos Termos",
        content: `Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por:
• E-mail para o endereço cadastrado
• Notificação na plataforma
• Publicação nesta página com data de atualização

O uso continuado após alterações constitui aceitação dos novos termos.`
      },
      {
        title: "12. Lei Aplicável e Foro",
        content: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer questões oriundas destes Termos, com renúncia a qualquer outro por mais privilegiado que seja.`
      }
    ]
  },
  en: {
    title: "Terms of Service",
    subtitle: "Last updated: August 2026",
    back: "Back",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: `By accessing or using the Hermione platform ("Service"), you agree to these Terms of Service. If you do not agree with any of the terms, do not use the Service. These terms constitute a legal agreement between you ("User") and Hermione ("Company").`
      },
      {
        title: "2. Description of Service",
        content: `Hermione is an Intelligent Writing Studio that offers:
• Rich text editor with real-time collaboration
• Integrated Artificial Intelligence assistant
• Cross-device synchronization (web, mobile, tablet)
• Document export (PDF, DOCX, EPUB)
• Worldbuilding system for writers
• AI chat for brainstorming and review`
      },
      {
        title: "3. User Account",
        content: `To use certain features, you need to create an account. You are responsible for:
• Maintaining the confidentiality of your credentials
• All activities that occur under your account
• Notifying us immediately of unauthorized use
• Providing true and accurate information during registration

You must be at least 16 years of age to create an account.`
      },
      {
        title: "4. User Content",
        content: `You retain all rights to content you create on Hermione (texts, documents, characters, notes). By using the Service:
• You grant us a limited license to store and process your content
• You can export your content at any time
• We do not claim ownership of your works
• You are responsible for the content you create and share`
      },
      {
        title: "5. Acceptable Use",
        content: `By using Hermione, you agree NOT to:
• Create or store illegal, defamatory, or copyright-infringing content
• Attempt to access other users' accounts without authorization
• Use bots or scripts for unauthorized automation
• Overload the Service with excessive requests
• Share access credentials
• Use the Service for unauthorized commercial purposes`
      },
      {
        title: "6. Intellectual Property",
        content: `The Service, including its design, code, features, and content (except User content), is owned by Hermione and protected by intellectual property laws. You may not:
• Copy, modify, or distribute parts of the Service
• Reverse engineer any part of the Service
• Remove intellectual property notices
• Use Hermione trademarks without authorization`
      },
      {
        title: "7. Subscriptions and Payments",
        content: `Hermione offers free and paid plans:
• The free plan offers limited features
• Paid plans (Pro and Premium) offer expanded features
• Subscriptions are billed monthly or annually
• Cancellation can be done anytime in settings
• Refunds are evaluated case by case within 7 days
• Prices may be changed with 30 days prior notice`
      },
      {
        title: "8. Disclaimer",
        content: `The Service is provided "as is" and "as available". We do not guarantee:
• That the Service will be uninterrupted or error-free
• The accuracy of AI-generated suggestions
• The suitability of the Service for specific purposes
• Absolute data security (though we take reasonable measures)

We shall not be liable for indirect, incidental, or consequential damages.`
      },
      {
        title: "9. Limitation of Liability",
        content: `In no event shall Hermione be liable for:
• Data loss caused by User failure
• Damages resulting from use or inability to use the Service
• AI-generated content that may be incorrect
• Temporary Service interruptions for maintenance

Our total liability shall not exceed the amount paid by you in the last 12 months.`
      },
      {
        title: "10. Termination",
        content: `We may suspend or terminate your account if:
• You violate these Terms of Service
• Your account has been inactive for more than 24 months
• We receive a court order to do so

Upon termination:
• Your data will be retained for 30 days for possible recovery
• After 30 days, your data will be permanently deleted
• You may request early deletion through support`
      },
      {
        title: "11. Changes to Terms",
        content: `We reserve the right to modify these Terms at any time. Significant changes will be communicated by:
• Email to your registered address
• Notification on the platform
• Publication on this page with update date

Continued use after changes constitutes acceptance of the new terms.`
      },
      {
        title: "12. Governing Law and Jurisdiction",
        content: `These Terms are governed by the laws of the Federative Republic of Brazil. The jurisdiction of São Paulo/SP is elected to resolve any questions arising from these Terms, with waiver of any other more privileged jurisdiction.`
      }
    ]
  },
  es: {
    title: "Términos de Servicio",
    subtitle: "Última actualización: Agosto de 2026",
    back: "Volver",
    sections: [
      {
        title: "1. Aceptación de los Términos",
        content: `Al acceder o utilizar la plataforma Hermione ("Servicio"), usted acepta estos Términos de Servicio. Si no está de acuerdo con alguno de los términos, no utilice el Servicio. Estos términos constituyen un acuerdo legal entre usted ("Usuario") y Hermione ("Empresa").`
      },
      {
        title: "2. Descripción del Servicio",
        content: `Hermione es un Estudio de Escritura Inteligente que ofrece:
• Editor de texto enriquecido con colaboración en tiempo real
• Asistente de Inteligencia Artificial integrado
• Sincronización entre dispositivos (web, móvil, tablet)
• Exportación de documentos (PDF, DOCX, EPUB)
• Sistema de worldbuilding para escritores
• Chat con IA para brainstorming y revisión`
      },
      {
        title: "3. Cuenta de Usuario",
        content: `Para utilizar ciertas funcionalidades, necesita crear una cuenta. Usted es responsable de:
• Mantener la confidencialidad de sus credenciales
• Todas las actividades que ocurran en su cuenta
• Notificarnos inmediatamente sobre uso no autorizado
• Proporcionar información verdadera y precisa durante el registro

Debe tener al menos 16 años de edad para crear una cuenta.`
      },
      {
        title: "4. Contenido del Usuario",
        content: `Usted retiene todos los derechos sobre el contenido que crea en Hermione (textos, documentos, personajes, notas). Al utilizar el Servicio:
• Nos otorga una licencia limitada para almacenar y procesar su contenido
• Puede exportar su contenido en cualquier momento
• No reclamamos propiedad sobre sus trabajos
• Usted es responsable del contenido que crea y comparte`
      },
      {
        title: "5. Uso Aceptable",
        content: `Al utilizar Hermione, usted acepta NO:
• Crear o almacenar contenido ilegal, difamatorio o que infrinja derechos de autor
• Intentar acceder a cuentas de otros usuarios sin autorización
• Usar bots o scripts para automatización no autorizada
• Sobrecargar el Servicio con solicitudes excesivas
• Compartir credenciales de acceso
• Usar el Servicio para fines comerciales no autorizados`
      },
      {
        title: "6. Propiedad Intelectual",
        content: `El Servicio, incluyendo su diseño, código, funcionalidades y contenido (excepto el contenido del Usuario), es propiedad de Hermione y está protegido por leyes de propiedad intelectual. Usted no puede:
• Copiar, modificar o distribuir partes del Servicio
• Realizar ingeniería inversa de cualquier parte del Servicio
• Eliminar avisos de propiedad intelectual
• Usar marcas registradas de Hermione sin autorización`
      },
      {
        title: "7. Suscripciones y Pagos",
        content: `Hermione ofrece planes gratuitos y de pago:
• El plan gratuito ofrece funcionalidades limitadas
• Planes de pago (Pro y Premium) ofrecen funcionalidades expandidas
• Las suscripciones se cobran mensual o anualmente
• La cancelación se puede hacer en cualquier momento en la configuración
• Los reembolsos se evalúan caso por caso dentro de 7 días
• Los precios pueden cambiarse con aviso previo de 30 días`
      },
      {
        title: "8. Exención de Responsabilidad",
        content: `El Servicio se proporcion tal cual y "según disponibilidad". No garantizamos:
• Que el Servicio será ininterrumpido o libre de errores
• La precisión de las sugerencias generadas por IA
• La idoneidad del Servicio para fines específicos
• La seguridad absoluta de los datos (aunque tomamos medidas razonables)

No seremos responsables por daños indirectos, incidentales o consecuentes.`
      },
      {
        title: "9. Limitación de Responsabilidad",
        content: `En ningún caso Hermione será responsable por:
• Pérdida de datos causada por fallo del Usuario
• Daños resultantes del uso o imposibilidad de uso del Servicio
• Contenido generado por IA que pueda estar incorrecto
• Interrupciones temporales del Servicio para mantenimiento

Nuestra responsabilidad total no excederá el monto pagado por usted en los últimos 12 meses.`
      },
      {
        title: "10. Terminación",
        content: `Podemos suspender o terminar su cuenta si:
• Viola estos Términos de Servicio
• Su cuenta ha estado inactiva por más de 24 meses
• Recibimos una orden judicial para hacerlo

Al terminar:
• Sus datos se mantendrán por 30 días para posible recuperación
• Después de 30 días, sus datos se eliminarán permanentemente
• Puede solicitar eliminación anticipada a través del soporte`
      },
      {
        title: "11. Modificaciones de los Términos",
        content: `Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios significativos se comunicarán por:
• Correo electrónico a su dirección registrada
• Notificación en la plataforma
• Publicación en esta página con fecha de actualización

El uso continuado después de los cambios constituye aceptación de los nuevos términos.`
      },
      {
        title: "12. Ley Aplicable y Jurisdicción",
        content: `Estos Términos se rigen por las leyes de la República Federativa del Brasil. Se elige el foro de São Paulo/SP para resolver cualquier cuestión derivada de estos Términos, con renuncia a cualquier otro que sea más privilegiado.`
      }
    ]
  }
};

export default function TermsPage() {
  const params = useParams();
  const currentLang = (params?.lang as string) || "pt";
  const content = TERMS_CONTENT[currentLang as keyof typeof TERMS_CONTENT] || TERMS_CONTENT.pt;

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
            Se você tem dúvidas sobre estes Termos, entre em contato conosco através do suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
