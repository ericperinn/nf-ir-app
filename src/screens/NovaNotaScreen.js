import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Image, Platform, StatusBar, Switch,
  KeyboardAvoidingView, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { insertNota } from '../database/db';
import { COLORS, CATEGORIAS, TIPOS_NF, getCategoriaInfo } from '../utils/constants';
import useNFAnalysis from '../hooks/useNFAnalysis';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function NovaNotaScreen({ navigation }) {
  const [form, setForm] = useState({
    tipo: 'nfe',
    numero: '',
    emitente: '',
    cnpj_cpf: '',
    data_emissao: new Date().toISOString().split('T')[0],
    valor_total: '',
    categoria: 'saude',
    descricao: '',
    foto_uri: null,
    foto_base64: null,
    deducivel: false,
    percentual_deducao: '100',
    observacoes: '',
  });
  const [saving, setSaving] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);

  const { analyzing, error: aiError, fieldsFromAI, analyzeImage, clearResult } = useNFAnalysis();

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const categoriaInfo = getCategoriaInfo(form.categoria);
  const tipoInfo = TIPOS_NF.find(t => t.id === form.tipo);

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua câmera para fotografar a nota.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      update('foto_uri', asset.uri);
      update('foto_base64', asset.base64 || null);
    }
  };

  const escolherGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      update('foto_uri', asset.uri);
      update('foto_base64', asset.base64 || null);
    }
  };

  const fotoOptions = () => {
    Alert.alert('Foto da nota', 'Como deseja adicionar?', [
      { text: 'Tirar foto', onPress: tirarFoto },
      { text: 'Galeria', onPress: escolherGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const analisarComIA = async () => {
    if (!form.foto_uri) {
      Alert.alert('Sem foto', 'Adicione uma foto da nota fiscal primeiro.');
      return;
    }

    const dados = await analyzeImage(form.foto_uri, form.foto_base64);
    if (dados) {
      setForm(prev => ({
        ...prev,
        emitente: dados.emitente || prev.emitente,
        cnpj_cpf: dados.cnpj_cpf || prev.cnpj_cpf,
        numero: dados.numero || prev.numero,
        data_emissao: dados.data_emissao || prev.data_emissao,
        valor_total: dados.valor_total ? String(dados.valor_total).replace('.', ',') : prev.valor_total,
        tipo: dados.tipo || prev.tipo,
        categoria: dados.categoria || prev.categoria,
        descricao: dados.descricao || prev.descricao,
        deducivel: dados.deducivel != null ? dados.deducivel : prev.deducivel,
      }));
      Alert.alert(
        '✨ Análise concluída',
        'Os campos foram preenchidos automaticamente. Confira os dados e ajuste se necessário.'
      );
    }
  };

  /** Verifica se um campo foi preenchido pela IA */
  const isAIField = (fieldName) => fieldsFromAI.has(fieldName);

  const formatDateInput = (text) => {
    const nums = text.replace(/\D/g, '');
    let formatted = nums;
    if (nums.length > 2) formatted = nums.slice(0, 2) + '/' + nums.slice(2);
    if (nums.length > 4) formatted = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4, 8);
    return formatted;
  };

  const parseDateToISO = (str) => {
    const parts = str.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return str;
  };

  const salvar = async () => {
    if (!form.emitente.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do emitente.'); return;
    }
    if (!form.valor_total || isNaN(parseFloat(form.valor_total.replace(',', '.')))) {
      Alert.alert('Campo obrigatório', 'Informe o valor total válido.'); return;
    }
    
    setSaving(true);
    try {
      const nota = {
        id: uuidv4(),
        tipo: form.tipo,
        numero: form.numero,
        emitente: form.emitente.trim(),
        cnpj_cpf: form.cnpj_cpf,
        data_emissao: form.data_emissao,
        valor_total: parseFloat(form.valor_total.replace(',', '.')),
        categoria: form.categoria,
        descricao: form.descricao,
        foto_uri: form.foto_uri,
        deducivel: form.deducivel,
        percentual_deducao: parseFloat(form.percentual_deducao) || 100,
        observacoes: form.observacoes,
      };
      await insertNota(nota);
      Alert.alert('✅ Nota salva!', 'A nota fiscal foi registrada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Nota Fiscal</Text>
        <TouchableOpacity onPress={salvar} style={[styles.saveBtn, saving && { opacity: 0.6 }]} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Foto */}
          <View style={styles.fotoSection}>
            {form.foto_uri ? (
              <View>
                <View style={styles.fotoPreview}>
                  <Image source={{ uri: form.foto_uri }} style={styles.fotoImg} resizeMode="cover" />
                  <View style={styles.fotoOverlay}>
                    <TouchableOpacity style={styles.fotoOverlayBtn} onPress={fotoOptions}>
                      <Ionicons name="camera" size={18} color={COLORS.textWhite} />
                      <Text style={styles.fotoOverlayText}>Trocar foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.fotoOverlayBtn, { backgroundColor: COLORS.danger + 'CC' }]} onPress={() => { update('foto_uri', null); update('foto_base64', null); clearResult(); }}>
                      <Ionicons name="trash" size={18} color={COLORS.textWhite} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Botão Analisar com IA */}
                <TouchableOpacity
                  style={[styles.aiBtn, analyzing && { opacity: 0.7 }]}
                  onPress={analisarComIA}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <ActivityIndicator size="small" color={COLORS.textWhite} />
                      <Text style={styles.aiBtnText}>Analisando com IA...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color={COLORS.textWhite} />
                      <Text style={styles.aiBtnText}>Analisar com IA</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Erro da IA */}
                {aiError && (
                  <View style={styles.aiErrorBox}>
                    <Ionicons name="warning-outline" size={16} color={COLORS.danger} />
                    <Text style={styles.aiErrorText}>{aiError}</Text>
                  </View>
                )}

                {/* Indicador de campos preenchidos pela IA */}
                {fieldsFromAI.size > 0 && (
                  <View style={styles.aiSuccessBox}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                    <Text style={styles.aiSuccessText}>
                      {fieldsFromAI.size} campo(s) preenchido(s) pela IA
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.fotoPlaceholder} onPress={fotoOptions}>
                <Ionicons name="camera-outline" size={36} color={COLORS.primaryLight} />
                <Text style={styles.fotoPlaceholderText}>Fotografar nota fiscal</Text>
                <Text style={styles.fotoPlaceholderSub}>Toque para adicionar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formContainer}>

            {/* Categoria */}
            <Text style={styles.groupLabel}>IDENTIFICAÇÃO</Text>
            
            <Text style={styles.label}>Categoria *</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowCatModal(true)}>
              <View style={[styles.selectorIcon, { backgroundColor: categoriaInfo.color + '20' }]}>
                <Ionicons name={categoriaInfo.icon} size={18} color={categoriaInfo.color} />
              </View>
              <Text style={styles.selectorText}>{categoriaInfo.label}</Text>
              {categoriaInfo.deducivel && (
                <View style={styles.deducivelTag}>
                  <Text style={styles.deducivelTagText}>Dedutível</Text>
                </View>
              )}
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Tipo */}
            <Text style={styles.label}>Tipo de documento *</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowTipoModal(true)}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} style={{ marginRight: 10 }} />
              <Text style={styles.selectorText}>{tipoInfo?.label}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Emitente */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>Emitente (empresa/prestador) *</Text>
              {isAIField('emitente') && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color={COLORS.textWhite} /><Text style={styles.aiTagText}>IA</Text></View>}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ex: Hospital São Lucas, Colégio Rio Verde..."
              placeholderTextColor={COLORS.textLight}
              value={form.emitente}
              onChangeText={v => update('emitente', v)}
              autoCapitalize="words"
            />

            {/* CNPJ/CPF */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>CNPJ / CPF do emitente</Text>
              {isAIField('cnpj_cpf') && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color={COLORS.textWhite} /><Text style={styles.aiTagText}>IA</Text></View>}
            </View>
            <TextInput
              style={styles.input}
              placeholder="00.000.000/0001-00"
              placeholderTextColor={COLORS.textLight}
              value={form.cnpj_cpf}
              onChangeText={v => update('cnpj_cpf', v)}
              keyboardType="numeric"
            />

            {/* Número da NF */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>Número da nota</Text>
              {isAIField('numero') && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color={COLORS.textWhite} /><Text style={styles.aiTagText}>IA</Text></View>}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ex: 123456"
              placeholderTextColor={COLORS.textLight}
              value={form.numero}
              onChangeText={v => update('numero', v)}
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Data de emissão *</Text>
                  {isAIField('data_emissao') && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color={COLORS.textWhite} /><Text style={styles.aiTagText}>IA</Text></View>}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={COLORS.textLight}
                  value={form.data_emissao.split('-').reverse().join('/')}
                  onChangeText={v => {
                    const formatted = formatDateInput(v);
                    if (formatted.replace(/\D/g, '').length === 8) {
                      update('data_emissao', parseDateToISO(formatted));
                    } else {
                      update('data_emissao', formatted);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Valor total (R$) *</Text>
                  {isAIField('valor_total') && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color={COLORS.textWhite} /><Text style={styles.aiTagText}>IA</Text></View>}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  placeholderTextColor={COLORS.textLight}
                  value={form.valor_total}
                  onChangeText={v => update('valor_total', v.replace(/[^0-9,.]/g, ''))}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Descrição */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>Descrição dos serviços/produtos</Text>
              {isAIField('descricao') && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color={COLORS.textWhite} /><Text style={styles.aiTagText}>IA</Text></View>}
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Consulta médica, Material escolar, Mensalidade..."
              placeholderTextColor={COLORS.textLight}
              value={form.descricao}
              onChangeText={v => update('descricao', v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* IR */}
            <Text style={styles.groupLabel}>IMPOSTO DE RENDA</Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Despesa dedutível no IR?</Text>
                <Text style={styles.switchSub}>
                  {form.deducivel ? '✅ Será incluída no cálculo de deduções' : 'Não será considerada na declaração'}
                </Text>
              </View>
              <Switch
                value={form.deducivel}
                onValueChange={v => {
                  update('deducivel', v);
                  if (v && getCategoriaInfo(form.categoria).deducivel) update('percentual_deducao', '100');
                }}
                trackColor={{ false: COLORS.border, true: COLORS.accent + '80' }}
                thumbColor={form.deducivel ? COLORS.accent : COLORS.textLight}
              />
            </View>

            {form.deducivel && (
              <>
                <Text style={styles.label}>% dedutível do valor</Text>
                <View style={styles.pctRow}>
                  {['25', '50', '75', '100'].map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pctBtn, form.percentual_deducao === p && styles.pctBtnActive]}
                      onPress={() => update('percentual_deducao', p)}
                    >
                      <Text style={[styles.pctText, form.percentual_deducao === p && styles.pctTextActive]}>{p}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Observações */}
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Informações adicionais..."
              placeholderTextColor={COLORS.textLight}
              value={form.observacoes}
              onChangeText={v => update('observacoes', v)}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.btnSalvar, saving && { opacity: 0.6 }]}
              onPress={salvar}
              disabled={saving}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.textWhite} />
              <Text style={styles.btnSalvarText}>{saving ? 'Salvando...' : 'Salvar nota fiscal'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Categoria */}
      <Modal visible={showCatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar categoria</Text>
              <TouchableOpacity onPress={() => setShowCatModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIAS}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, form.categoria === item.id && styles.modalItemActive]}
                  onPress={() => {
                    update('categoria', item.id);
                    if (item.deducivel) update('deducivel', true);
                    setShowCatModal(false);
                  }}
                >
                  <View style={[styles.modalItemIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                  {item.deducivel && <View style={styles.deducivelTag}><Text style={styles.deducivelTagText}>IR</Text></View>}
                  {form.categoria === item.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Tipo */}
      <Modal visible={showTipoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de documento</Text>
              <TouchableOpacity onPress={() => setShowTipoModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {TIPOS_NF.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.modalItem, form.tipo === t.id && styles.modalItemActive]}
                onPress={() => { update('tipo', t.id); setShowTipoModal(false); }}
              >
                <Ionicons name="document-text-outline" size={18} color={COLORS.primary} style={{ marginRight: 12 }} />
                <Text style={styles.modalItemText}>{t.label}</Text>
                {form.tipo === t.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52, paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, color: COLORS.textWhite, fontSize: 18, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: COLORS.textWhite, fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1 },
  fotoSection: { margin: 20, marginBottom: 0 },
  fotoPlaceholder: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 28,
    alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.primaryLight + '60',
  },
  fotoPlaceholderText: { fontSize: 15, fontWeight: '600', color: COLORS.primary, marginTop: 10 },
  fotoPlaceholderSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  fotoPreview: { borderRadius: 16, overflow: 'hidden', height: 200 },
  fotoImg: { width: '100%', height: '100%' },
  fotoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 10, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  fotoOverlayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary + 'CC', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
  },
  fotoOverlayText: { color: COLORS.textWhite, fontSize: 13, fontWeight: '600' },
  aiBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12, padding: 14, marginTop: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  aiBtnText: { color: COLORS.textWhite, fontSize: 15, fontWeight: '700' },
  aiErrorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.danger + '15', borderRadius: 10,
    padding: 12, marginTop: 8,
  },
  aiErrorText: { color: COLORS.danger, fontSize: 13, flex: 1 },
  aiSuccessBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.accent + '15', borderRadius: 10,
    padding: 12, marginTop: 8,
  },
  aiSuccessText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  aiTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#7C3AED', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  aiTagText: { color: COLORS.textWhite, fontSize: 10, fontWeight: '700' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 6 },
  formContainer: { padding: 20 },
  groupLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 1.5, marginBottom: 12, marginTop: 8,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textArea: { height: 80, paddingTop: 12 },
  selector: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  selectorIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  selectorText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  deducivelTag: { backgroundColor: COLORS.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  deducivelTagText: { color: COLORS.textWhite, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 0 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 12,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  switchSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  pctRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pctBtn: {
    flex: 1, padding: 10, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.bgCard,
  },
  pctBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  pctText: { fontWeight: '600', color: COLORS.textSecondary },
  pctTextActive: { color: COLORS.textWhite },
  btnSalvar: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 24,
  },
  btnSalvarText: { color: COLORS.textWhite, fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '75%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  modalItemActive: { backgroundColor: COLORS.primary + '10', borderRadius: 10, paddingHorizontal: 10 },
  modalItemIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modalItemText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
});
