# Sertão Galeria

Um projeto de galeria de mídia desenvolvido utilizando React, TanStack Start/Router, Vite e Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- **Framework**: React 19
- **Roteamento**: TanStack Router (`@tanstack/react-router`)
- **Build Tool**: Vite com integração Cloudflare (`@cloudflare/vite-plugin`)
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: Radix UI (shadcn-ui)
- **Animações**: Framer Motion
- **Estado/Data Fetching**: TanStack React Query
- **Tipagem**: TypeScript

## 📁 Estrutura do Projeto

Abaixo está a estrutura de diretórios e arquivos principais do projeto:

```text
C:\USERS\USUARIO\DESKTOP\SERT-O-GALERIA
├── src/                      # Código fonte principal da aplicação
│   ├── assets/               # Imagens e arquivos estáticos
│   │   └── ambssl-logo.png
│   ├── components/           # Componentes React
│   │   ├── gallery/          # Componentes específicos da Galeria
│   │   │   ├── AppShell.tsx       # Layout principal (Shell)
│   │   │   ├── BottomNav.tsx      # Navegação inferior mobile
│   │   │   ├── FilterSheet.tsx    # Filtros e categorias
│   │   │   ├── GalleryHeader.tsx  # Cabeçalho da galeria
│   │   │   ├── MediaCard.tsx      # Card de exibição individual de mídia
│   │   │   ├── MediaGrid.tsx      # Grade de renderização de mídias
│   │   │   ├── MediaViewer.tsx    # Visualizador de mídia em tela cheia/modal
│   │   │   ├── OfflineBanner.tsx  # Banner de aviso para modo offline (PWA)
│   │   │   └── States.tsx         # Tratamento de estados (Loading, Erros)
│   │   └── ui/               # Componentes genéricos e primitivos de interface (shadcn-ui/Radix)
│   ├── hooks/                # Hooks customizados (Custom Hooks)
│   │   ├── use-favorites.ts  # Gerenciamento de itens favoritos
│   │   ├── use-mobile.tsx    # Detecção de responsividade/tela mobile
│   │   ├── use-network.ts    # Monitoramento de status de rede
│   │   └── use-online.ts     # Hook simplificado para verificação de conexão
│   ├── lib/                  # Funções utilitárias e mock/data
│   │   ├── media-data.ts     # Dados ou modelo da galeria de mídia
│   │   └── utils.ts          # Funções utilitárias (ex: className merging com cn)
│   ├── routes/               # Rotas gerenciadas pelo TanStack Router
│   │   ├── __root.tsx        # Layout/Root da aplicação
│   │   ├── index.tsx         # Página inicial (Home)
│   │   └── sobre.tsx         # Página "Sobre"
│   ├── routeTree.gen.ts      # Árvore de rotas auto-gerada pelo TanStack Router
│   ├── router.tsx            # Configuração e inicialização do Router
│   └── styles.css            # Folha de estilos global
├── bun.lockb                 # Lockfile do gerenciador de pacotes Bun
├── components.json           # Configuração da CLI do shadcn-ui
├── eslint.config.js          # Configuração do ESLint
├── package.json              # Dependências e scripts do projeto
├── tsconfig.json             # Configuração do TypeScript
├── vite.config.ts            # Configuração do bundler Vite
└── wrangler.jsonc            # Configurações do Cloudflare Workers (Deploy)
```

## 🛠️ Scripts Disponíveis

No diretório do projeto, você pode executar:

- `npm run dev`: Inicia o servidor de desenvolvimento local.
- `npm run build`: Cria uma build otimizada de produção.
- `npm run build:dev`: Cria uma build no modo de desenvolvimento.
- `npm run preview`: Visualiza a build localmente antes de fazer o deploy.
- `npm run lint`: Executa a análise estática de código (ESLint).
- `npm run format`: Formata o código com o Prettier.

## 📱 PWA & Funcionamento Offline

A arquitetura do projeto possui elementos previstos para o funcionamento resiliente de conexão, exemplificado pelos hooks `use-network` e `use-online`, junto com o componente visual `OfflineBanner`. Isso indica que a galeria preza por boa experiência de usuário sob diversas condições de rede.

## 🧩 Padrões Adotados

- **Componentização**: Divisão clara entre componentes atrelados à regra de negócio/feature (`gallery/`) e componentes base/burros (`ui/`).
- **File-based Routing**: Gerenciamento automático de rotas usando `routes/` e integração com a tipagem forte do TanStack Router.
- **Utilitários Compartilhados**: Lógica isolada em `/lib` e estado centralizado isolado através de React Hooks dentro de `/hooks`.
