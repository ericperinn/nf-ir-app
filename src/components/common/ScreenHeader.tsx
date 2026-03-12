import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightContent?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, rightContent }: ScreenHeaderProps) {
    return (
        <View className="bg-primary flex-row items-center justify-between px-4"
            style={{ paddingTop: Platform.OS === 'ios' ? 52 : 44, paddingBottom: 14 }}>
            <View className="flex-row items-center flex-1">
                {onBack && (
                    <TouchableOpacity onPress={onBack} className="p-2 mr-2">
                        <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
                    </TouchableOpacity>
                )}
                <View className="flex-1">
                    {subtitle && (
                        <Text className="text-accent-light text-xs font-semibold tracking-widest">
                            {subtitle}
                        </Text>
                    )}
                    <Text className="text-white font-bold" style={{ fontSize: onBack ? 18 : 24 }} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
            </View>
            {rightContent && <View className="flex-row items-center gap-1">{rightContent}</View>}
        </View>
    );
}
