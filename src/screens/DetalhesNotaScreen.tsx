import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Alert, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotaById, deleteNota } from '../database/db';
import { COLORS, formatCurrency, formatDate, getCategoriaInfo, TIPOS_NF } from '../utils/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, DetalhesNotaRouteProp } from '../types/navigation';
import type { NotaFiscal } from '../types';

import ScreenHeader from '../components/common/ScreenHeader';
import CategoryIcon from '../components/common/CategoryIcon';
import IRBadge from '../components/common/IRBadge';

interface Props {
    navigation: NativeStackNavigationProp<RootStackParamList, 'DetalhesNota'>;
    route: DetalhesNotaRouteProp;
}

function DetalheRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View
            className="flex-row items-start p-3.5 border-b"
            style={{ borderBottomColor: COLORS.borderLight }}>
            <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: COLORS.primary + '10' }}>
                <Ionicons name={icon as any} size={16} color={COLORS.primaryLight} />
            </View>
            <View className="flex-1">
                <Text className="text-xs font-semibold tracking-wide" style={{ color: COLORS.textSecondary }}>
                    {label}
                </Text>
                <Text className="text-sm mt-0.5 font-medium" style={{ color: COLORS.text }}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

export default function DetalhesNotaScreen({ navigation, route }: Props) {
    const { id } = route.params;
    const [nota, setNota] = useState<NotaFiscal | null>(null);
    const [fotoZoom, setFotoZoom] = useState(false);

    const carregar = useCallback(async () => {
        const n = await getNotaById(id);
        setNota(n);
    }, [id]);

    React.useEffect(() => { carregar(); }, [carregar]);

    const excluir = () => {
        Alert.alert(
            'Excluir nota',
            `Deseja excluir a nota de "${nota?.emitente}"? Esta ação não pode ser desfeita.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir', style: 'destructive',
                    onPress: async () => { await deleteNota(id); navigation.goBack(); },
                },
            ]
        );
    };

    const compartilhar = async () => {
        if (!nota) return;
        const info = getCategoriaInfo(nota.categoria);
        const valorDeducivel = nota.deducivel
            ? (nota.valor_total * nota.percentual_deducao / 100)
            : 0;
        const msg = `📄 Nota Fiscal - ${nota.emitente}
📁 Categoria: ${info.label}
📅 Data: ${formatDate(nota.data_emissao)}
💰 Valor: ${formatCurrency(nota.valor_total)}
${nota.deducivel ? `✅ Dedutível no IR: ${formatCurrency(valorDeducivel)} (${nota.percentual_deducao}%)` : ''}
${nota.numero ? `Nº: ${nota.numero}` : ''}
${nota.descricao ? `\nDescrição: ${nota.descricao}` : ''}
${nota.observacoes ? `\nObs: ${nota.observacoes}` : ''}`;
        await Share.share({ message: msg });
    };

    if (!nota) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
                <Text style={{ color: COLORS.textSecondary }}>Carregando...</Text>
            </View>
        );
    }

    const info = getCategoriaInfo(nota.categoria);
    const tipoInfo = TIPOS_NF.find((t) => t.id === nota.tipo);
    const valorDeducivel = nota.deducivel ? (nota.valor_total * nota.percentual_deducao / 100) : 0;
    const isDeducivel = Boolean(nota.deducivel);

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScreenHeader
                title={nota.emitente}
                onBack={() => navigation.goBack()}
                rightContent={
                    <>
                        <TouchableOpacity onPress={compartilhar} className="p-2">
                            <Ionicons name="share-outline" size={22} color={COLORS.textWhite} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={excluir} className="p-2">
                            <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                        </TouchableOpacity>
                    </>
                }
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Card principal */}
                <View
                    className="m-4 rounded-2xl p-5"
                    style={{
                        backgroundColor: COLORS.bgCard,
                        shadowColor: COLORS.shadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 8,
                        elevation: 4,
                    }}>
                    <View className="flex-row items-center mb-4">
                        <CategoryIcon icon={info.icon} color={info.color} size={28} boxSize={52} borderRadius={16} />
                        <View className="flex-1 ml-3.5">
                            <Text className="text-base font-bold" style={{ color: COLORS.text }}>{info.label}</Text>
                            <Text className="text-sm mt-0.5" style={{ color: COLORS.textSecondary }}>
                                {tipoInfo?.label}
                            </Text>
                        </View>
                        {isDeducivel && <IRBadge variant="full" />}
                    </View>

                    <Text className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>
                        {nota.emitente}
                    </Text>
                    {nota.cnpj_cpf && (
                        <Text className="text-sm" style={{ color: COLORS.textSecondary }}>
                            CNPJ/CPF: {nota.cnpj_cpf}
                        </Text>
                    )}

                    <View className="h-px my-4" style={{ backgroundColor: COLORS.border }} />

                    <View className="flex-row justify-between items-end">
                        <View>
                            <Text className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>Valor total</Text>
                            <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.primary }}>
                                {formatCurrency(nota.valor_total)}
                            </Text>
                        </View>
                        {isDeducivel && (
                            <View className="items-end">
                                <Text className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>Dedutível no IR</Text>
                                <Text className="text-xl font-bold" style={{ color: COLORS.accent }}>
                                    {formatCurrency(valorDeducivel)}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                                    {nota.percentual_deducao}% do valor
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Detalhes */}
                <View className="mx-4 mb-4">
                    <Text
                        className="text-sm font-bold tracking-wide mb-2.5"
                        style={{ color: COLORS.textSecondary }}>
                        Detalhes
                    </Text>
                    <View
                        className="rounded-2xl overflow-hidden border"
                        style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                        <DetalheRow icon="calendar-outline" label="Data de emissão" value={formatDate(nota.data_emissao)} />
                        {nota.numero && <DetalheRow icon="barcode-outline" label="Número" value={nota.numero} />}
                        {nota.descricao && <DetalheRow icon="list-outline" label="Descrição" value={nota.descricao} />}
                        {nota.observacoes && <DetalheRow icon="chatbubble-outline" label="Observações" value={nota.observacoes} />}
                    </View>
                </View>

                {/* Foto */}
                {nota.foto_uri && (
                    <View className="mx-4 mb-4">
                        <Text
                            className="text-sm font-bold tracking-wide mb-2.5"
                            style={{ color: COLORS.textSecondary }}>
                            Foto da nota
                        </Text>
                        <TouchableOpacity onPress={() => setFotoZoom(!fotoZoom)} activeOpacity={0.9}>
                            <Image
                                source={{ uri: nota.foto_uri }}
                                style={{
                                    width: '100%',
                                    height: fotoZoom ? 400 : 220,
                                    borderRadius: 16,
                                }}
                                resizeMode={fotoZoom ? 'contain' : 'cover'}
                            />
                            <View
                                className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <Ionicons
                                    name={fotoZoom ? 'contract' : 'expand'}
                                    size={14}
                                    color={COLORS.textWhite}
                                />
                                <Text className="text-white text-xs">
                                    {fotoZoom ? 'Minimizar' : 'Ampliar foto'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}
