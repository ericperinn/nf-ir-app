import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface IRBadgeProps {
    /** 'mini' = apenas "IR", 'full' = "Dedutível" com ícone */
    variant?: 'mini' | 'full';
}

export default function IRBadge({ variant = 'mini' }: IRBadgeProps) {
    if (variant === 'full') {
        return (
            <View
                className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
                style={{ backgroundColor: COLORS.accent }}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.textWhite} />
                <Text className="text-white text-xs font-bold">Dedutível</Text>
            </View>
        );
    }
    return (
        <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.accent }}>
            <Text className="text-white text-xs font-bold">IR</Text>
        </View>
    );
}
