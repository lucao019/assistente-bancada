import fs from 'fs'
import fetch from 'node-fetch'

const LLAMA_URL = process.env.LLAMA_SERVER_URL

/**
 * Envia uma imagem + pergunta para o modelo de visão (Qwen2.5-VL).
 * @param {string} imagePath  - Caminho absoluto para o PNG
 * @param {string} question   - Pergunta do técnico
 * @param {Array}  history    - Histórico de mensagens [{role, content}]
 * @returns {Promise<string>} Resposta do modelo
 */
export async function askAboutImage(imagePath, question, history = []) {
  // Converte imagem para base64
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = imageBuffer.toString('base64')

  // Monta mensagens: histórico + nova pergunta com imagem
  const messages = [
    {
      role: 'system',
      content: 'Você é um técnico especialista em eletrônica e reparo de celulares. ' +
               'Analise o esquemático ou imagem fornecida e responda de forma clara e objetiva, ' +
               'como um colega de bancada experiente. Use terminologia técnica mas explique quando necessário.'
    },
    ...history,
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/png;base64,${base64Image}` }
        },
        {
          type: 'text',
          text: question
        }
      ]
    }
  ]

  const response = await fetch(`${LLAMA_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-vl',
      messages,
      max_tokens: 1024,
      temperature: 0.2
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
 * Envia só texto (sem imagem) para o modelo — útil para perguntas de follow-up.
 * @param {string} question
 * @param {Array}  history
 * @returns {Promise<string>}
 */
export async function askText(question, history = []) {
  const messages = [
    {
      role: 'system',
      content: 'Você é um técnico especialista em eletrônica e reparo de celulares. ' +
               'Responda de forma clara e objetiva, como um colega de bancada experiente.'
    },
    ...history,
    { role: 'user', content: question }
  ]

  const response = await fetch(`${LLAMA_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-vl',
      messages,
      max_tokens: 1024,
      temperature: 0.2
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Erro do llama-server: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
