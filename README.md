# 🔧 Assistente de Bancada

> Seu assistente de IA local para diagnósticos eletrônicos — roda 100% no seu PC, sem internet, sem mensalidade.

---

## O que é isso?

É um programa que usa inteligência artificial para te ajudar na bancada de reparo de celulares.

Você tira uma foto da placa, cola no programa, faz uma pergunta — e ele responde como um técnico experiente do seu lado.

**Funciona offline.** Tudo roda na sua máquina. Nenhum dado sai do seu PC.

---

## O que você pode fazer

- 📸 **Colar uma foto** da placa direto com Ctrl+V
- 📄 **Abrir um esquemático em PDF** e navegar página por página
- 🔍 **Selecionar uma área** do diagrama e perguntar sobre ela
- ✏️ **Desenhar marcações** em cima do esquemático antes de enviar
- 💬 **Conversar** com a IA sobre o aparelho em reparo
- 📱 **Registrar aparelhos** com nome, modelo e observações — o histórico fica salvo

---

## Requisitos

Antes de instalar, você precisa ter:

- ✅ **Windows 10 ou 11** (64 bits)
- ✅ **Placa de vídeo NVIDIA** com suporte a CUDA (recomendado para boa velocidade)
- ✅ **Node.js LTS** instalado — baixe em [nodejs.org](https://nodejs.org) e instale normalmente

> Sem placa NVIDIA o programa funciona, mas fica mais lento.

---

## Instalação

### Passo 1 — Receba a pasta do programa

O programa vem como uma pasta chamada `IA`. Coloque ela em `H:\IA\` (ou ajuste o caminho no `.env` se preferir outro local).

A estrutura deve ficar assim:

```
H:\IA\
├── assistente-bancada\   ← o app
├── llama\                ← motor de IA
├── models\               ← modelo de linguagem
├── ocr\                  ← reconhecimento de texto
├── poppler\              ← leitor de PDF
├── cache\                ← pasta vazia (criada automaticamente)
├── database\             ← pasta vazia (criada automaticamente)
└── Iniciar.bat           ← clique aqui para abrir
```

### Passo 2 — Instale o Node.js

1. Acesse [nodejs.org](https://nodejs.org)
2. Baixe a versão **LTS** (botão verde)
3. Instale normalmente (Next → Next → Finish)

### Passo 3 — Abra o programa

Dê **duplo clique** em `H:\IA\Iniciar.bat`

Na primeira vez vai demorar um pouco para instalar as dependências e carregar o modelo de IA. Depois fica mais rápido.

---

## Como usar

### Criar um atendimento

1. Clique em **"✏️ Novo aparelho"** na barra lateral
2. Preencha o nome (ex: `Redmi Note 10s — sem carga`) e o modelo
3. Clique em **"Iniciar conversa"**

### Analisar uma imagem

**Opção 1 — Colar:**
- Copie qualquer imagem (print, foto, screenshot)
- Pressione **Ctrl+V** na janela do programa

**Opção 2 — Arrastar:**
- Arraste o arquivo de imagem para a janela

**Opção 3 — Anexar:**
- Clique no ícone 📎 na caixa de mensagem

### Analisar um PDF (esquemático)

1. Clique em 📎 e selecione o arquivo PDF
2. Quando carregar, clique em **"🔍 Abrir viewer"**
3. Navegue pelas páginas com as setas **‹ ›**
4. Use o **scroll** do mouse para dar zoom
5. Segure o **botão direito** para mover a imagem

### Selecionar uma área do esquemático

1. No viewer, a ferramenta **⬚ Selecionar** já vem ativa
2. Arraste um retângulo sobre a parte que quer analisar
3. **Dê duplo clique** na seleção
4. Digite sua pergunta na caixa que aparece
5. Pressione Enter — a IA responde sobre aquela área específica

### Desenhar marcações

1. No viewer, clique em **✏️ Caneta**
2. Escolha cor e espessura
3. Desenhe em cima do esquemático
4. Clique **"➤ Enviar para o chat"**
5. Use **Ctrl+Z** para desfazer

---

## Dicas

- **Quanto menor a área selecionada, melhor a resposta** — mande só o trecho relevante, não a página inteira
- O histórico de cada aparelho fica salvo — você pode fechar e reabrir que a conversa continua
- Clique com o **botão direito** em qualquer resposta para opções de copiar ou pesquisar mais

---

## Problemas comuns

**O programa não abre / trava na splash screen**
- Verifique se o Node.js está instalado: abra o PowerShell e digite `node --version`
- Verifique se a pasta `H:\IA\llama\` existe e tem o arquivo `llama-server.exe`

**A IA não responde / erro de conexão**
- O modelo de IA demora para carregar na primeira vez — aguarde até 2 minutos
- Se persistir, feche e abra novamente pelo `Iniciar.bat`

**Resposta sem sentido ou repetindo palavras**
- Tente recortar uma área menor e mais específica do esquemático
- Evite mandar a página inteira — o modelo funciona melhor com imagens focadas

---

## Sobre o projeto

Desenvolvido por **Lucas** para uso em bancada de reparo eletrônico.  
Repositório: [github.com/lucao019/assistente-bancada](https://github.com/lucao019/assistente-bancada)

Tecnologias usadas: Node.js · Electron · llama.cpp · Qwen2.5-VL · SQLite · Poppler · Tesseract
