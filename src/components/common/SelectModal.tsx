import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export interface SelectOption {
    id: string;
    label: string;
    icon?: string;
    iconColor?: string;
    badge?: string;
}

interface SelectModalProps {
    visible: boolean;
    title: string;
    options: SelectOption[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onClose: () => void;
}

export default function SelectModal({
    visible,
    title,
    options,
    selectedId,
    onSelect,
    onClose,
}: SelectModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View
                    className="rounded-t-3xl p-5"
                    style={{ backgroundColor: COLORS.bgCard, maxHeight: '75%' }}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold" style={{ color: COLORS.text }}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const active = selectedId === item.id;
                            return (
                                <TouchableOpacity
                                    onPress={() => onSelect(item.id)}
                                    className="flex-row items-center py-3 px-1 border-b"
                                    style={{
                                        borderBottomColor: COLORS.borderLight,
                                        backgroundColor: active ? COLORS.primary + '10' : 'transparent',
                                        borderRadius: active ? 10 : 0,
                                        paddingHorizontal: active ? 10 : 4,
                                    }}>
                                    {item.icon && item.iconColor && (
                                        <View
                                            className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                            style={{ backgroundColor: item.iconColor + '20' }}>
                                            <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                                        </View>
                                    )}
                                    {item.icon && !item.iconColor && (
                                        <Ionicons
                                            name={item.icon as any}
                                            size={18}
                                            color={COLORS.primary}
                                            style={{ marginRight: 12 }}
                                        />
                                    )}
                                    <Text className="flex-1 text-base font-medium" style={{ color: COLORS.text }}>
                                        {item.label}
                                    </Text>
                                    {item.badge && (
                                        <View className="px-2 py-0.5 rounded mr-2" style={{ backgroundColor: COLORS.accent }}>
                                            <Text className="text-white text-xs font-bold">{item.badge}</Text>
                                        </View>
                                    )}
                                    {active && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}
