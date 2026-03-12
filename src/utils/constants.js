export const COLORS = {
  primary: '#1A3C5E',
  primaryLight: '#2563A8',
  primaryDark: '#0F2440',
  accent: '#00C896',
  accentLight: '#4DDFB4',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  
  bg: '#F0F4F8',
  bgCard: '#FFFFFF',
  bgDark: '#1A3C5E',
  
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  shadow: 'rgba(0,0,0,0.08)',
};

export const CATEGORIAS = [
  { id: 'saude', label: 'Saúde', icon: 'heart', color: '#EF4444', deducivel: true },
  { id: 'educacao', label: 'Educação', icon: 'school', color: '#3B82F6', deducivel: true },
  { id: 'previdencia', label: 'Previdência', icon: 'shield-checkmark', color: '#8B5CF6', deducivel: true },
  { id: 'doacao', label: 'Doação', icon: 'heart-outline', color: '#EC4899', deducivel: true },
  { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant', color: '#F97316', deducivel: false },
  { id: 'transporte', label: 'Transporte', icon: 'car', color: '#14B8A6', deducivel: false },
  { id: 'moradia', label: 'Moradia', icon: 'home', color: '#6366F1', deducivel: false },
  { id: 'lazer', label: 'Lazer', icon: 'game-controller', color: '#F59E0B', deducivel: false },
  { id: 'servicos', label: 'Serviços', icon: 'briefcase', color: '#10B981', deducivel: false },
  { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal', color: '#94A3B8', deducivel: false },
];

export const TIPOS_NF = [
  { id: 'nfe', label: 'NF-e (Eletrônica)' },
  { id: 'nfce', label: 'NFC-e (Consumidor)' },
  { id: 'nfs', label: 'NFS-e (Serviço)' },
  { id: 'recibo', label: 'Recibo' },
  { id: 'cupom', label: 'Cupom Fiscal' },
  { id: 'outros', label: 'Outros' },
];

export const ANOS_DISPONIVEIS = () => {
  const anoAtual = new Date().getFullYear();
  return [anoAtual, anoAtual - 1, anoAtual - 2, anoAtual - 3];
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export const getCategoriaInfo = (id) => {
  return CATEGORIAS.find(c => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1];
};
