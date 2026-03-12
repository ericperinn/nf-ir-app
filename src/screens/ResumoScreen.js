import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Share
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getResumoAnual, getAllNotas } from '../database/db';
import { COLORS, formatCurrency, getCategoriaInfo, ANOS_DISPONIVEIS } from '../utils/constants';

export default function ResumoScreen({ navigation }) {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [resumo, setResumo] = useState(null);
  const [notas, setNotas] = useState([]);
  const anos = ANOS_DISPONIVEIS();

  const carregar = useCallback(async () => {
    const [res, ns] = await Promise.all([
      getResumoAnual(ano),
      getAllNotas({ ano, deducivel: true })
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
      ``,
      `📁 POR CATEGORIA:`,
      ...(resumo?.porCategoria || []).map(c => {
        const info = getCategoriaInfo(c.categoria);
        return `• ${info.label}: ${formatCurrency(c.total)}${c.deducivel > 0 ? ` (${formatCurrency(c.deducivel)} dedutível)` : ''}`;
      }),
      ``,
      `📝 NOTAS DEDUTÍVEIS:`,
      ...notas.map(n => `• ${n.emitente} — ${formatCurrency(n.valor_total)} — ${n.data_emissao?.split('-').reverse().join('/')}`),
    ];
    
    await Share.share({
      message: linhas.join('\n'),
      title: `Resumo IR ${ano}`,
    });
  };

  const cats = resumo?.porCategoria || [];
  const maxVal = cats.reduce((max, c) => Math.max(max, c.total), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Declaração</Text>
          <Text style={styles.headerTitle}>Imposto de Renda</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={exportarResumo}>
          <Ionicons name="share-outline" size={18} color={COLORS.textWhite} />
          <Text style={styles.exportBtnText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Seletor de Ano */}
        <View style={styles.anoRow}>
          {anos.map(a => (
            <TouchableOpacity
              key={a}
              style={[styles.anoBtn, ano === a && styles.anoBtnActive]}
              onPress={() => setAno(a)}
            >
              <Text style={[styles.anoBtnText, ano === a && styles.anoBtnTextActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Destaque Dedução */}
        <View style={styles.deducaoHero}>
          <View style={styles.deducaoHeroInner}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.accent} />
            <Text style={styles.deducaoHeroLabel}>Total dedutível em {ano}</Text>
            <Text style={styles.deducaoHeroValue}>{formatCurrency(resumo?.total_deducivel)}</Text>
            <Text style={styles.deducaoHeroSub}>
              de {formatCurrency(resumo?.total_gasto)} em {resumo?.total_notas || 0} notas
            </Text>
          </View>
        </View>

        {/* Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.summaryValue}>{resumo?.total_notas || 0}</Text>
            <Text style={styles.summaryLabel}>Notas registradas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.accent} />
            <Text style={styles.summaryValue}>{notas.length}</Text>
            <Text style={styles.summaryLabel}>Dedutíveis</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-down-outline" size={20} color={COLORS.warning} />
            <Text style={styles.summaryValue}>{formatCurrency(resumo?.total_gasto)}</Text>
            <Text style={styles.summaryLabel}>Total gasto</Text>
          </View>
        </View>

        {/* Por Categoria */}
        {cats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por categoria</Text>
            {cats.map(cat => {
              const info = getCategoriaInfo(cat.categoria);
              const barWidth = maxVal > 0 ? (cat.total / maxVal) * 100 : 0;
              return (
                <View key={cat.categoria} style={styles.catBlock}>
                  <View style={styles.catBlockHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={[styles.catDot, { backgroundColor: info.color }]} />
                      <Text style={styles.catName}>{info.label}</Text>
                      {cat.deducivel > 0 && (
                        <View style={styles.irMini}>
                          <Text style={styles.irMiniText}>IR</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.catTotal}>{formatCurrency(cat.total)}</Text>
                      {cat.deducivel > 0 && (
                        <Text style={styles.catDeducivel}>↑ {formatCurrency(cat.deducivel)}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: info.color }]} />
                    {cat.deducivel > 0 && maxVal > 0 && (
                      <View style={[
                        styles.barDeducivel,
                        { width: `${(cat.deducivel / maxVal) * 100}%`, backgroundColor: info.color + '60' }
                      ]} />
                    )}
                  </View>
                  <Text style={styles.catCount}>{cat.qtd} nota{cat.qtd !== 1 ? 's' : ''}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Notas Dedutíveis */}
        {notas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas dedutíveis</Text>
            {notas.map(nota => {
              const info = getCategoriaInfo(nota.categoria);
              const valorDed = nota.valor_total * nota.percentual_deducao / 100;
              return (
                <TouchableOpacity
                  key={nota.id}
                  style={styles.notaRow}
                  onPress={() => navigation.navigate('DetalhesNota', { id: nota.id })}
                >
                  <View style={[styles.notaIcon, { backgroundColor: info.color + '20' }]}>
                    <Ionicons name={info.icon} size={16} color={info.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notaEmitente} numberOfLines={1}>{nota.emitente}</Text>
                    <Text style={styles.notaData}>{nota.data_emissao?.split('-').reverse().join('/')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.notaValorDed}>{formatCurrency(valorDed)}</Text>
                    {nota.percentual_deducao < 100 && (
                      <Text style={styles.notaPct}>{nota.percentual_deducao}% de {formatCurrency(nota.valor_total)}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.totalDeducivelRow}>
              <Text style={styles.totalDeducivelLabel}>Total dedutível</Text>
              <Text style={styles.totalDeducivelValue}>{formatCurrency(resumo?.total_deducivel)}</Text>
            </View>
          </View>
        )}

        {/* Estado vazio */}
        {(!resumo || resumo.total_notas === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Nenhum dado em {ano}</Text>
            <Text style={styles.emptyText}>Adicione notas fiscais para gerar seu resumo do IR</Text>
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
    backgroundColor: COLORS.primaryDark,
    paddingTop: 52, paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerSub: { color: COLORS.accentLight, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  headerTitle: { color: COLORS.textWhite, fontSize: 22, fontWeight: '800', marginTop: 2 },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  exportBtnText: { color: COLORS.textWhite, fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  anoRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  anoBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
  },
  anoBtnActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  anoBtnText: { fontWeight: '600', color: COLORS.textSecondary },
  anoBtnTextActive: { color: COLORS.textWhite },
  deducaoHero: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.primary, borderRadius: 20, overflow: 'hidden',
  },
  deducaoHeroInner: { padding: 28, alignItems: 'center' },
  deducaoHeroLabel: { color: COLORS.accentLight, fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: '600' },
  deducaoHeroValue: { color: COLORS.textWhite, fontSize: 36, fontWeight: '800' },
  deducaoHeroSub: { color: COLORS.textWhite + '80', fontSize: 13, marginTop: 6 },
  cardsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  catBlock: {
    backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  irMini: { backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  irMiniText: { color: COLORS.textWhite, fontSize: 10, fontWeight: '700' },
  catTotal: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  catDeducivel: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  barBg: { height: 8, backgroundColor: COLORS.borderLight, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, position: 'absolute', top: 0, left: 0 },
  barDeducivel: { height: 8, borderRadius: 4, position: 'absolute', top: 0, left: 0 },
  catCount: { fontSize: 11, color: COLORS.textLight, marginTop: 6 },
  notaRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    padding: 14, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  notaIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notaEmitente: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  notaData: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notaValorDed: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  notaPct: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  totalDeducivelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, marginTop: 4,
  },
  totalDeducivelLabel: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },
  totalDeducivelValue: { color: COLORS.textWhite, fontSize: 20, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 30 },
});
