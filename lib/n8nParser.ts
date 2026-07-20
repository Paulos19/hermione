/**
 * Limpa e extrai a mensagem de texto pura de retornos JSON do n8n,
 * resolvendo problemas com arrays, objetos aninhados, formatação do tipo OpenAI
 * ou JSONs stringificados.
 */
function formatarRespostaN8NInternal(data: any): string {
  if (data === null || data === undefined) {
    return ""
  }

  // Se for um array de resultados (padrão do n8n em vários nós), pega o primeiro item
  if (Array.isArray(data)) {
    if (data.length === 0) return ""
    return formatarRespostaN8NInternal(data[0])
  }

  // Se for uma string pura
  if (typeof data === "string") {
    const trimmed = data.trim()

    // Verifica se a string é na verdade um JSON stringificado
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed)
        return formatarRespostaN8NInternal(parsed)
      } catch (e) {
        // Não é JSON válido, segue como string pura
      }
    }

    return trimmed
  }

  // Se for um objeto
  if (typeof data === "object") {
    // Chaves comuns do n8n e agentes de IA em ordem de prioridade
    const priorityKeys = [
      "response",
      "output",
      "text",
      "content",
      "message",
      "result",
      "data",
    ]

    for (const key of priorityKeys) {
      if (key in data && data[key] !== undefined && data[key] !== null) {
        return formatarRespostaN8NInternal(data[key])
      }
    }

    // Suporte para padrão OpenAI (choices[0].message.content)
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const choice = data.choices[0]
      if (choice.message && choice.message.content) {
        return formatarRespostaN8NInternal(choice.message.content)
      }
      if (choice.text) {
        return formatarRespostaN8NInternal(choice.text)
      }
    }

    // Se não encontrou chaves conhecidas, busca por qualquer chave que tenha string
    for (const val of Object.values(data)) {
      if (typeof val === "string" && val.trim().length > 0) {
        return val.trim()
      }
    }

    // Fallback absoluto: stringify o objeto
    return JSON.stringify(data)
  }

  const finalStr = String(data);
  return finalStr.replace(/undefined/g, "").trim();
}

export function formatarRespostaN8N(data: any): string {
  const result = formatarRespostaN8NInternal(data);
  return result.replace(/undefined/gi, '').trim();
}
