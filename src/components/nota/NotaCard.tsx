import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, formatCurrency, getCategoriaInfo } from '../../utils/constants';
import CategoryIcon from '../common/CategoryIcon';
import IRBadge from '../common/IRBadge';
import type { NotaFiscal } from '../../types';

interface NotaCardProps {
    nota: NotaFiscal;
    onPress: () => void;
    onLongPress?: () => void;
    compact?: boolean;
}

export default function NotaCard({ nota, onPress, onLongPress, compact = false }: NotaCardProps) {
    const info = getCategoriaInfo(nota.categoria);
    const isDeducivel = Boolean(nota.deducivel);

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-row items-center rounded-2xl mb-2"
            style={{
                backgroundColor: COLORS.bgCard,
                padding: 14,
                shadowColor: COLORS.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
            }}>
            <CategoryIcon icon={info.icon} color={info.color} size={compact ? 18 : 22} boxSize={compact ? 40 : 44} borderRadius={12} />

            <View className="flex-1 ml-3">
                {/* Linha superior */}
                <View className="flex-row justify-between items-center mb-1">
                    <Text
                        className="flex-1 font-bold mr-2"
                        style={{ fontSize: compact ? 14 : 14, color: COLORS.text }}
                        numberOfLines={1}>
                        {nota.emitente}
                    </Text>
                    <Text className="font-bold" style={{ fontSize: 14, color: compact ? COLORS.primary : COLORS.text }}>
                        {formatCurrency(nota.valor_total)}
                    </Text>
                </View>

                {/* Linha inferior */}
                <View className="flex-row items-center flex-wrap">
                    <Text className="text-xs" style={{ color: COLORS.textSecondary }}>{info.label}</Text>
                    <Text className="text-xs mx-1" style={{ color: COLORS.textLight }}>·</Text>
                    <Text className="text-xs" style={{ color: COLORS.textSecondary }}>
                        {nota.data_emissao?.split('-').reverse().join('/')}
                    </Text>
                    {nota.numero ? (
                        <>
                            <Text className="text-xs mx-1" style={{ color: COLORS.textLight }}>·</Text>
                            <Text className="text-xs" style={{ color: COLORS.textSecondary }}>Nº {nota.numero}</Text>
                        </>
                    ) : null}
                </View>

                {nota.descricao && !compact ? (
                    <Text className="text-xs mt-0.5" style={{ color: COLORS.textLight }} numberOfLines={1}>
                        {nota.descricao}
                    </Text>
                ) : null}
            </View>

            {/* Ações */}
            <View className="items-center gap-1.5 ml-2">
                {isDeducivel && <IRBadge />}
                {nota.foto_uri ? (
                    <Ionicons name="image-outline" size={16} color={COLORS.textLight} />
                ) : null}
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </View>
        </TouchableOpacity>
    );
}
