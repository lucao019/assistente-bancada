import fs from 'fs'
import fetch from 'node-fetch'

const LLAMA_URL = process.env.LLAMA_SERVER_URL

const SYSTEM_PROMPT = `Você é um técnico sênior especialista em reparo de celulares e eletrônica.
Ao analisar imagens de esquemáticos ou placas, siga estas regras:
- Seja direto e objetivo. Responda apenas o que foi perguntado.
- Nunca repita a mesma informação mais de uma vez.
- Se identificar componentes, cite cada um apenas uma vez.
- Se não conseguir identificar algo com certeza, diga claramente.
- Use termos técnicos corretos: tensões, trilhas, barramentos, ICs, etc.
- Limite sua resposta ao essencial. Qualidade > quantidade.`

/**
 * Envia uma imagem + pergunta para o modelo de visão (Qwen2.5-VL).
 */
export async function askAboutImage(imagePath, question, history = []) {
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = imageBuffer.toString('base64')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6), // mantém só as últimas 3 trocas para não lotar o contexto
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/png;base64,${base64Image}` }
        },
        { type: 'text', text: question }
      ]
    }
  ]

  const response = await fetch(`${LLAMA_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-vl',
      messages,
      max_tokens: 512,       // reduzido — respostas curtas e diretas
      temperature: 0.1,      // mais determinístico
      repeat_penalty: 1.3,   // penaliza repetição de tokens
      top_p: 0.9
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Erro do llama-server: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Envia só texto (sem imagem) — follow-up de conversa.
 */
export async function askText(question, history = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6),
    { role: 'user', content: question }
  ]

  const response = await fetch(`${LLAMA_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-vl',
      messages,
      max_tokens: 512,
      temperature: 0.1,
      repeat_penalty: 1.3,
      top_p: 0.9
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Erro do llama-server: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
