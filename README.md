# Assistente de Bancada

Assistente de IA local para diagnósticos eletrônicos, voltado para técnicos de manutenção de celulares e eletrônicos em geral.

## Objetivo

Permitir que o técnico tire uma foto de uma placa, componente ou erro de tela, e receba uma análise inteligente gerada localmente — sem depender de internet ou serviços externos.

## Tecnologias

- **Runtime:** Node.js (ESM)
- **Servidor:** Express
- **LLM local:** llama.cpp (`llama-server`) com modelo Qwen2.5-VL-3B (visão + texto)
- **OCR:** Tesseract
- **Banco de dados:** SQLite via `better-sqlite3`
- **Frontend:** HTML/JS estático servido pelo Express

## Estrutura do projeto

```
assistente-bancada/
├── public/          # Interface web (HTML, CSS, JS)
├── src/
│   ├── server.js    # Servidor Express principal
│   └── services/    # Módulos de integração
│       ├── llm.js   # Comunicação com llama-server
│       ├── ocr.js   # Extração de texto via Tesseract
│       └── db.js    # Acesso ao banco SQLite
├── .env             # Configurações de ambiente
└── package.json
```

## Configuração

Copie o `.env` e ajuste os caminhos conforme seu ambiente:

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

## Dependências externas

- **llama.cpp** — binários em `H:\IA\llama\`
- **Tesseract OCR** — binários em `H:\IA\ocr\`
- **Poppler** — binários em `H:\IA\poppler\`
- **Modelos GGUF** — em `H:\IA\models\`

## Como rodar

```bash
npm install
npm run dev    # modo desenvolvimento (reload automático)
npm start      # modo produção
```

O servidor sobe na porta definida em `PORT` (padrão: 3000).

## Status

🚧 Em desenvolvimento — estrutura inicial criada, implementação em andamento.
