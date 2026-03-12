import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryIconProps {
    icon: string;
    color: string;
    size?: number;
    boxSize?: number;
    borderRadius?: number;
}

export default function CategoryIcon({
    icon,
    color,
    size = 18,
    boxSize = 36,
    borderRadius = 10,
}: CategoryIconProps) {
    return (
        <View
            style={{
                width: boxSize,
                height: boxSize,
                borderRadius,
                backgroundColor: color + '20',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <Ionicons name={icon as any} size={size} color={color} />
        </View>
    );
}
