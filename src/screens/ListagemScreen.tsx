import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput, StatusBar, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllNotas, deleteNota } from '../database/db';
import { COLORS, formatCurrency, CATEGORIAS, ANOS_DISPONIVEIS } from '../utils/constants';
import type { TabScreenNavigationProp } from '../types/navigation';
import type { NotaFiscal } from '../types';

import ScreenHeader from '../components/common/ScreenHeader';
import EmptyState from '../components/common/EmptyState';
import NotaCard from '../components/nota/NotaCard';

interface Props {
    navigation: TabScreenNavigationProp;
}

export default function ListagemScreen({ navigation }: Props) {
    const [notas, setNotas] = useState<NotaFiscal[]>([]);
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroAno, setFiltroAno] = useState('');
    const [filtroDeducivel, setFiltroDeducivel] = useState<boolean | null>(null);
    const [busca, setBusca] = useState('');
    const [showFiltros, setShowFiltros] = useState(false);
    const anos = ANOS_DISPONIVEIS();

    const carregarNotas = useCallback(async () => {
        const filtros: Record<string, any> = {};
        if (filtroCategoria) filtros.categoria = filtroCategoria;
        if (filtroAno) filtros.ano = parseInt(filtroAno);
        if (filtroDeducivel !== null) filtros.deducivel = filtroDeducivel;
        const result = await getAllNotas(filtros);
        setNotas(result);
    }, [filtroCategoria, filtroAno, filtroDeducivel]);

    useFocusEffect(useCallback(() => { carregarNotas(); }, [carregarNotas]));

    const confirmarDelete = (nota: NotaFiscal) => {
        Alert.alert(
            'Excluir nota',
            `Deseja excluir a nota de "${nota.emitente}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir', style: 'destructive',
                    onPress: async () => { await deleteNota(nota.id); carregarNotas(); },
                },
            ]
        );
    };

    const notasFiltradas = notas.filter((n) => {
        if (!busca) return true;
        const q = busca.toLowerCase();
        return n.emitente?.toLowerCase().includes(q) ||
            n.descricao?.toLowerCase().includes(q) ||
            n.numero?.toLowerCase().includes(q);
    });

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScreenHeader
                title="Notas Fiscais"
                rightContent={
                    <TouchableOpacity
                        onPress={() => setShowFiltros(!showFiltros)}
                        className="p-1.5">
                        <Ionicons
                            name={showFiltros ? 'options' : 'options-outline'}
                            size={22}
                            color={COLORS.textWhite}
                        />
                    </TouchableOpacity>
                }
            />

            {/* Busca */}
            <View
                className="m-3.5 mb-1.5 rounded-xl flex-row items-center px-3.5 py-2.5 border"
                style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                <Ionicons name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                    className="flex-1 text-sm"
                    style={{ color: COLORS.text }}
                    placeholder="Buscar por emitente, descrição..."
                    placeholderTextColor={COLORS.textLight}
                    value={busca}
                    onChangeText={setBusca}
                />
                {busca ? (
                    <TouchableOpacity onPress={() => setBusca('')}>
                        <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Painel de filtros */}
            {showFiltros && (
                <View
                    className="mx-3.5 rounded-xl p-3.5 mb-1.5 border"
                    style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                    {/* Ano */}
                    <Text className="text-xs font-bold tracking-widest mb-2" style={{ color: COLORS.textSecondary }}>
                        ANO
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                        <FilterChip label="Todos" active={!filtroAno} onPress={() => setFiltroAno('')} />
                        {anos.map((a) => (
                            <FilterChip
                                key={a}
                                label={String(a)}
                                active={filtroAno === String(a)}
                                onPress={() => setFiltroAno(filtroAno === String(a) ? '' : String(a))}
                            />
                        ))}
                    </View>

                    {/* Categoria */}
                    <Text className="text-xs font-bold tracking-widest mb-2" style={{ color: COLORS.textSecondary }}>
                        CATEGORIA
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                        <FilterChip label="Todas" active={!filtroCategoria} onPress={() => setFiltroCategoria('')} />
                        {CATEGORIAS.map((c) => (
                            <FilterChip
                                key={c.id}
                                label={c.label}
                                active={filtroCategoria === c.id}
                                onPress={() => setFiltroCategoria(filtroCategoria === c.id ? '' : c.id)}
                            />
                        ))}
                    </View>

                    {/* IR */}
                    <Text className="text-xs font-bold tracking-widest mb-2" style={{ color: COLORS.textSecondary }}>
                        IR
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                        <FilterChip label="Todas" active={filtroDeducivel === null} onPress={() => setFiltroDeducivel(null)} />
                        <FilterChip
                            label="Dedutíveis"
                            active={filtroDeducivel === true}
                            onPress={() => setFiltroDeducivel(filtroDeducivel === true ? null : true)}
                        />
                        <FilterChip
                            label="Não dedutíveis"
                            active={filtroDeducivel === false}
                            onPress={() => setFiltroDeducivel(filtroDeducivel === false ? null : false)}
                        />
                    </View>
                </View>
            )}

            {/* Contador */}
            <View className="flex-row justify-between px-4 py-1.5">
                <Text className="text-xs" style={{ color: COLORS.textSecondary }}>
                    {notasFiltradas.length} nota{notasFiltradas.length !== 1 ? 's' : ''}
                </Text>
                <Text className="text-xs font-bold" style={{ color: COLORS.primary }}>
                    Total: {formatCurrency(notasFiltradas.reduce((sum, n) => sum + n.valor_total, 0))}
                </Text>
            </View>

            <FlatList
                data={notasFiltradas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotaCard
                        nota={item}
                        onPress={() => navigation.navigate('DetalhesNota', { id: item.id })}
                        onLongPress={() => confirmarDelete(item)}
                    />
                )}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="receipt-outline"
                        title="Nenhuma nota encontrada"
                        text="Tente ajustar os filtros ou adicione uma nova nota"
                    />
                }
            />
        </View>
    );
}

// Componente local de chip de filtro
function FilterChip({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="px-3 py-1 rounded-full border"
            style={{
                backgroundColor: active ? COLORS.primary : COLORS.bg,
                borderColor: active ? COLORS.primary : COLORS.border,
            }}>
            <Text
                className="text-xs font-medium"
                style={{ color: active ? COLORS.textWhite : COLORS.textSecondary }}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
