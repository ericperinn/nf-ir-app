# 📄 NF - Imposto de Renda

App mobile em **Expo / React Native** para coletar, organizar e gerenciar notas fiscais para a declaração do Imposto de Renda.

---

## 📱 Funcionalidades

### ✅ Registro de Notas
- Emitente, CNPJ/CPF, número da NF
- Data de emissão e valor total
- Tipo de documento (NF-e, NFC-e, NFS-e, Recibo, etc.)
- Categorias (Saúde, Educação, Previdência, Alimentação, etc.)
- Descrição e observações

### 📸 Foto da Nota
- Fotografar nota direto pela câmera
- Selecionar da galeria
- Foto salva permanentemente no dispositivo
- Visualização com zoom na tela de detalhes

### 💰 Controle de Deduções IR
- Marcar nota como dedutível ou não
- Definir percentual de dedução (25%, 50%, 75%, 100%)
- Valor dedutível calculado automaticamente
- Categorias com sugestão automática (Saúde e Educação = dedutível)

### 📊 Dashboard (Tela Início)
- Resumo total de notas e valor gasto por ano
- Total dedutível em destaque
- Gastos por categoria com barra de progresso
- Últimas notas registradas
- Filtro por ano fiscal

### 📋 Listagem
- Lista completa com busca por texto
- Filtros por categoria, ano e tipo (dedutível/não dedutível)
- Total filtrado em tempo real
- Toque longo para excluir

### 📈 Resumo IR
- Visualização anual por categoria com gráfico de barras
- Lista de notas dedutíveis com valor de dedução
- Total dedutível consolidado
- Exportar/compartilhar resumo em texto

---

## 🚀 Como usar

### Pré-requisitos
- Node.js 18+
- Expo CLI
- App **Expo Go** no celular (iOS/Android)

### Instalação

```bash
# Clonar / extrair o projeto
cd nf-ir-app

# Instalar dependências
npm install

# Configure a chave da API do Gemini (opcional para usar a análise por IA)
cp .env.example .env
# Edite .env e preencha EXPO_PUBLIC_GEMINI_API_KEY

# Ambiente do frontend (.env)
# O app lê variáveis do arquivo .env na raiz (ignorado pelo Git). Exemplo:
# EXPO_PUBLIC_GEMINI_API_KEY=suachave

# Iniciar o servidor de desenvolvimento
npx expo start
```

### Rodando no celular
1. Instale o app **Expo Go** na loja do seu celular
2. Rode `npx expo start`
3. Escaneie o QR Code com o Expo Go (Android) ou a câmera (iOS)

### Rodando no emulador
```bash
npx expo start --android   # Android
npx expo start --ios       # iOS (macOS apenas)
```

---

## 🗂 Estrutura do projeto

```
nf-ir-app/
├── App.js                    # Navegação principal
├── index.js                  # Entry point
├── app.json                  # Configurações Expo + permissões
└── src/
    ├── screens/
    │   ├── HomeScreen.js      # Dashboard
    │   ├── NovaNotaScreen.js  # Formulário de nova nota
    │   ├── ListagemScreen.js  # Lista de notas
    │   ├── DetalhesNotaScreen.js  # Detalhes + foto
    │   └── ResumoScreen.js   # Resumo IR
    ├── database/
    │   └── db.js             # SQLite (expo-sqlite)
    └── utils/
        └── constants.js      # Temas, categorias, formatadores
```

---

## 🗄 Banco de Dados

Usa **expo-sqlite** (SQLite local) — os dados ficam no dispositivo.

**Tabela `notas_fiscais`:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT (UUID) | Identificador único |
| tipo | TEXT | nfe, nfce, nfs, recibo... |
| numero | TEXT | Número da NF |
| emitente | TEXT | Nome do emitente |
| cnpj_cpf | TEXT | CNPJ ou CPF |
| data_emissao | TEXT | YYYY-MM-DD |
| valor_total | REAL | Valor em reais |
| categoria | TEXT | saude, educacao... |
| descricao | TEXT | Descrição do serviço |
| foto_uri | TEXT | Caminho local da foto |
| deducivel | INTEGER | 0 ou 1 |
| percentual_deducao | REAL | 0-100 |
| observacoes | TEXT | Notas adicionais |

---

## 📦 Dependências principais

| Pacote | Uso |
|--------|-----|
| expo-sqlite | Banco de dados local |
| expo-image-picker | Câmera e galeria |
| expo-file-system | Salvar fotos permanentemente |
| @react-navigation | Navegação entre telas |
| @expo/vector-icons | Ícones Ionicons |
| uuid | Geração de IDs únicos |

---

## 🎨 Design

- **Paleta**: Azul marinho (#1A3C5E) + Verde (#00C896)
- **Categorias**: Com ícones e cores distintas
- **Badge IR**: Indicador visual nas notas dedutíveis
- Suporte a iOS e Android

---

## ⚠️ Permissões necessárias

- **Câmera**: Para fotografar notas
- **Galeria**: Para selecionar fotos existentes

As permissões são solicitadas na primeira vez que o recurso é usado.
