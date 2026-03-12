import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Alert, Platform, StatusBar, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { insertNota } from '../database/db';
import { COLORS, CATEGORIAS, TIPOS_NF, getCategoriaInfo } from '../utils/constants';
import useNFAnalysis from '../hooks/useNFAnalysis';
import type { NFFormData } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import ScreenHeader from '../components/common/ScreenHeader';
import FotoSection from '../components/nova-nota/FotoSection';
import LabeledInput from '../components/nova-nota/LabeledInput';
import IRSection from '../components/nova-nota/IRSection';
import SelectModal from '../components/common/SelectModal';

interface Props {
    navigation: NativeStackNavigationProp<RootStackParamList>;
}

const FORM_INICIAL: NFFormData = {
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
};

export default function NovaNotaScreen({ navigation }: Props) {
    const [form, setForm] = useState<NFFormData>(FORM_INICIAL);
    const [saving, setSaving] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showTipoModal, setShowTipoModal] = useState(false);

    const { analyzing, error: aiError, fieldsFromAI, analyzeImage, clearResult } = useNFAnalysis();

    const update = <K extends keyof NFFormData>(key: K, val: NFFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    const categoriaInfo = getCategoriaInfo(form.categoria);
    const tipoInfo = TIPOS_NF.find((t) => t.id === form.tipo);
    const isAIField = (fieldName: string) => fieldsFromAI.has(fieldName);

    // --- Foto ---
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
        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            update('foto_uri', asset.uri);
            update('foto_base64', asset.base64 ?? null);
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
        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            update('foto_uri', asset.uri);
            update('foto_base64', asset.base64 ?? null);
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
            setForm((prev) => ({
                ...prev,
                emitente: dados.emitente || prev.emitente,
                cnpj_cpf: dados.cnpj_cpf || prev.cnpj_cpf,
                numero: dados.numero || prev.numero,
                data_emissao: dados.data_emissao || prev.data_emissao,
                valor_total: dados.valor_total
                    ? String(dados.valor_total).replace('.', ',')
                    : prev.valor_total,
                tipo: dados.tipo || prev.tipo,
                categoria: dados.categoria || prev.categoria,
                descricao: dados.descricao || prev.descricao,
                deducivel: dados.deducivel != null ? dados.deducivel : prev.deducivel,
            }));
            Alert.alert('✨ Análise concluída', 'Os campos foram preenchidos automaticamente. Confira e ajuste se necessário.');
        }
    };

    // --- Data ---
    const formatDateInput = (text: string): string => {
        const nums = text.replace(/\D/g, '');
        let formatted = nums;
        if (nums.length > 2) formatted = nums.slice(0, 2) + '/' + nums.slice(2);
        if (nums.length > 4) formatted = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4, 8);
        return formatted;
    };

    const parseDateToISO = (str: string): string => {
        const parts = str.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return str;
    };

    // --- Salvar ---
    const salvar = async () => {
        if (!form.emitente.trim()) {
            Alert.alert('Campo obrigatório', 'Informe o nome do emitente.'); return;
        }
        if (!form.valor_total || isNaN(parseFloat(form.valor_total.replace(',', '.')))) {
            Alert.alert('Campo obrigatório', 'Informe o valor total válido.'); return;
        }

        setSaving(true);
        try {
            await insertNota({
                id: uuidv4(),
                tipo: form.tipo,
                numero: form.numero || null,
                emitente: form.emitente.trim(),
                cnpj_cpf: form.cnpj_cpf || null,
                data_emissao: form.data_emissao,
                valor_total: parseFloat(form.valor_total.replace(',', '.')),
                categoria: form.categoria,
                descricao: form.descricao || null,
                foto_uri: form.foto_uri,
                deducivel: form.deducivel,
                percentual_deducao: parseFloat(form.percentual_deducao) || 100,
                observacoes: form.observacoes || null,
            });
            Alert.alert('✅ Nota salva!', 'A nota fiscal foi registrada com sucesso.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    // Opções para modais
    const catOptions = CATEGORIAS.map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.icon,
        iconColor: c.color,
        badge: c.deducivel ? 'IR' : undefined,
    }));

    const tipoOptions = TIPOS_NF.map((t) => ({
        id: t.id,
        label: t.label,
        icon: 'document-text-outline',
    }));

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScreenHeader
                title="Nova Nota Fiscal"
                onBack={() => navigation.goBack()}
                rightContent={
                    <TouchableOpacity
                        onPress={salvar}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl"
                        style={{ backgroundColor: COLORS.accent, opacity: saving ? 0.6 : 1 }}>
                        <Text className="text-white font-bold text-sm">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </Text>
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                    {/* Foto */}
                    <FotoSection
                        fotoUri={form.foto_uri}
                        analyzing={analyzing}
                        aiError={aiError}
                        aiFieldsCount={fieldsFromAI.size}
                        onFotoOptions={fotoOptions}
                        onRemoveFoto={() => { update('foto_uri', null); update('foto_base64', null); clearResult(); }}
                        onAnalisarIA={analisarComIA}
                    />

                    <View className="p-5">
                        {/* Identificação */}
                        <Text
                            className="text-xs font-bold tracking-widest mb-3 mt-2"
                            style={{ color: COLORS.textSecondary }}>
                            IDENTIFICAÇÃO
                        </Text>

                        {/* Categoria */}
                        <Text className="text-sm font-semibold mb-1.5" style={{ color: COLORS.text }}>
                            Categoria *
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowCatModal(true)}
                            className="flex-row items-center rounded-xl px-3.5 py-3 border"
                            style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                            <View
                                className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                                style={{ backgroundColor: categoriaInfo.color + '20' }}>
                                <Ionicons name={categoriaInfo.icon as any} size={18} color={categoriaInfo.color} />
                            </View>
                            <Text className="flex-1 text-base font-medium" style={{ color: COLORS.text }}>
                                {categoriaInfo.label}
                            </Text>
                            {categoriaInfo.deducivel && (
                                <View className="px-2 py-1 rounded mr-2" style={{ backgroundColor: COLORS.accent }}>
                                    <Text className="text-white text-xs font-bold">Dedutível</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        {/* Tipo */}
                        <Text className="text-sm font-semibold mt-3 mb-1.5" style={{ color: COLORS.text }}>
                            Tipo de documento *
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowTipoModal(true)}
                            className="flex-row items-center rounded-xl px-3.5 py-3 border"
                            style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}>
                            <Ionicons
                                name="document-text-outline"
                                size={18}
                                color={COLORS.primary}
                                style={{ marginRight: 10 }}
                            />
                            <Text className="flex-1 text-base font-medium" style={{ color: COLORS.text }}>
                                {tipoInfo?.label}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        {/* Emitente */}
                        <LabeledInput
                            label="Emitente (empresa/prestador)"
                            required
                            isAIField={isAIField('emitente')}
                            placeholder="Ex: Hospital São Lucas, Colégio Rio Verde..."
                            value={form.emitente}
                            onChangeText={(v) => update('emitente', v)}
                            autoCapitalize="words"
                        />

                        {/* CNPJ/CPF */}
                        <LabeledInput
                            label="CNPJ / CPF do emitente"
                            isAIField={isAIField('cnpj_cpf')}
                            placeholder="00.000.000/0001-00"
                            value={form.cnpj_cpf}
                            onChangeText={(v) => update('cnpj_cpf', v)}
                            keyboardType="numeric"
                        />

                        {/* Número */}
                        <LabeledInput
                            label="Número da nota"
                            isAIField={isAIField('numero')}
                            placeholder="Ex: 123456"
                            value={form.numero}
                            onChangeText={(v) => update('numero', v)}
                            keyboardType="numeric"
                        />

                        {/* Data e Valor em linha */}
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <LabeledInput
                                    label="Data de emissão"
                                    required
                                    isAIField={isAIField('data_emissao')}
                                    placeholder="DD/MM/AAAA"
                                    value={form.data_emissao.split('-').reverse().join('/')}
                                    onChangeText={(v) => {
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
                            <View className="flex-1">
                                <LabeledInput
                                    label="Valor total (R$)"
                                    required
                                    isAIField={isAIField('valor_total')}
                                    placeholder="0,00"
                                    value={form.valor_total}
                                    onChangeText={(v) => update('valor_total', v.replace(/[^0-9,.]/g, ''))}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        {/* Descrição */}
                        <LabeledInput
                            label="Descrição dos serviços/produtos"
                            isAIField={isAIField('descricao')}
                            placeholder="Ex: Consulta médica, Material escolar..."
                            value={form.descricao}
                            onChangeText={(v) => update('descricao', v)}
                            multiline
                            numberOfLines={3}
                        />

                        {/* IR */}
                        <Text
                            className="text-xs font-bold tracking-widest mt-5 mb-1"
                            style={{ color: COLORS.textSecondary }}>
                            IMPOSTO DE RENDA
                        </Text>
                        <IRSection
                            deducivel={form.deducivel}
                            percentualDeducao={form.percentual_deducao}
                            categoria={form.categoria}
                            onToggleDeducivel={(v) => update('deducivel', v)}
                            onSelectPercentual={(p) => update('percentual_deducao', p)}
                        />

                        {/* Observações */}
                        <LabeledInput
                            label="Observações"
                            placeholder="Informações adicionais..."
                            value={form.observacoes}
                            onChangeText={(v) => update('observacoes', v)}
                            multiline
                            numberOfLines={2}
                        />

                        {/* Botão salvar */}
                        <TouchableOpacity
                            onPress={salvar}
                            disabled={saving}
                            className="flex-row items-center justify-center gap-2 rounded-2xl p-4 mt-6"
                            style={{ backgroundColor: COLORS.primary, opacity: saving ? 0.6 : 1 }}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.textWhite} />
                            <Text className="text-white text-base font-bold">
                                {saving ? 'Salvando...' : 'Salvar nota fiscal'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal Categoria */}
            <SelectModal
                visible={showCatModal}
                title="Selecionar categoria"
                options={catOptions}
                selectedId={form.categoria}
                onClose={() => setShowCatModal(false)}
                onSelect={(id) => {
                    update('categoria', id);
                    const cat = CATEGORIAS.find((c) => c.id === id);
                    if (cat?.deducivel) update('deducivel', true);
                    setShowCatModal(false);
                }}
            />

            {/* Modal Tipo */}
            <SelectModal
                visible={showTipoModal}
                title="Tipo de documento"
                options={tipoOptions}
                selectedId={form.tipo}
                onClose={() => setShowTipoModal(false)}
                onSelect={(id) => { update('tipo', id); setShowTipoModal(false); }}
            />
        </View>
    );
}
