import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, Alert, Share, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotaById, deleteNota } from '../database/db';
import { COLORS, formatCurrency, formatDate, getCategoriaInfo, TIPOS_NF } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function DetalhesNotaScreen({ navigation, route }) {
  const { id } = route.params;
  const [nota, setNota] = useState(null);
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
          onPress: async () => {
            await deleteNota(id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const compartilhar = async () => {
    if (!nota) return;
    const info = getCategoriaInfo(nota.categoria);
    const msg = `📄 Nota Fiscal - ${nota.emitente}
📁 Categoria: ${info.label}
📅 Data: ${formatDate(nota.data_emissao)}
💰 Valor: ${formatCurrency(nota.valor_total)}
${nota.deducivel ? `✅ Dedutível no IR: ${formatCurrency(nota.valor_total * nota.percentual_deducao / 100)} (${nota.percentual_deducao}%)` : ''}
${nota.numero ? `Nº: ${nota.numero}` : ''}
${nota.descricao ? `\nDescrição: ${nota.descricao}` : ''}
${nota.observacoes ? `\nObs: ${nota.observacoes}` : ''}`;
    
    await Share.share({ message: msg });
  };

  if (!nota) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: COLORS.textSecondary }}>Carregando...</Text>
      </View>
    );
  }

  const info = getCategoriaInfo(nota.categoria);
  const tipoInfo = TIPOS_NF.find(t => t.id === nota.tipo);
  const valorDeducivel = nota.deducivel ? (nota.valor_total * nota.percentual_deducao / 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{nota.emitente}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity style={styles.headerBtn} onPress={compartilhar}>
            <Ionicons name="share-outline" size={22} color={COLORS.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('EditarNota', { id })}>
            <Ionicons name="pencil-outline" size={22} color={COLORS.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={excluir}>
            <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card principal */}
        <View style={styles.mainCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={[styles.catIconLarge, { backgroundColor: info.color + '20' }]}>
              <Ionicons name={info.icon} size={28} color={info.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.catLabel}>{info.label}</Text>
              <Text style={styles.tipoLabel}>{tipoInfo?.label}</Text>
            </View>
            {nota.deducivel && (
              <View style={styles.irBadgeLarge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.textWhite} />
                <Text style={styles.irBadgeText}>Dedutível</Text>
              </View>
            )}
          </View>

          <Text style={styles.emitente}>{nota.emitente}</Text>
          {nota.cnpj_cpf && <Text style={styles.cnpj}>CNPJ/CPF: {nota.cnpj_cpf}</Text>}

          <View style={styles.divider} />

          <View style={styles.valorRow}>
            <View>
              <Text style={styles.valorLabel}>Valor total</Text>
              <Text style={styles.valorTotal}>{formatCurrency(nota.valor_total)}</Text>
            </View>
            {nota.deducivel && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.valorLabel}>Dedutível no IR</Text>
                <Text style={styles.valorDeducivel}>{formatCurrency(valorDeducivel)}</Text>
                <Text style={styles.percentLabel}>{nota.percentual_deducao}% do valor</Text>
              </View>
            )}
          </View>
        </View>

        {/* Detalhes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>

          <View style={styles.detalheCard}>
            <DetalheRow icon="calendar-outline" label="Data de emissão" value={formatDate(nota.data_emissao)} />
            {nota.numero && <DetalheRow icon="barcode-outline" label="Número" value={nota.numero} />}
            {nota.descricao && <DetalheRow icon="list-outline" label="Descrição" value={nota.descricao} />}
            {nota.observacoes && <DetalheRow icon="chatbubble-outline" label="Observações" value={nota.observacoes} />}
          </View>
        </View>

        {/* Foto */}
        {nota.foto_uri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto da nota</Text>
            <TouchableOpacity onPress={() => setFotoZoom(!fotoZoom)} activeOpacity={0.9}>
              <Image
                source={{ uri: nota.foto_uri }}
                style={[styles.foto, fotoZoom && styles.fotoZoom]}
                resizeMode={fotoZoom ? 'contain' : 'cover'}
              />
              <View style={styles.fotoHint}>
                <Ionicons name={fotoZoom ? "contract" : "expand"} size={14} color={COLORS.textWhite} />
                <Text style={styles.fotoHintText}>{fotoZoom ? 'Minimizar' : 'Ampliar foto'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function DetalheRow({ icon, label, value }) {
  return (
    <View style={styles.detalheRow}>
      <View style={styles.detalheIcon}>
        <Ionicons name={icon} size={16} color={COLORS.primaryLight} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detalheLabel}>{label}</Text>
        <Text style={styles.detalheValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52, paddingBottom: 14,
    paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  headerBtn: { padding: 8 },
  headerTitle: { flex: 1, color: COLORS.textWhite, fontSize: 17, fontWeight: '700', marginHorizontal: 4 },
  scroll: { flex: 1 },
  mainCard: {
    backgroundColor: COLORS.bgCard, margin: 16, borderRadius: 20, padding: 20,
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 4,
  },
  catIconLarge: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  catLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  tipoLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  irBadgeLarge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  irBadgeText: { color: COLORS.textWhite, fontSize: 12, fontWeight: '700' },
  emitente: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cnpj: { fontSize: 13, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  valorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  valorLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  valorTotal: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  valorDeducivel: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  percentLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 10 },
  detalheCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  detalheRow: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  detalheIcon: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.primary + '10',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  detalheLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  detalheValue: { fontSize: 14, color: COLORS.text, marginTop: 2, fontWeight: '500' },
  foto: { width: '100%', height: 220, borderRadius: 16 },
  fotoZoom: { height: 400 },
  fotoHint: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  fotoHintText: { color: COLORS.textWhite, fontSize: 12 },
});
