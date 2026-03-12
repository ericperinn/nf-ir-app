import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { analisarNotaFiscal } from '../utils/aiConfig';

/**
 * Hook para analisar nota fiscal via IA (Google Gemini Vision)
 * 
 * Retorna:
 *  - analyzing: boolean indicando se está processando
 *  - error: string | null com mensagem de erro
 *  - result: objeto com campos extraídos | null
 *  - fieldsFromAI: Set com nomes dos campos que a IA preencheu
 *  - analyzeImage: função que recebe a URI da foto e opcionalmente o base64
 *  - clearResult: limpa resultado e erro
 */
export default function useNFAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [fieldsFromAI, setFieldsFromAI] = useState(new Set());

  const analyzeImage = useCallback(async (imageUri, base64Provided) => {
    if (!imageUri && !base64Provided) {
      setError('Nenhuma imagem selecionada.');
      return null;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setFieldsFromAI(new Set());

    try {
      let base64 = base64Provided;

      // Se não veio base64 do picker, tentar ler do arquivo
      if (!base64 && imageUri) {
        try {
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (readErr) {
          // Fallback: importar da API legada
          const LegacyFS = await import('expo-file-system/legacy');
          base64 = await LegacyFS.readAsStringAsync(imageUri, {
            encoding: LegacyFS.EncodingType.Base64,
          });
        }
      }

      if (!base64) {
        throw new Error('Não foi possível ler a imagem. Tente tirar a foto novamente.');
      }

      // Determinar mime type pela extensão
      const ext = imageUri ? imageUri.split('.').pop()?.toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      // Chamar API
      const dados = await analisarNotaFiscal(base64, mimeType);

      // Determinar quais campos a IA preencheu
      const filled = new Set();
      Object.entries(dados).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          filled.add(key);
        }
      });

      setResult(dados);
      setFieldsFromAI(filled);
      setAnalyzing(false);
      return dados;
    } catch (err) {
      const msg = err.message || 'Erro desconhecido na análise.';
      setError(msg);
      setAnalyzing(false);
      return null;
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setFieldsFromAI(new Set());
  }, []);

  return {
    analyzing,
    error,
    result,
    fieldsFromAI,
    analyzeImage,
    clearResult,
  };
}
