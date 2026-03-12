import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../utils/constants';

interface YearSelectorProps {
    anos: number[];
    anoSelecionado: number;
    onSelect: (ano: number) => void;
    label?: string;
    layout?: 'horizontal-scroll' | 'row';
}

export default function YearSelector({
    anos,
    anoSelecionado,
    onSelect,
    label,
    layout = 'horizontal-scroll',
}: YearSelectorProps) {
    const Chip = ({ ano }: { ano: number }) => {
        const active = anoSelecionado === ano;
        return (
            <TouchableOpacity
                key={ano}
                onPress={() => onSelect(ano)}
                className="px-4 py-1.5 rounded-full mr-2 border"
                style={{
                    backgroundColor: active ? COLORS.primary : COLORS.bgCard,
                    borderColor: active ? COLORS.primary : COLORS.border,
                }}>
                <Text
                    className="text-sm font-semibold"
                    style={{ color: active ? COLORS.textWhite : COLORS.textSecondary }}>
                    {ano}
                </Text>
            </TouchableOpacity>
        );
    };

    if (layout === 'row') {
        return (
            <View className="flex-row px-4 py-3 gap-2">
                {anos.map((a) => (
                    <Chip key={a} ano={a} />
                ))}
            </View>
        );
    }

    return (
        <View className="flex-row items-center px-5 py-3">
            {label && (
                <Text className="text-sm mr-2" style={{ color: COLORS.textSecondary }}>
                    {label}
                </Text>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {anos.map((a) => (
                    <Chip key={a} ano={a} />
                ))}
            </ScrollView>
        </View>
    );
}
