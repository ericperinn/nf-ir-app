import type { AIAnalysisResult } from '../types';

// ============================================================
// Configuração da API Google Gemini para análise de notas fiscais
// ============================================================
// Para usar, obtenha uma chave gratuita em:
// https://aistudio.google.com/app/apikey
// Depois cole abaixo em GEMINI_API_KEY.
// ============================================================

const GEMINI_API_KEY: string =
    (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
    'SUA_CHAVE_AQUI';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const CATEGORIAS_VALIDAS = [
    'saude', 'educacao', 'previdencia', 'doacao',
    'alimentacao', 'transporte', 'moradia', 'lazer',
    'servicos', 'outros',
] as const;

const TIPOS_VALIDOS = ['nfe', 'nfce', 'nfs', 'recibo', 'cupom', 'outros'] as const;

const SYSTEM_PROMPT = `Você é um assistente especializado em ler e extrair dados de notas fiscais, cupons fiscais e recibos brasileiros.

Analise a imagem enviada e extraia TODOS os dados que conseguir identificar. Retorne APENAS um JSON válido (sem markdown, sem código) com os seguintes campos:

{
  "emitente": "Nome da empresa/prestador que emitiu o documento",
  "cnpj_cpf": "CNPJ ou CPF do emitente (com formatação XX.XXX.XXX/XXXX-XX ou XXX.XXX.XXX-XX)",
  "numero": "Número da nota/cupom/recibo",
  "data_emissao": "Data no formato AAAA-MM-DD",
  "valor_total": "Valor total numérico (apenas número com ponto decimal, ex: 150.00)",
  "tipo": "Tipo do documento: um de [${TIPOS_VALIDOS.join(', ')}]",
  "categoria": "Categoria mais provável: uma de [${CATEGORIAS_VALIDAS.join(', ')}]",
  "descricao": "Breve descrição dos itens/serviços da nota",
  "deducivel": true ou false (se a despesa é dedutível no Imposto de Renda)
}

Regras:
- Se não conseguir identificar um campo, use null.
- O valor_total deve ser um número (sem R$, sem pontos de milhar). Use ponto como separador decimal.
- Para categoria, use a mais adequada baseada no conteúdo: saude (hospitais, clínicas, farmácias, planos de saúde), educacao (escolas, faculdades, cursos), previdencia (INSS, previdência privada), alimentacao (restaurantes, supermercados), etc.
- Para tipo: nfe = nota fiscal eletrônica, nfce = nota fiscal ao consumidor, nfs = nota de serviço, recibo = recibos em geral, cupom = cupom fiscal.
- Para deducivel: true se for despesa de saúde, educação, previdência ou doação. false caso contrário.
- Retorne SOMENTE o JSON, sem explicações.`;

/**
 * Envia imagem em base64 para o Google Gemini e retorna dados extraídos da NF.
 */
export async function analisarNotaFiscal(
    base64Image: string,
    mimeType: string = 'image/jpeg'
): Promise<AIAnalysisResult> {
    if (GEMINI_API_KEY === 'SUA_CHAVE_AQUI') {
        throw new Error(
            'Configure sua chave da API Gemini em src/utils/aiConfig.ts\n' +
            'Obtenha gratuitamente em: https://aistudio.google.com/app/apikey'
        );
    }

    const body = {
        contents: [
            {
                parts: [
                    { text: SYSTEM_PROMPT },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 },
        },
    };

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = (errorData as any)?.error?.message || `Erro HTTP ${response.status}`;
        throw new Error(`Erro na API Gemini: ${msg}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (candidate?.finishReason === 'MAX_TOKENS') {
        throw new Error('A resposta da IA foi cortada (limite de tokens). Tente novamente.');
    }

    if (!text) {
        throw new Error('A IA não retornou dados. Tente com uma foto mais nítida.');
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        const parsed = JSON.parse(cleaned);
        return {
            emitente: parsed.emitente || null,
            cnpj_cpf: parsed.cnpj_cpf || null,
            numero: parsed.numero ? String(parsed.numero) : null,
            data_emissao: parsed.data_emissao || null,
            valor_total: parsed.valor_total != null ? String(parsed.valor_total) : null,
            tipo: TIPOS_VALIDOS.includes(parsed.tipo) ? parsed.tipo : null,
            categoria: CATEGORIAS_VALIDAS.includes(parsed.categoria) ? parsed.categoria : null,
            descricao: parsed.descricao || null,
            deducivel: typeof parsed.deducivel === 'boolean' ? parsed.deducivel : null,
        };
    } catch (e) {
        console.error(e);
        throw new Error('Não foi possível interpretar a resposta da IA. Tente novamente.');
    }
}

export { GEMINI_API_KEY };
