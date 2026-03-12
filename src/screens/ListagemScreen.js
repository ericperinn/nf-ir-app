
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllNotas, deleteNota } from '../database/db';
import { COLORS, formatCurrency, getCategoriaInfo, CATEGORIAS, ANOS_DISPONIVEIS } from '../utils/constants';

export default function ListagemScreen({ navigation }) {
  const [notas, setNotas] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroDeducivel, setFiltroDeducivel] = useState(null);
  const [busca, setBusca] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  const carregarNotas = useCallback(async () => {
    const filtros = {};
    if (filtroCategoria) filtros.categoria = filtroCategoria;
    if (filtroAno) filtros.ano = parseInt(filtroAno);
    if (filtroDeducivel !== null) filtros.deducivel = filtroDeducivel;
    const result = await getAllNotas(filtros);
    setNotas(result);
  }, [filtroCategoria, filtroAno, filtroDeducivel]);

  useFocusEffect(useCallback(() => { carregarNotas(); }, [carregarNotas]));

  const confirmarDelete = (nota) => {
    Alert.alert(
      'Excluir nota',
      `Deseja excluir a nota de "${nota.emitente}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            await deleteNota(nota.id);
            carregarNotas();
          }
        }
      ]
    );
  };

  const notasFiltradas = notas.filter(n => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return n.emitente?.toLowerCase().includes(q) ||
      n.descricao?.toLowerCase().includes(q) ||
      n.numero?.toLowerCase().includes(q);
  });

  const anos = ANOS_DISPONIVEIS();

  const renderNota = ({ item }) => {
    const info = getCategoriaInfo(item.categoria);
    return (
      <TouchableOpacity
        style={styles.notaCard}
        onPress={() => navigation.navigate('DetalhesNota', { id: item.id })}
        onLongPress={() => confirmarDelete(item)}
      >
        <View style={[styles.notaIconBox, { backgroundColor: info.color + '20' }]}>
          <Ionicons name={info.icon} size={22} color={info.color} />
        </View>
        <View style={styles.notaContent}>
          <View style={styles.notaTop}>
            <Text style={styles.notaEmitente} numberOfLines={1}>{item.emitente}</Text>
            <Text style={styles.notaValor}>{formatCurrency(item.valor_total)}</Text>
          </View>
          <View style={styles.notaBottom}>
            <Text style={styles.notaMeta}>{info.label}</Text>
            <Text style={styles.notaDot}>·</Text>
            <Text style={styles.notaMeta}>{item.data_emissao?.split('-').reverse().join('/')}</Text>
            {item.numero ? <><Text style={styles.notaDot}>·</Text><Text style={styles.notaMeta}>Nº {item.numero}</Text></> : null}
          </View>
          {item.descricao ? <Text style={styles.notaDescricao} numberOfLines={1}>{item.descricao}</Text> : null}
        </View>
        <View style={styles.notaActions}>
          {item.deducivel ? (
            <View style={styles.irBadge}><Text style={styles.irBadgeText}>IR</Text></View>
          ) : null}
          {item.foto_uri ? (
            <Ionicons name="image-outline" size={16} color={COLORS.textLight} />
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notas Fiscais</Text>
        <TouchableOpacity onPress={() => setShowFiltros(!showFiltros)} style={styles.filterBtn}>
          <Ionicons name={showFiltros ? "options" : "options-outline"} size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
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

      {/* Filtros */}
      {showFiltros && (
        <View style={styles.filtrosBox}>
          <Text style={styles.filtroGroupLabel}>Ano</Text>
          <View style={styles.filtroRow}>
            <TouchableOpacity
              style={[styles.filtroChip, !filtroAno && styles.filtroChipActive]}
              onPress={() => setFiltroAno('')}
            >
              <Text style={[styles.filtroChipText, !filtroAno && styles.filtroChipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {anos.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.filtroChip, filtroAno === String(a) && styles.filtroChipActive]}
                onPress={() => setFiltroAno(filtroAno === String(a) ? '' : String(a))}
              >
                <Text style={[styles.filtroChipText, filtroAno === String(a) && styles.filtroChipTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.filtroGroupLabel}>Categoria</Text>
          <View style={styles.filtroRow}>
            <TouchableOpacity
              style={[styles.filtroChip, !filtroCategoria && styles.filtroChipActive]}
              onPress={() => setFiltroCategoria('')}
            >
              <Text style={[styles.filtroChipText, !filtroCategoria && styles.filtroChipTextActive]}>Todas</Text>
            </TouchableOpacity>
            {CATEGORIAS.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.filtroChip, filtroCategoria === c.id && styles.filtroChipActive]}
                onPress={() => setFiltroCategoria(filtroCategoria === c.id ? '' : c.id)}
              >
                <Text style={[styles.filtroChipText, filtroCategoria === c.id && styles.filtroChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filtroGroupLabel}>IR</Text>
          <View style={styles.filtroRow}>
            <TouchableOpacity
              style={[styles.filtroChip, filtroDeducivel === null && styles.filtroChipActive]}
              onPress={() => setFiltroDeducivel(null)}
            >
              <Text style={[styles.filtroChipText, filtroDeducivel === null && styles.filtroChipTextActive]}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroChip, filtroDeducivel === true && styles.filtroChipActive]}
              onPress={() => setFiltroDeducivel(filtroDeducivel === true ? null : true)}
            >
              <Text style={[styles.filtroChipText, filtroDeducivel === true && styles.filtroChipTextActive]}>Dedutíveis</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroChip, filtroDeducivel === false && styles.filtroChipActive]}
              onPress={() => setFiltroDeducivel(filtroDeducivel === false ? null : false)}
            >
              <Text style={[styles.filtroChipText, filtroDeducivel === false && styles.filtroChipTextActive]}>Não dedutíveis</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contador */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>{notasFiltradas.length} nota{notasFiltradas.length !== 1 ? 's' : ''}</Text>
        <Text style={styles.totalText}>
          Total: {formatCurrency(notasFiltradas.reduce((sum, n) => sum + n.valor_total, 0))}
        </Text>
      </View>

      <FlatList
        data={notasFiltradas}
        keyExtractor={item => item.id}
        renderItem={renderNota}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={52} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Nenhuma nota encontrada</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52, paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: COLORS.textWhite, fontSize: 20, fontWeight: '700' },
  filterBtn: { padding: 6 },
  searchContainer: {
    margin: 14, marginBottom: 6,
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filtrosBox: {
    backgroundColor: COLORS.bgCard, marginHorizontal: 14, borderRadius: 12,
    padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  filtroGroupLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8 },
  filtroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  filtroChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  filtroChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filtroChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  filtroChipTextActive: { color: COLORS.textWhite },
  counterRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 6,
  },
  counterText: { fontSize: 12, color: COLORS.textSecondary },
  totalText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  notaCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  notaIconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notaContent: { flex: 1 },
  notaTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notaEmitente: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, marginRight: 8 },
  notaValor: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  notaBottom: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  notaMeta: { fontSize: 12, color: COLORS.textSecondary },
  notaDot: { fontSize: 12, color: COLORS.textLight, marginHorizontal: 4 },
  notaDescricao: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  notaActions: { alignItems: 'center', gap: 6, marginLeft: 8 },
  irBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  irBadgeText: { color: COLORS.textWhite, fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 12 },
});
