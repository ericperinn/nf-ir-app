import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface EmptyStateProps {
    icon: string;
    title: string;
    text: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: string;
}

export default function EmptyState({
    icon,
    title,
    text,
    actionLabel,
    onAction,
    actionIcon = 'add',
}: EmptyStateProps) {
    return (
        <View className="items-center py-12 px-10">
            <Ionicons name={icon as any} size={64} color={COLORS.textLight} />
            <Text className="text-lg font-bold mt-4 mb-2" style={{ color: COLORS.text }}>
                {title}
            </Text>
            <Text className="text-sm text-center leading-5" style={{ color: COLORS.textSecondary }}>
                {text}
            </Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className="flex-row items-center gap-2 px-5 py-3 rounded-xl mt-5"
                    style={{ backgroundColor: COLORS.primary }}>
                    <Ionicons name={actionIcon as any} size={18} color={COLORS.textWhite} />
                    <Text className="text-white font-semibold">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
