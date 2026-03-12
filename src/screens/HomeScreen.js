import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getResumoAnual, getAllNotas } from '../database/db';
import { COLORS, formatCurrency, getCategoriaInfo, ANOS_DISPONIVEIS, CATEGORIAS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [resumo, setResumo] = useState(null);
  const [ultimasNotas, setUltimasNotas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const anos = ANOS_DISPONIVEIS();

  const carregarDados = useCallback(async () => {
    try {
      const [res, notas] = await Promise.all([
        getResumoAnual(ano),
        getAllNotas({ ano })
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Imposto de Renda</Text>
          <Text style={styles.headerTitle}>Notas Fiscais</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NovaNotaStack')}
        >
          <Ionicons name="add" size={26} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Seletor de Ano */}
        <View style={styles.anoContainer}>
          <Text style={styles.anoLabel}>Ano fiscal:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {anos.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.anoBtn, ano === a && styles.anoBtnActive]}
                onPress={() => setAno(a)}
              >
                <Text style={[styles.anoBtnText, ano === a && styles.anoBtnTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cards de Resumo */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardPrimary]}>
            <Ionicons name="receipt-outline" size={22} color={COLORS.accentLight} />
            <Text style={styles.cardValue}>{resumo?.total_notas || 0}</Text>
            <Text style={styles.cardLabel}>Notas salvas</Text>
          </View>
          <View style={[styles.card, styles.cardPrimary]}>
            <Ionicons name="wallet-outline" size={22} color={COLORS.accentLight} />
            <Text style={styles.cardValue} numberOfLines={1}>
              {formatCurrency(resumo?.total_gasto)}
            </Text>
            <Text style={styles.cardLabel}>Total gasto</Text>
          </View>
        </View>

        {/* Card Dedução */}
        <View style={styles.deducaoCard}>
          <View style={styles.deducaoLeft}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.accent} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.deducaoLabel}>Total dedutível no IR</Text>
              <Text style={styles.deducaoValue}>{formatCurrency(resumo?.total_deducivel)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deducaoBtn}
            onPress={() => navigation.navigate('Resumo')}
          >
            <Text style={styles.deducaoBtnText}>Ver detalhes</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Por Categoria */}
        {porCategoria.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por categoria</Text>
            {porCategoria.map(cat => {
              const info = getCategoriaInfo(cat.categoria);
              const pct = resumo?.total_gasto > 0 ? (cat.total / resumo.total_gasto) * 100 : 0;
              return (
                <View key={cat.categoria} style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: info.color + '20' }]}>
                    <Ionicons name={info.icon} size={16} color={info.color} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catHeader}>
                      <Text style={styles.catLabel}>{info.label}</Text>
                      <Text style={styles.catValue}>{formatCurrency(cat.total)}</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: info.color }]} />
                    </View>
                    {cat.deducivel > 0 && (
                      <Text style={styles.catDeducivel}>↑ {formatCurrency(cat.deducivel)} dedutível</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Últimas Notas */}
        {ultimasNotas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Listagem')}>
                <Text style={styles.verTodas}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {ultimasNotas.map(nota => {
              const info = getCategoriaInfo(nota.categoria);
              return (
                <TouchableOpacity
                  key={nota.id}
                  style={styles.notaRow}
                  onPress={() => navigation.navigate('DetalhesNota', { id: nota.id })}
                >
                  <View style={[styles.notaIcon, { backgroundColor: info.color + '20' }]}>
                    <Ionicons name={info.icon} size={18} color={info.color} />
                  </View>
                  <View style={styles.notaInfo}>
                    <Text style={styles.notaEmitente} numberOfLines={1}>{nota.emitente}</Text>
                    <Text style={styles.notaCategoria}>{info.label} · {nota.data_emissao?.split('-').reverse().join('/')}</Text>
                  </View>
                  <View style={styles.notaRight}>
                    <Text style={styles.notaValor}>{formatCurrency(nota.valor_total)}</Text>
                    {nota.deducivel ? (
                      <View style={styles.deducivelBadge}>
                        <Text style={styles.deducivelBadgeText}>IR</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Estado vazio */}
        {(!resumo || resumo.total_notas === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma nota ainda</Text>
            <Text style={styles.emptyText}>Toque no + para adicionar sua primeira nota fiscal</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('NovaNotaStack')}
            >
              <Ionicons name="add" size={18} color={COLORS.textWhite} />
              <Text style={styles.emptyBtnText}>Adicionar nota</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: { color: COLORS.accentLight, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  headerTitle: { color: COLORS.textWhite, fontSize: 24, fontWeight: '700', marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  anoContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  anoLabel: { color: COLORS.textSecondary, fontSize: 13, marginRight: 10 },
  anoBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.bgCard, marginRight: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  anoBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  anoBtnText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  anoBtnTextActive: { color: COLORS.textWhite },
  cardsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 12 },
  card: {
    flex: 1, borderRadius: 16, padding: 16,
    alignItems: 'flex-start', gap: 4,
  },
  cardPrimary: { backgroundColor: COLORS.primary },
  cardValue: { color: COLORS.textWhite, fontSize: 18, fontWeight: '700', marginTop: 4 },
  cardLabel: { color: COLORS.accentLight, fontSize: 12 },
  deducaoCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  deducaoLeft: { flexDirection: 'row', alignItems: 'center' },
  deducaoLabel: { color: COLORS.textSecondary, fontSize: 12 },
  deducaoValue: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  deducaoBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  deducaoBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  verTodas: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '600' },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catInfo: { flex: 1 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  catLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  catValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  progressBg: { height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  catDeducivel: { fontSize: 11, color: COLORS.accent, marginTop: 3, fontWeight: '600' },
  notaRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    padding: 14, borderRadius: 14, marginBottom: 8,
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  notaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notaInfo: { flex: 1 },
  notaEmitente: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  notaCategoria: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notaRight: { alignItems: 'flex-end', gap: 4 },
  notaValor: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  deducivelBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deducivelBadgeText: { color: COLORS.textWhite, fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, marginTop: 20,
  },
  emptyBtnText: { color: COLORS.textWhite, fontWeight: '600' },
});
