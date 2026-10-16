# Assistente de Bancada 🔧

Assistente de IA local para diagnósticos eletrônicos, voltado para técnicos de manutenção de celulares e eletrônicos em geral. Roda 100% offline, sem depender de internet ou serviços externos.

---

## Objetivo

Permitir que o técnico cole ou carregue uma foto de uma placa, componente, esquemático ou erro de tela e converse com um modelo de IA multimodal para obter diagnósticos, leitura de esquemas e orientações de reparo — como ter um colega experiente de bancada disponível o tempo todo.

---

## Stack e ferramentas

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js v26+ (ESM) |
| Framework web | Express 4 |
| Interface desktop | Electron 44 |
| Modelo de IA (visão + texto) | Qwen2.5-VL-3B-Instruct Q4_K_M (GGUF) |
| Servidor de inferência | llama.cpp `llama-server` (CUDA) |
| Multimodal projection | mmproj Qwen2.5-VL-3B f16 |
| OCR (reserva) | Tesseract 5 |
| Conversão PDF → imagem | Poppler 26 (`pdftoppm`) |
| Banco de dados | sql.js (SQLite puro JS, sem compilação nativa) |
| Upload de arquivos | Multer |
| Requisições HTTP | node-fetch 3 |

---

## Funcionalidades implementadas

- **Upload de imagem** — arraste, clique ou **Ctrl+V** para colar direto do clipboard
- **Upload de PDF** — converte página a página em imagem via Poppler (mesmo com PDFs criptografados/protegidos)
- **Chat com visão** — imagem enviada junto com a pergunta, modelo analisa e responde
- **Contexto de aparelho** — cada atendimento tem nome, modelo e observações iniciais
- **Histórico persistente** — conversas salvas por aparelho no SQLite, retomadas ao reabrir
- **Menu de contexto** — seleciona texto na resposta, clica com botão direito → "Pesquisar sobre isso"
- **Markdown renderizado** — respostas com negrito, itálico, listas e blocos de código
- **Interface Electron** — abre como app nativo, sem precisar de navegador
- **Splash screen** — tela de carregamento enquanto o modelo sobe
- **Inicialização automática** — o llama-server sobe junto com o app, com `--image-min-tokens 1024`
- **Sidebar de aparelhos** — lista, cria, abre, limpa histórico e remove aparelhos

---

## Estrutura do projeto

```
assistente-bancada/
├── main.cjs              # Entry point Electron (CJS)
├── public/
│   └── index.html        # Interface web completa (HTML + CSS + JS vanilla)
├── src/
│   ├── server.js         # Servidor Express (ESM)
│   └── services/
│       ├── llm.js        # Comunicação com llama-server (OpenAI-compatible API)
│       ├── pdf.js        # Conversão PDF → PNG via Poppler
│       └── db.js         # Banco SQLite via sql.js (sem binários nativos)
├── .env                  # Caminhos dos componentes externos
├── package.json
├── CHANGELOG.md
└── README.md
```

---

## Dependências externas (fora do projeto)

> Ficam em `H:\IA\` e **não** são versionadas.

| Componente | Caminho | Uso |
|---|---|---|
| llama-server.exe | `H:\IA\llama\` | Servidor de inferência (llama.cpp CUDA) |
| Qwen2.5-VL-3B Q4_K_M | `H:\IA\models\qwen2.5-vl-3b\` | Modelo de linguagem + visão |
| mmproj f16 | `H:\IA\models\qwen2.5-vl-3b\` | Projetor multimodal (imagens) |
| Tesseract OCR | `H:\IA\ocr\` | Extração de texto de imagens |
| Poppler binários | `H:\IA\poppler\` | Conversão PDF → imagem |
| Banco SQLite | `H:\IA\database\bancada.db` | Histórico de aparelhos e conversas |
| Cache temporário | `H:\IA\cache\` | Imagens de páginas geradas |

---

## Configuração (.env)

```env
LLAMA_SERVER_URL=http://127.0.0.1:8080
MODELS_DIR=H:\IA\models
DOCUMENTS_DIR=H:\IA\documents
DB_PATH=H:\IA\database\bancada.db
CACHE_DIR=H:\IA\cache
TESSERACT_PATH=H:\IA\ocr\tesseract.exe
POPPLER_PATH=H:\IA\poppler\poppler-26.09.0\Library\bin
PORT=3000
```

---

## Como rodar

### Modo desenvolvimento (navegador)

```powershell
cd H:\IA\assistente-bancada
npm install
npm run dev       # sobe o Express em localhost:3000
```

O llama-server precisa estar rodando separadamente:

```powershell
H:\IA\llama\llama-server.exe `
  -m H:\IA\models\qwen2.5-vl-3b\Qwen2.5-VL-3B-Instruct-Q4_K_M.gguf `
  --mmproj H:\IA\models\qwen2.5-vl-3b\mmproj-Qwen2.5-VL-3B-Instruct-f16.gguf `
  --port 8080 `
  --image-min-tokens 1024
```

### Modo app Electron (recomendado)

```powershell
cd H:\IA\assistente-bancada
npm run electron  # sobe llama-server + Express + janela automaticamente
```

### Para o amigo (distribuição)

Clicar duas vezes em `H:\IA\Iniciar.bat`.  
Requerimento: Node.js LTS instalado.

---

## Observações técnicas

- O parâmetro `--image-min-tokens 1024` é **obrigatório** para o Qwen2.5-VL processar imagens corretamente. Sem ele, o modelo ignora a imagem e pede que ela seja enviada novamente.
- O `better-sqlite3` foi substituído por `sql.js` para evitar a necessidade de compilar binários nativos para cada versão do Electron (node-gyp + Visual Studio Build Tools).
- PDFs com criptografia (`copy: no`) são suportados via renderização por imagem (Poppler `pdftoppm`), contornando a restrição de extração de texto.
- O modelo roda em CUDA quando disponível. Em CPU puro, a latência por resposta é significativamente maior.

---

## Status

🚧 Em desenvolvimento ativo — funcionalidades core implementadas, em fase de testes e refinamento.
