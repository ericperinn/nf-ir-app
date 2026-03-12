import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface LabeledInputProps extends TextInputProps {
    label: string;
    isAIField?: boolean;
    required?: boolean;
}

export default function LabeledInput({
    label,
    isAIField = false,
    required = false,
    multiline,
    style,
    ...rest
}: LabeledInputProps) {
    return (
        <View className="mt-3">
            <View className="flex-row items-center gap-2 mb-1.5">
                <Text className="text-sm font-semibold" style={{ color: COLORS.text }}>
                    {label}{required ? ' *' : ''}
                </Text>
                {isAIField && (
                    <View
                        className="flex-row items-center gap-1 px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#7C3AED' }}>
                        <Ionicons name="sparkles" size={10} color={COLORS.textWhite} />
                        <Text className="text-white font-bold" style={{ fontSize: 10 }}>IA</Text>
                    </View>
                )}
            </View>
            <TextInput
                placeholderTextColor={COLORS.textLight}
                style={[
                    {
                        backgroundColor: COLORS.bgCard,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 15,
                        color: COLORS.text,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        height: multiline ? 80 : undefined,
                        paddingTop: multiline ? 12 : undefined,
                        textAlignVertical: multiline ? 'top' : undefined,
                    } as any,
                    style,
                ]}
                multiline={multiline}
                {...rest}
            />
        </View>
    );
}
