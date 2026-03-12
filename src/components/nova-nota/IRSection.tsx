import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { COLORS, getCategoriaInfo } from '../../utils/constants';

interface IRSectionProps {
    deducivel: boolean;
    percentualDeducao: string;
    categoria: string;
    onToggleDeducivel: (val: boolean) => void;
    onSelectPercentual: (pct: string) => void;
}

const PERCENTUAIS = ['25', '50', '75', '100'];

export default function IRSection({
    deducivel,
    percentualDeducao,
    categoria,
    onToggleDeducivel,
    onSelectPercentual,
}: IRSectionProps) {
    return (
        <View>
            {/* Switch dedutível */}
            <View
                className="flex-row items-center rounded-xl p-3.5 mt-3 border"
                style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.border,
                }}>
                <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: COLORS.text }}>
                        Despesa dedutível no IR?
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                        {deducivel
                            ? '✅ Será incluída no cálculo de deduções'
                            : 'Não será considerada na declaração'}
                    </Text>
                </View>
                <Switch
                    value={deducivel}
                    onValueChange={(v) => {
                        onToggleDeducivel(v);
                        if (v && getCategoriaInfo(categoria).deducivel) onSelectPercentual('100');
                    }}
                    trackColor={{ false: COLORS.border, true: COLORS.accent + '80' }}
                    thumbColor={deducivel ? COLORS.accent : COLORS.textLight}
                />
            </View>

            {/* Percentual de dedução */}
            {deducivel && (
                <View className="mt-3">
                    <Text className="text-sm font-semibold mb-1.5" style={{ color: COLORS.text }}>
                        % dedutível do valor
                    </Text>
                    <View className="flex-row gap-2.5">
                        {PERCENTUAIS.map((p) => {
                            const active = percentualDeducao === p;
                            return (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => onSelectPercentual(p)}
                                    className="flex-1 py-2.5 rounded-xl border items-center"
                                    style={{
                                        borderColor: active ? COLORS.primary : COLORS.border,
                                        backgroundColor: active ? COLORS.primary : COLORS.bgCard,
                                    }}>
                                    <Text
                                        className="font-semibold"
                                        style={{ color: active ? COLORS.textWhite : COLORS.textSecondary }}>
                                        {p}%
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}
