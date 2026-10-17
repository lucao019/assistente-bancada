# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [Não lançado]

---

## [0.6.0] - 2026-10-16 — Correções do viewer + qualidade de resposta do modelo

### Adicionado
- **`repeat_penalty: 1.3`** no request ao llama-server — elimina loop de repetição de tokens (ex: "I2C I2C I2C..." infinito)
- **Prompt de sistema técnico e rígido** — instrui o modelo a: ser direto, citar cada componente só uma vez, não repetir, admitir incertezas
- **Histórico limitado a 6 mensagens** por chamada (últimas 3 trocas) — evita lotar o contexto do modelo 3B
- **`top_p: 0.9`** para melhor controle de diversidade nas respostas
- **Cores rápidas** no painel da caneta — 6 swatches clicáveis (vermelho, laranja, verde, azul, branco, preto)
- **Botões visuais de espessura** da caneta — 4 tamanhos com preview do ponto proporcional ao tamanho
- **Seletor de ponta** da caneta — Redonda (●) e Quadrada (■), afeta `lineCap` e `lineJoin` do canvas
- **Tamanhos de borracha S/M/L/XL** estilo Paint
- **Opções de caneta** visíveis apenas quando caneta está ativa (`#penOptions`)
- **Opções de borracha** visíveis apenas quando borracha está ativa (`#eraseOptions`)
- **README focado no usuário final** — linguagem simples, passo a passo de instalação e uso para técnicos sem experiência em programação

### Corrigido
- **HTML do viewer quebrado** — faltavam dois `</div>` de fechamento do `#viewerCanvas` e `#viewerOverlay`; quebrava o DOM inteiro e impedia o JS de rodar (sidebar não carregava, modal não abria)
- **Listeners órfãos** — `btnFit`, `btnZoomIn`, `btnZoomOut`, `btnClearDraw` removidos do HTML mas ainda referenciados no JS; causavam erro silencioso na inicialização
- **`getElementById('penSize')`** ainda chamado no código antigo após remoção do `<select>`; substituído pelos helpers `getPenSize()`, `getPenCap()`, `getEraseSize()`
- **Viewer não fechava ao enviar** — após duplo clique + pergunta, overlay ficava aberto mostrando o recorte; agora fecha e volta pro chat automaticamente

### Alterado
- `max_tokens` reduzido de 1024 → 512 — respostas mais curtas e diretas
- `temperature` reduzido de 0.2 → 0.1 — mais determinístico, menos alucinação
- Card de ferramentas simplificado — removidos Ajustar, Zoom+, Zoom−, Limpar; ficaram só Selecionar, Caneta, Borracha
- Legenda de atalhos atualizada no card

---

## [0.5.0] - 2026-10-16 — Viewer canvas com ferramentas e interação por seleção

### Adicionado
- **Viewer em tela cheia** — overlay sobre a interface ao clicar em "🔍 Abrir viewer"
- **Canvas duplo** — `mainCanvas` (imagem) + `drawCanvas` (anotações sem sujar o original)
- **Pan com botão direito** — segurar botão direito move a imagem em qualquer modo
- **Zoom com scroll** centrado no cursor; botões `+` / `−` / `⊡ Ajustar`
- **Seleção de área (⬚)** — retângulo verde arrastável sobre a região de interesse
- **`selBox` acompanha pan/zoom** — reconvertido de coordenadas da imagem a cada `renderViewer()`
- **Duplo clique na seleção** → dialog flutuante posicionado abaixo da área; digita pergunta, Enter envia recorte + pergunta ao chat
- **Caneta (✏️)** com cursor círculo colorido proporcional à espessura
- **Borracha (🧹)** com cursor quadrado estilo Paint
- **Ctrl+Z** — desfaz última pincelada; stack de até 30 estados (ImageData)
- **Card de ferramentas arrastável** pelo ícone `⠿`
- **Barra de anexo** no chat — substitui painel lateral fixo
- **Ferramenta padrão**: Seleção
- **Menu de contexto nativo suprimido** no viewer (`contextmenu preventDefault`)

### Alterado
- Layout principal: sidebar + chat sem painel fixo lateral
- DPI do Poppler: 150 → 250 — qualidade superior em esquemáticos

### Corrigido
- `selBox` não acompanhava o pan da imagem
- Menu de contexto do browser aparecia com botão direito no viewer

---

## [0.3.0] - 2026-10-16 — Interface ChatGPT + histórico de aparelhos

### Adicionado
- Sidebar de aparelhos — lista, cria, abre, limpa, remove
- Modal de novo aparelho — nome/defeito, modelo, observações
- Histórico persistente por aparelho via SQLite (`sql.js`)
- Contexto de aparelho no prompt do sistema
- Menu de contexto no chat (botão direito) — "Pesquisar sobre isso"
- Markdown renderizado — negrito, itálico, listas, código
- Preview de imagem na bolha do usuário
- Botão de anexar (📎)
- Interface estilo ChatGPT

### Corrigido
- Imagem não chegava ao modelo — upload ocorre junto com o envio
- "Aparelho: undefined" na saudação
- Loading aparecia como HTML bruto
- Markdown com asteriscos aparecia como texto literal
- Rotas síncronas com funções async do banco

### Trocado
- `better-sqlite3` → `sql.js` — sem necessidade de compilar binários nativos para o Electron

### Aprendido
- Módulos com binários nativos precisam ser recompilados para cada versão do V8 interno do Electron

---

## [0.2.0] - 2026-10-16 — Electron + imagem + Ctrl+V

### Adicionado
- Interface Electron — janela nativa sem navegador (`main.cjs`)
- Splash screen de carregamento
- Inicialização automática do llama-server com parâmetros corretos
- `--image-min-tokens 1024` — obrigatório para o Qwen2.5-VL processar imagens
- Rota `POST /api/image/upload` — upload de imagem direta
- Ctrl+V — cola imagem do clipboard
- Drag & drop de arquivos
- `Iniciar.bat` para distribuição
- `npm run electron` — usa Electron local sem instalação global

### Corrigido
- `npm run dev` rodado na pasta errada (`H:\IA\llama`)
- Electron tentando instalar globalmente
- Caminhos do llama-server incorretos em dev

### Aprendido
- Sem `--image-min-tokens 1024` o Qwen2.5-VL ignora as imagens e pede para reenviar

---

## [0.1.0] - 2026-10-16 — Estrutura inicial

### Adicionado
- `package.json`, `.env`, `.gitignore`, `README.md`
- Esqueleto de diretórios `src/services/` e `public/`
- Repositório Git publicado em github.com/lucao019/assistente-bancada

## [Não lançado]

---

## [0.5.0] - 2026-10-16 — Viewer com canvas, ferramentas e interação por seleção

### Adicionado
- **Viewer em tela cheia** — abre sobre a interface principal ao clicar em "🔍 Abrir viewer", sem quebrar o layout do chat
- **Canvas duplo** — `mainCanvas` renderiza a imagem/página, `drawCanvas` renderiza as anotações por cima sem sujar o original
- **Pan com botão direito** — segurar botão direito do mouse move a imagem em qualquer modo, sem precisar trocar de ferramenta
- **Zoom com scroll** do mouse centrado no cursor; botões `+` / `−` / `⊡ Ajustar`
- **Seleção de área (⬚)** — arrasta retângulo verde sobre a região de interesse
- **Duplo clique na seleção** → abre caixinha de diálogo flutuante posicionada abaixo da área; digita a pergunta, Enter ou ➤ envia o recorte + pergunta direto ao chat
- **Seleção acompanha o pan/zoom** — `selBox` reconvertido de coordenadas de imagem a cada render
- **Caneta (✏️)** — desenha anotações coloridas sobre o esquemático
- **Borracha (🧹)** — cursor quadrado estilo Paint que acompanha o tamanho selecionado
- **Cursor dinâmico** — caneta mostra círculo colorido do tamanho da espessura; borracha mostra quadrado branco tracejado
- **Ctrl+Z** — desfaz a última pincelada (stack de até 30 estados por ImageData)
- **Opções de cor/espessura** aparecem no card de ferramentas somente quando caneta ou borracha estão selecionados
- **Card de ferramentas arrastável** — ícone `⠿` para reposicionar o card dentro do viewer
- **Legenda de atalhos** no card: botão direito = mover, duplo clique = perguntar, Ctrl+Z = desfazer
- **Barra de anexo** no chat — mostra o arquivo atual e botão para abrir o viewer, substitui o painel fixo lateral

### Alterado
- Layout principal volta a ser só sidebar + chat — sem painel de imagem fixo espremendo o espaço
- DPI do Poppler aumentado de 150 para 250 — páginas de esquemático em resolução muito superior
- Ferramenta padrão ao abrir o viewer é **Seleção**, não pan

### Corrigido
- `selBox` não acompanhava o pan — corrigido convertendo `selRect` (coords da imagem) para tela em cada `renderViewer()`
- Menu de contexto nativo do browser aparecia ao clicar com botão direito no viewer — suprimido com `preventDefault()`

---

## [0.3.0] - 2026-10-16 — Interface ChatGPT + Histórico de aparelhos

### Adicionado
- **Sidebar de aparelhos** — lista todos os aparelhos, permite criar, abrir, limpar histórico e remover
- **Modal de novo aparelho** — campos para nome/defeito, modelo/codename e observações iniciais
- **Histórico persistente por aparelho** — conversas salvas no SQLite via `sql.js`, retomadas ao reabrir
- **Contexto de aparelho no sistema** — o modelo sabe qual aparelho está sendo analisado e as observações do técnico
- **Menu de contexto (botão direito)** no chat — seleciona texto na resposta → "Pesquisar sobre isso"
- **Markdown renderizado** — negrito, itálico, listas, código inline e blocos de código
- **Preview de imagem na bolha** — imagem colada aparece na mensagem do usuário
- **Botão de anexar (📎)** — alternativa ao Ctrl+V
- **Redesign completo** — estilo ChatGPT: sidebar escura, mensagens centralizadas, input na parte inferior

### Corrigido
- Imagem não chegava ao modelo — upload agora ocorre junto com o envio da mensagem
- "Aparelho: undefined" na saudação — corrigido
- Loading aparecia como HTML bruto — tratamento separado para role `loading`
- Markdown com asteriscos aparecia como texto bruto — parser MD implementado no frontend
- Rotas síncronas com funções async do banco — todas as rotas usam `await`

### Trocado
- `better-sqlite3` → `sql.js` — sem necessidade de compilar binários nativos para o Electron

---

## [0.2.0] - 2026-10-16 — Electron + upload de imagem + Ctrl+V

### Adicionado
- **Interface Electron** — app abre como janela nativa (`main.cjs`)
- **Splash screen** de carregamento
- **Inicialização automática do llama-server** com `--image-min-tokens 1024`
- **Upload de imagem direta** — rota `POST /api/image/upload`
- **Ctrl+V para colar imagem** do clipboard
- **Script `Iniciar.bat`** para distribuição

### Aprendido
- `--image-min-tokens 1024` é obrigatório para o Qwen2.5-VL processar imagens
- `better-sqlite3` requer recompilação para cada versão do Electron (node-gyp)

---

## [0.1.0] - 2026-10-16 — Estrutura inicial

### Adicionado
- `package.json`, `.env`, `.gitignore`, `README.md`
- Esqueleto de diretórios `src/services/` e `public/`
- Repositório Git publicado em github.com/lucao019/assistente-bancada


### Adicionado
- **Sidebar de aparelhos** — lista todos os aparelhos, permite criar, abrir, limpar histórico e remover
- **Modal de novo aparelho** — campos para nome/defeito, modelo/codename e observações iniciais
- **Histórico persistente por aparelho** — conversas salvas no SQLite via `sql.js`, retomadas ao reabrir
- **Contexto de aparelho no sistema** — o modelo sabe qual aparelho está sendo analisado e as observações do técnico
- **Menu de contexto (botão direito)** — seleciona texto na resposta → "Pesquisar sobre isso" envia como nova pergunta mantendo o contexto da sessão
- **Markdown renderizado** — negrito, itálico, listas, código inline e blocos de código nas respostas do modelo
- **Preview de imagem na bolha** — imagem colada aparece na mensagem do usuário no chat
- **Botão de anexar (📎)** — alternativa ao Ctrl+V para adicionar imagem
- **Redesign completo da interface** — estilo ChatGPT: sidebar escura, mensagens centralizadas, input na parte inferior, topbar com nome do aparelho

### Corrigido
- Imagem não chegava ao modelo — fluxo corrigido: imagem fica pendente no input e é enviada junto com a mensagem (upload + chat em sequência garantida)
- "Aparelho: undefined" na saudação inicial — nome do aparelho agora vem corretamente do objeto retornado pela API
- Pontinhos de loading apareciam como HTML bruto — tratamento separado para role `loading` no `addMsg`
- Markdown com asteriscos aparecia como texto bruto — parser MD básico implementado no frontend
- Rotas de deletar/limpar eram síncronas com funções async do banco — todas as rotas agora usam `await` corretamente

### Trocado
- `better-sqlite3` → `sql.js` — eliminada a necessidade de compilar binários nativos para o Electron (node-gyp / Visual Studio Build Tools)

---

## [0.2.0] - 2026-10-16 — Electron + upload de imagem + Ctrl+V

### Adicionado
- **Interface Electron** — app abre como janela nativa sem precisar de navegador (`main.cjs`)
- **Splash screen** — tela de carregamento enquanto o modelo de IA sobe
- **Inicialização automática do llama-server** — sobe junto com o app com os parâmetros corretos
- **Parâmetro `--image-min-tokens 1024`** — obrigatório para o Qwen2.5-VL processar imagens (descoberto durante os testes)
- **Upload de imagem direta** — rota `POST /api/image/upload` sem precisar de PDF
- **Ctrl+V para colar imagem** — listener global de `paste` detecta imagem no clipboard
- **Abas Imagem / PDF** na interface
- **Script `Iniciar.bat`** em `H:\IA\` para distribuição — verifica Node.js, instala dependências e abre o app
- **`npm run electron`** — comando que usa o Electron local sem precisar de instalação global

### Corrigido
- `npm run dev` rodado na pasta errada (`H:\IA\llama`) — documentado o caminho correto
- Electron tentando instalar globalmente — corrigido usando `npm run electron` dentro da pasta do projeto
- Caminhos do llama-server calculados errados em dev — `BASE` agora aponta para `H:\IA` diretamente

### Aprendido
- O Electron usa uma versão interna do V8 diferente do Node.js padrão — módulos com binários nativos (`.node`) precisam ser recompilados com `electron-rebuild`, o que requer Visual Studio Build Tools
- Solução: preferir bibliotecas pure-JS (como `sql.js`) para evitar essa dependência

---

## [0.1.0] - 2026-10-16 — Estrutura inicial

### Adicionado
- `package.json` com dependências: Express, Multer, node-fetch, better-sqlite3, cors, dotenv
- `.env` com configuração de caminhos para llama.cpp, Tesseract, Poppler e SQLite
- `.gitignore` cobrindo `node_modules/`, `.env` e `*.log`
- `README.md` com descrição inicial do projeto
- Esqueleto de diretórios `src/services/` e `public/`
- Repositório Git inicializado e publicado em github.com/lucao019/assistente-bancada
