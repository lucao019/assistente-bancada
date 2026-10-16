import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import { pdfPageToImage, getPdfPageCount } from './services/pdf.js'
import { askAboutImage, askText } from './services/llm.js'
import {
  listarAparelhos, criarAparelho, buscarAparelho,
  atualizarAbertura, deletarAparelho,
  salvarMensagem, carregarConversa, limparConversa
} from './services/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3000

const upload = multer({ dest: process.env.CACHE_DIR })

// Sessões ativas em memória
// { sessionId: { aparelhoId?, imagePath?, pdfPath?, pageCount?, history[] } }
const sessions = {}

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

// ─── Aparelhos ────────────────────────────────────────────────────────────────

app.get('/api/aparelhos', async (req, res) => {
  try { res.json(await listarAparelhos()) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/aparelhos', async (req, res) => {
  try {
    const { nome, modelo, notas } = req.body
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })
    const aparelho  = await criarAparelho(nome, modelo || '', notas || '')
    const sessionId = `sess-${Date.now()}`
    sessions[sessionId] = { aparelhoId: aparelho.id, history: [] }
    res.json({ aparelho, sessionId })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/aparelhos/:id/abrir', async (req, res) => {
  try {
    const aparelho = await buscarAparelho(req.params.id)
    if (!aparelho) return res.status(404).json({ error: 'Aparelho não encontrado' })
    await atualizarAbertura(aparelho.id)
    const msgs    = await carregarConversa(aparelho.id)
    const history = msgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    const sessionId = `sess-${Date.now()}`
    sessions[sessionId] = { aparelhoId: aparelho.id, history }
    res.json({ aparelho, sessionId, history: msgs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/api/aparelhos/:id', async (req, res) => {
  try { await deletarAparelho(req.params.id); res.json({ ok: true }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/api/aparelhos/:id/conversa', async (req, res) => {
  try {
    await limparConversa(req.params.id)
    for (const sess of Object.values(sessions)) {
      if (sess.aparelhoId == req.params.id) sess.history = []
    }
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─── Upload imagem ────────────────────────────────────────────────────────────

app.post('/api/image/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' })

    const ext     = (req.file.originalname.match(/\.(png|jpe?g|webp)$/i) || ['.png'])[0]
    const imgPath = req.file.path + ext
    fs.renameSync(req.file.path, imgPath)

    // sessionId vem como campo do FormData
    const sid = req.body.sessionId

    if (sid && sessions[sid]) {
      sessions[sid].imagePath = imgPath
      console.log(`[upload] imagem associada à sessão ${sid}: ${imgPath}`)
      res.json({ ok: true, sessionId: sid })
    } else {
      const newSid = `sess-${Date.now()}`
      sessions[newSid] = { imagePath: imgPath, history: [] }
      console.log(`[upload] nova sessão ${newSid}: ${imgPath}`)
      res.json({ ok: true, sessionId: newSid })
    }
  } catch (err) {
    console.error('[upload] erro:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Upload PDF ───────────────────────────────────────────────────────────────

app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    const pdfPath = req.file.path + '.pdf'
    fs.renameSync(req.file.path, pdfPath)
    const pageCount = await getPdfPageCount(pdfPath)
    const sid = req.body.sessionId

    if (sid && sessions[sid]) {
      sessions[sid].pdfPath   = pdfPath
      sessions[sid].pageCount = pageCount
      res.json({ ok: true, sessionId: sid, pageCount })
    } else {
      const newSid = `sess-${Date.now()}`
      sessions[newSid] = { pdfPath, pageCount, history: [] }
      res.json({ ok: true, sessionId: newSid, pageCount })
    }
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/pdf/:sessionId/page/:page/image', async (req, res) => {
  try {
    const session = sessions[req.params.sessionId]
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada' })
    const page = parseInt(req.params.page, 10)
    if (page < 1 || page > session.pageCount)
      return res.status(400).json({ error: `Página inválida` })
    const imagePath = await pdfPageToImage(session.pdfPath, page)
    res.sendFile(imagePath)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─── Chat ─────────────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, page, question } = req.body
    if (!question) return res.status(400).json({ error: 'Pergunta não informada' })

    const session = sessions[sessionId]
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada' })

    console.log(`[chat] sessão ${sessionId} | imagePath: ${session.imagePath} | pdfPath: ${session.pdfPath} | pergunta: ${question.substring(0,60)}`)

    let answer
    let temImagem = false

    if (page && session.pdfPath) {
      const imgPath = await pdfPageToImage(session.pdfPath, parseInt(page, 10))
      answer    = await askAboutImage(imgPath, question, session.history)
      temImagem = true
    } else if (session.imagePath) {
      answer    = await askAboutImage(session.imagePath, question, session.history)
      temImagem = true
    } else {
      answer = await askText(question, session.history)
    }

    session.history.push({ role: 'user',      content: question })
    session.history.push({ role: 'assistant', content: answer   })

    if (session.aparelhoId) {
      await salvarMensagem(session.aparelhoId, 'user',      question, temImagem)
      await salvarMensagem(session.aparelhoId, 'assistant', answer,   false)
    }

    res.json({ answer })
  } catch (err) {
    console.error('[chat] erro:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Assistente de Bancada rodando em http://localhost:${PORT}`)
})
