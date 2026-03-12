// ============================================================
// Types e Interfaces do nf-ir-app
// ============================================================

export interface NotaFiscal {
    id: string;
    tipo: string;
    numero: string | null;
    emitente: string;
    cnpj_cpf: string | null;
    data_emissao: string;
    valor_total: number;
    categoria: string;
    descricao: string | null;
    foto_uri: string | null;
    deducivel: number | boolean; // SQLite retorna number (0/1)
    percentual_deducao: number;
    observacoes: string | null;
    criado_em?: string;
    atualizado_em?: string;
}

export interface Categoria {
    id: string;
    label: string;
    icon: string;
    color: string;
    deducivel: boolean;
}

export interface TipoNF {
    id: string;
    label: string;
}

export interface CategoriaResumo {
    categoria: string;
    qtd: number;
    total: number;
    deducivel: number;
}

export interface ResumoAnual {
    total_notas: number;
    total_gasto: number;
    total_deducivel: number;
    porCategoria: CategoriaResumo[];
}

export interface NFFormData {
    tipo: string;
    numero: string;
    emitente: string;
    cnpj_cpf: string;
    data_emissao: string;
    valor_total: string;
    categoria: string;
    descricao: string;
    foto_uri: string | null;
    foto_base64: string | null;
    deducivel: boolean;
    percentual_deducao: string;
    observacoes: string;
}

export interface AIAnalysisResult {
    emitente: string | null;
    cnpj_cpf: string | null;
    numero: string | null;
    data_emissao: string | null;
    valor_total: string | null;
    tipo: string | null;
    categoria: string | null;
    descricao: string | null;
    deducivel: boolean | null;
}

export interface FiltrosNotas {
    categoria?: string;
    ano?: number;
    deducivel?: boolean;
}
