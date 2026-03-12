import React from 'react';
import {
    View, Text, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface FotoSectionProps {
    fotoUri: string | null;
    analyzing: boolean;
    aiError: string | null;
    aiFieldsCount: number;
    onFotoOptions: () => void;
    onRemoveFoto: () => void;
    onAnalisarIA: () => void;
}

export default function FotoSection({
    fotoUri,
    analyzing,
    aiError,
    aiFieldsCount,
    onFotoOptions,
    onRemoveFoto,
    onAnalisarIA,
}: FotoSectionProps) {
    if (!fotoUri) {
        return (
            <TouchableOpacity
                onPress={onFotoOptions}
                className="m-5 mb-0 rounded-2xl p-7 items-center border-2 border-dashed"
                style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.primaryLight + '60',
                }}>
                <Ionicons name="camera-outline" size={36} color={COLORS.primaryLight} />
                <Text className="text-base font-semibold mt-2.5" style={{ color: COLORS.primary }}>
                    Fotografar nota fiscal
                </Text>
                <Text className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                    Toque para adicionar foto
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View className="m-5 mb-0">
            {/* Preview da foto */}
            <View className="rounded-2xl overflow-hidden" style={{ height: 200 }}>
                <Image source={{ uri: fotoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View
                    className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center p-2.5"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <TouchableOpacity
                        onPress={onFotoOptions}
                        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: COLORS.primary + 'CC' }}>
                        <Ionicons name="camera" size={18} color={COLORS.textWhite} />
                        <Text className="text-white text-sm font-semibold">Trocar foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onRemoveFoto}
                        className="px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: COLORS.danger + 'CC' }}>
                        <Ionicons name="trash" size={18} color={COLORS.textWhite} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Botão analisar com IA */}
            <TouchableOpacity
                onPress={onAnalisarIA}
                disabled={analyzing}
                className="flex-row items-center justify-center gap-2 rounded-xl p-3.5 mt-3"
                style={{ backgroundColor: '#7C3AED', opacity: analyzing ? 0.7 : 1 }}>
                {analyzing ? (
                    <>
                        <ActivityIndicator size="small" color={COLORS.textWhite} />
                        <Text className="text-white text-base font-bold">Analisando com IA...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="sparkles" size={18} color={COLORS.textWhite} />
                        <Text className="text-white text-base font-bold">Analisar com IA</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Erro da IA */}
            {aiError && (
                <View
                    className="flex-row items-center gap-2 rounded-xl p-3 mt-2"
                    style={{ backgroundColor: COLORS.danger + '15' }}>
                    <Ionicons name="warning-outline" size={16} color={COLORS.danger} />
                    <Text className="flex-1 text-sm" style={{ color: COLORS.danger }}>{aiError}</Text>
                </View>
            )}

            {/* Sucesso da IA */}
            {aiFieldsCount > 0 && !aiError && (
                <View
                    className="flex-row items-center gap-2 rounded-xl p-3 mt-2"
                    style={{ backgroundColor: COLORS.accent + '15' }}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                    <Text className="text-sm font-semibold" style={{ color: COLORS.accent }}>
                        {aiFieldsCount} campo(s) preenchido(s) pela IA
                    </Text>
                </View>
            )}
        </View>
    );
}
