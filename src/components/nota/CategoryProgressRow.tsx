import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, formatCurrency, getCategoriaInfo } from '../../utils/constants';
import type { CategoriaResumo } from '../../types';

interface CategoryProgressRowProps {
    cat: CategoriaResumo;
    totalGasto: number;
    showPercent?: boolean;
}

export default function CategoryProgressRow({
    cat,
    totalGasto,
    showPercent = false,
}: CategoryProgressRowProps) {
    const info = getCategoriaInfo(cat.categoria);
    const pct = totalGasto > 0 ? (cat.total / totalGasto) * 100 : 0;

    return (
        <View className="flex-row items-center mb-3">
            {/* Ícone */}
            <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: info.color + '20' }}>
                <Ionicons name={info.icon as any} size={16} color={info.color} />
            </View>

            <View className="flex-1">
                {/* Header da categoria */}
                <View className="flex-row justify-between mb-1.5">
                    <Text className="text-sm font-semibold" style={{ color: COLORS.text }}>
                        {info.label}
                    </Text>
                    <Text className="text-sm font-bold" style={{ color: COLORS.text }}>
                        {formatCurrency(cat.total)}
                    </Text>
                </View>

                {/* Barra de progresso */}
                <View
                    className="h-1 rounded-sm overflow-hidden"
                    style={{ backgroundColor: COLORS.borderLight }}>
                    <View
                        style={{
                            height: 4,
                            borderRadius: 2,
                            width: `${pct}%`,
                            backgroundColor: info.color,
                        }}
                    />
                </View>

                {/* Dedutível */}
                {cat.deducivel > 0 && (
                    <Text className="text-xs mt-0.5 font-semibold" style={{ color: COLORS.accent }}>
                        ↑ {formatCurrency(cat.deducivel)} dedutível
                    </Text>
                )}
            </View>
        </View>
    );
}
