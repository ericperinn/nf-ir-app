import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StatusBar, Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getResumoAnual, getAllNotas } from '../database/db';
import { COLORS, formatCurrency, getCategoriaInfo, ANOS_DISPONIVEIS } from '../utils/constants';
import type { TabScreenNavigationProp } from '../types/navigation';
import type { NotaFiscal, ResumoAnual } from '../types';

import ScreenHeader from '../components/common/ScreenHeader';
import EmptyState from '../components/common/EmptyState';
import YearSelector from '../components/common/YearSelector';
import NotaCard from '../components/nota/NotaCard';

interface Props {
    navigation: TabScreenNavigationProp;
}

export default function ResumoScreen({ navigation }: Props) {
    const [ano, setAno] = useState(new Date().getFullYear());
    const [resumo, setResumo] = useState<ResumoAnual | null>(null);
    const [notas, setNotas] = useState<NotaFiscal[]>([]);
    const anos = ANOS_DISPONIVEIS();

    const carregar = useCallback(async () => {
        const [res, ns] = await Promise.all([
            getResumoAnual(ano),
            getAllNotas({ ano, deducivel: true }),
        ]);
        setResumo(res);
        setNotas(ns);
    }, [ano]);

    useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

    const exportarResumo = async () => {
        const linhas = [
            `📊 RESUMO IR ${ano}`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `Total de notas: ${resumo?.total_notas || 0}`,
            `Total gasto: ${formatCurrency(resumo?.total_gasto)}`,
            `Total dedutível: ${formatCurrency(resumo?.total_deducivel)}`,
            '',
            '📁 POR CATEGORIA:',
            ...(resumo?.porCategoria || []).map((c) => {
                const info = getCategoriaInfo(c.categoria);
                return `• ${info.label}: ${formatCurrency(c.total)}${c.deducivel > 0 ? ` (${formatCurrency(c.deducivel)} dedutível)` : ''}`;
            }),
            '',
            '📝 NOTAS DEDUTÍVEIS:',
            ...notas.map((n) => `• ${n.emitente} — ${formatCurrency(n.valor_total)} — ${n.data_emissao?.split('-').reverse().join('/')}`),
        ];
        await Share.share({ message: linhas.join('\n'), title: `Resumo IR ${ano}` });
    };

    const cats = resumo?.porCategoria || [];
    const maxVal = cats.reduce((max, c) => Math.max(max, c.total), 0);
    const isEmpty = !resumo || resumo.total_notas === 0;

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

            <ScreenHeader
                title="Imposto de Renda"
                subtitle="Declaração"
                rightContent={
                    <TouchableOpacity
                        onPress={exportarResumo}
                        className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl"
                        style={{ backgroundColor: COLORS.accent }}>
                        <Ionicons name="share-outline" size={18} color={COLORS.textWhite} />
                        <Text className="text-white font-bold text-sm">Exportar</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Seletor de ano */}
                <YearSelector
                    anos={anos}
                    anoSelecionado={ano}
                    onSelect={setAno}
                    layout="row"
                />

                {/* Destaque dedução */}
                <View
                    className="mx-4 mb-3 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: COLORS.primary }}>
                    <View className="p-7 items-center">
                        <Ionicons name="shield-checkmark" size={40} color={COLORS.accent} />
                        <Text className="text-xs font-semibold mt-3 mb-1.5" style={{ color: COLORS.accentLight }}>
                            Total dedutível em {ano}
                        </Text>
                        <Text style={{ color: COLORS.textWhite, fontSize: 36, fontWeight: '800' }}>
                            {formatCurrency(resumo?.total_deducivel)}
                        </Text>
                        <Text className="text-sm mt-1.5" style={{ color: COLORS.textWhite + '80' }}>
                            de {formatCurrency(resumo?.total_gasto)} em {resumo?.total_notas || 0} notas
                        </Text>
                    </View>
                </View>

                {/* Cards de resumo */}
                <View className="flex-row px-4 gap-2.5 mb-4">
                    {[
                        { icon: 'receipt-outline', color: COLORS.primaryLight, value: String(resumo?.total_notas || 0), label: 'Notas registradas' },
                        { icon: 'checkmark-circle-outline', color: COLORS.accent, value: String(notas.length), label: 'Dedutíveis' },
                        { icon: 'trending-down-outline', color: COLORS.warning, value: formatCurrency(resumo?.total_gasto), label: 'Total gasto' },
                    ].map((card) => (
                        <View
                            key={card.label}
                            className="flex-1 rounded-2xl p-3.5 items-center gap-1 border"
                            style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                            <Ionicons name={card.icon as any} size={20} color={card.color} />
                            <Text className="text-sm font-bold" style={{ color: COLORS.text }}>{card.value}</Text>
                            <Text className="text-xs text-center" style={{ color: COLORS.textSecondary }}>{card.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Por categoria */}
                {cats.length > 0 && (
                    <View className="mx-4 mb-4">
                        <Text className="text-base font-bold mb-3" style={{ color: COLORS.text }}>Por categoria</Text>
                        {cats.map((cat) => {
                            const info = getCategoriaInfo(cat.categoria);
                            const barWidth = maxVal > 0 ? (cat.total / maxVal) * 100 : 0;
                            return (
                                <View
                                    key={cat.categoria}
                                    className="rounded-2xl p-3.5 mb-2.5 border"
                                    style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                                    {/* Header */}
                                    <View className="flex-row justify-between items-center mb-2.5">
                                        <View className="flex-row items-center gap-2.5">
                                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                                            <Text className="text-sm font-semibold" style={{ color: COLORS.text }}>{info.label}</Text>
                                            {cat.deducivel > 0 && (
                                                <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.accent }}>
                                                    <Text className="text-white font-bold" style={{ fontSize: 10 }}>IR</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-sm font-bold" style={{ color: COLORS.text }}>
                                                {formatCurrency(cat.total)}
                                            </Text>
                                            {cat.deducivel > 0 && (
                                                <Text className="text-xs font-semibold" style={{ color: COLORS.accent }}>
                                                    ↑ {formatCurrency(cat.deducivel)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    {/* Barra */}
                                    <View className="h-2 rounded overflow-hidden" style={{ backgroundColor: COLORS.borderLight }}>
                                        <View
                                            style={{
                                                height: 8,
                                                borderRadius: 4,
                                                width: `${barWidth}%`,
                                                backgroundColor: info.color,
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                            }}
                                        />
                                    </View>
                                    <Text className="text-xs mt-1.5" style={{ color: COLORS.textLight }}>
                                        {cat.qtd} nota{cat.qtd !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Notas dedutíveis */}
                {notas.length > 0 && (
                    <View className="mx-4 mb-4">
                        <Text className="text-base font-bold mb-3" style={{ color: COLORS.text }}>
                            Notas dedutíveis
                        </Text>
                        {notas.map((nota) => {
                            const valorDed = nota.valor_total * nota.percentual_deducao / 100;
                            return (
                                <NotaCard
                                    key={nota.id}
                                    nota={nota}
                                    compact
                                    onPress={() => navigation.navigate('DetalhesNota', { id: nota.id })}
                                />
                            );
                        })}

                        {/* Total dedutível */}
                        <View
                            className="flex-row justify-between items-center rounded-2xl p-4 mt-1"
                            style={{ backgroundColor: COLORS.primary }}>
                            <Text className="text-sm font-semibold" style={{ color: COLORS.accentLight }}>
                                Total dedutível
                            </Text>
                            <Text style={{ color: COLORS.textWhite, fontSize: 20, fontWeight: '800' }}>
                                {formatCurrency(resumo?.total_deducivel)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Estado vazio */}
                {isEmpty && (
                    <EmptyState
                        icon="document-text-outline"
                        title={`Nenhum dado em ${ano}`}
                        text="Adicione notas fiscais para gerar seu resumo do IR"
                    />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
