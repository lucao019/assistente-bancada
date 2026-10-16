# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [Não lançado]

---

## [0.3.0] - 2026-10-16 — Interface ChatGPT + Histórico de aparelhos

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
