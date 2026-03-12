import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getResumoAnual, getAllNotas } from '../database/db';
import { COLORS, formatCurrency, ANOS_DISPONIVEIS } from '../utils/constants';
import type { TabScreenNavigationProp } from '../types/navigation';
import type { NotaFiscal, ResumoAnual } from '../types';

import ScreenHeader from '../components/common/ScreenHeader';
import EmptyState from '../components/common/EmptyState';
import YearSelector from '../components/common/YearSelector';
import NotaCard from '../components/nota/NotaCard';
import CategoryProgressRow from '../components/nota/CategoryProgressRow';

interface Props {
    navigation: TabScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
    const [ano, setAno] = useState(new Date().getFullYear());
    const [resumo, setResumo] = useState<ResumoAnual | null>(null);
    const [ultimasNotas, setUltimasNotas] = useState<NotaFiscal[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const anos = ANOS_DISPONIVEIS();

    const carregarDados = useCallback(async () => {
        try {
            const [res, notas] = await Promise.all([
                getResumoAnual(ano),
                getAllNotas({ ano }),
            ]);
            setResumo(res);
            setUltimasNotas(notas.slice(0, 4));
        } catch (e) {
            console.error(e);
        }
    }, [ano]);

    useFocusEffect(useCallback(() => { carregarDados(); }, [carregarDados]));

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarDados();
        setRefreshing(false);
    };

    const porCategoria = resumo?.porCategoria || [];
    const isEmpty = !resumo || resumo.total_notas === 0;

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScreenHeader
                title="Notas Fiscais"
                subtitle="Imposto de Renda"
                rightContent={
                    <TouchableOpacity
                        onPress={() => navigation.navigate('NovaNotaStack')}
                        className="w-11 h-11 rounded-full items-center justify-center"
                        style={{ backgroundColor: COLORS.accent }}>
                        <Ionicons name="add" size={26} color={COLORS.textWhite} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }>
                {/* Seletor de ano */}
                <YearSelector
                    anos={anos}
                    anoSelecionado={ano}
                    onSelect={setAno}
                    label="Ano fiscal:"
                />

                {/* Cards de resumo */}
                <View className="flex-row px-5 gap-3 mb-3">
                    <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: COLORS.primary }}>
                        <Ionicons name="receipt-outline" size={22} color={COLORS.accentLight} />
                        <Text className="text-lg font-bold mt-1" style={{ color: COLORS.textWhite }}>
                            {resumo?.total_notas || 0}
                        </Text>
                        <Text className="text-xs" style={{ color: COLORS.accentLight }}>Notas salvas</Text>
                    </View>
                    <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: COLORS.primary }}>
                        <Ionicons name="wallet-outline" size={22} color={COLORS.accentLight} />
                        <Text className="text-lg font-bold mt-1" numberOfLines={1} style={{ color: COLORS.textWhite }}>
                            {formatCurrency(resumo?.total_gasto)}
                        </Text>
                        <Text className="text-xs" style={{ color: COLORS.accentLight }}>Total gasto</Text>
                    </View>
                </View>

                {/* Card dedução */}
                <View
                    className="mx-5 mb-4 rounded-2xl p-4 flex-row items-center justify-between border"
                    style={{
                        backgroundColor: COLORS.bgCard,
                        borderColor: COLORS.accent + '40',
                        shadowColor: COLORS.accent,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                    }}>
                    <View className="flex-row items-center">
                        <Ionicons name="shield-checkmark" size={28} color={COLORS.accent} />
                        <View className="ml-3">
                            <Text className="text-xs" style={{ color: COLORS.textSecondary }}>Total dedutível no IR</Text>
                            <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>
                                {formatCurrency(resumo?.total_deducivel)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Resumo')}
                        className="flex-row items-center gap-0.5">
                        <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>Ver detalhes</Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Por categoria */}
                {porCategoria.length > 0 && (
                    <View className="mx-5 mb-4">
                        <Text className="text-base font-bold mb-3" style={{ color: COLORS.text }}>
                            Por categoria
                        </Text>
                        {porCategoria.map((cat) => (
                            <CategoryProgressRow
                                key={cat.categoria}
                                cat={cat}
                                totalGasto={resumo?.total_gasto || 0}
                            />
                        ))}
                    </View>
                )}

                {/* Últimas notas */}
                {ultimasNotas.length > 0 && (
                    <View className="mx-5 mb-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-base font-bold" style={{ color: COLORS.text }}>Recentes</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Listagem')}>
                                <Text className="text-sm font-semibold" style={{ color: COLORS.primaryLight }}>
                                    Ver todas
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {ultimasNotas.map((nota) => (
                            <NotaCard
                                key={nota.id}
                                nota={nota}
                                compact
                                onPress={() => navigation.navigate('DetalhesNota', { id: nota.id })}
                            />
                        ))}
                    </View>
                )}

                {/* Estado vazio */}
                {isEmpty && (
                    <EmptyState
                        icon="receipt-outline"
                        title="Nenhuma nota ainda"
                        text="Toque no + para adicionar sua primeira nota fiscal"
                        actionLabel="Adicionar nota"
                        onAction={() => navigation.navigate('NovaNotaStack')}
                    />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
