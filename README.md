# NF - Imposto de Renda

App mobile em **Expo / React Native** para coletar, organizar e gerenciar notas fiscais para a declaração do Imposto de Renda.

---

##  Funcionalidades

###  Registro de Notas
- Emitente, CNPJ/CPF, número da NF
- Data de emissão e valor total
- Tipo de documento (NF-e, NFC-e, NFS-e, Recibo, etc.)
- Categorias (Saúde, Educação, Previdência, Alimentação, etc.)
- Descrição e observações

### Foto da Nota
- Fotografar nota direto pela câmera
- Selecionar da galeria
- Foto salva permanentemente no dispositivo
- Visualização com zoom na tela de detalhes

### Análise com IA (Google Gemini)
- Analisar foto da nota automaticamente
- Extração de emitente, valor, data, CNPJ e categoria
- Indicação visual dos campos preenchidos pela IA
- Usar `GEMINI_API_KEY` no `.env`

### Controle de Deduções IR
- Marcar nota como dedutível ou não
- Definir percentual de dedução (25%, 50%, 75%, 100%)
- Valor dedutível calculado automaticamente
- Categorias com sugestão automática (Saúde e Educação = dedutível)

### Dashboard (Tela Início)
- Resumo total de notas e valor gasto por ano
- Total dedutível em destaque
- Gastos por categoria com barra de progresso
- Últimas notas registradas
- Filtro por ano fiscal

### Listagem
- Lista completa com busca por texto
- Filtros por categoria, ano e tipo (dedutível/não dedutível)
- Total filtrado em tempo real
- Toque longo para excluir

### Resumo IR
- Visualização anual por categoria com gráfico de barras
- Lista de notas dedutíveis com valor de dedução
- Total dedutível consolidado
- Exportar/compartilhar resumo em texto

---

## Como usar

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

# Iniciar o servidor de desenvolvimento (com cache limpo)
npx expo start --clear
```

> ⚠️ Use sempre `--clear` após mudanças em `babel.config.js` ou `metro.config.js`.

### IA (opcional)
Crie um arquivo `.env` na raiz com sua chave do Google Gemini:
```
GEMINI_API_KEY=sua_chave_aqui
```
Obtenha gratuitamente em: https://aistudio.google.com/app/apikey

### Rodando no celular
1. Instale o app **Expo Go** na loja do seu celular
2. Rode `npx expo start --clear`
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
├── App.tsx                     # Navegação principal
├── index.js                    # Entry point
├── app.json                    # Configurações Expo + permissões
├── babel.config.js             # Babel com NativeWind
├── metro.config.js             # Metro com NativeWind
├── tailwind.config.js          # Tailwind CSS
├── tsconfig.json               # TypeScript
├── global.css                  # CSS base do NativeWind
└── src/
    ├── types/
    │   ├── index.ts            # Interfaces (NotaFiscal, Categoria, etc.)
    │   └── navigation.ts       # Tipos de navegação
    ├── screens/
    │   ├── HomeScreen.tsx      # Dashboard
    │   ├── NovaNotaScreen.tsx  # Formulário de nova nota
    │   ├── ListagemScreen.tsx  # Lista de notas
    │   ├── DetalhesNotaScreen.tsx  # Detalhes + foto
    │   └── ResumoScreen.tsx    # Resumo IR
    ├── components/
    │   ├── common/
    │   │   ├── ScreenHeader.tsx    # Header reutilizável
    │   │   ├── EmptyState.tsx      # Estado vazio
    │   │   ├── CategoryIcon.tsx    # Ícone de categoria
    │   │   ├── IRBadge.tsx         # Badge "IR / Dedutível"
    │   │   ├── YearSelector.tsx    # Seletor de ano
    │   │   └── SelectModal.tsx     # Modal de seleção genérico
    │   ├── nota/
    │   │   ├── NotaCard.tsx        # Card de nota reutilizável
    │   │   └── CategoryProgressRow.tsx  # Barra de progresso por categoria
    │   └── nova-nota/
    │       ├── FotoSection.tsx     # Seção de foto + análise IA
    │       ├── LabeledInput.tsx    # Input com label e badge IA
    │       └── IRSection.tsx       # Switch dedutível + percentual
    ├── database/
    │   └── db.ts               # SQLite (expo-sqlite)
    ├── hooks/
    │   └── useNFAnalysis.ts    # Hook de análise com IA
    └── utils/
        ├── constants.ts        # Cores, categorias, formatadores
        └── aiConfig.ts         # Configuração Google Gemini
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
| expo-file-system | Leitura de imagens em base64 |
| @react-navigation/native | Navegação entre telas |
| @react-navigation/native-stack | Stack navigator tipado |
| @expo/vector-icons | Ícones Ionicons |
| nativewind + tailwindcss | Estilização com classes Tailwind |
| uuid | Geração de IDs únicos |
| babel-preset-expo | Preset Babel para Expo |

---

## Design

- **Stack**: TypeScript + NativeWind (Tailwind CSS para React Native)

## ⚠️ Permissões necessárias

- **Câmera**: Para fotografar notas
- **Galeria**: Para selecionar fotos existentes

As permissões são solicitadas na primeira vez que o recurso é usado.
