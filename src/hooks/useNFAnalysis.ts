import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { analisarNotaFiscal } from '../utils/aiConfig';
import type { AIAnalysisResult } from '../types';

interface UseNFAnalysisReturn {
    analyzing: boolean;
    error: string | null;
    result: AIAnalysisResult | null;
    fieldsFromAI: Set<string>;
    analyzeImage: (imageUri: string, base64Provided?: string | null) => Promise<AIAnalysisResult | null>;
    clearResult: () => void;
}

/**
 * Hook para analisar nota fiscal via IA (Google Gemini Vision).
 */
export default function useNFAnalysis(): UseNFAnalysisReturn {
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AIAnalysisResult | null>(null);
    const [fieldsFromAI, setFieldsFromAI] = useState<Set<string>>(new Set());

    const analyzeImage = useCallback(
        async (imageUri: string, base64Provided?: string | null): Promise<AIAnalysisResult | null> => {
            if (!imageUri && !base64Provided) {
                setError('Nenhuma imagem selecionada.');
                return null;
            }

            setAnalyzing(true);
            setError(null);
            setResult(null);
            setFieldsFromAI(new Set());

            try {
                let base64 = base64Provided ?? null;

                if (!base64 && imageUri) {
                    try {
                        base64 = await FileSystem.readAsStringAsync(imageUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                    } catch {
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

                const ext = imageUri ? imageUri.split('.').pop()?.toLowerCase() : 'jpg';
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

                const dados = await analisarNotaFiscal(base64, mimeType);

                const filled = new Set<string>();
                (Object.entries(dados) as [string, unknown][]).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        filled.add(key);
                    }
                });

                setResult(dados);
                setFieldsFromAI(filled);
                setAnalyzing(false);
                return dados;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Erro desconhecido na análise.';
                setError(msg);
                setAnalyzing(false);
                return null;
            }
        },
        []
    );

    const clearResult = useCallback(() => {
        setResult(null);
        setError(null);
        setFieldsFromAI(new Set());
    }, []);

    return { analyzing, error, result, fieldsFromAI, analyzeImage, clearResult };
}
