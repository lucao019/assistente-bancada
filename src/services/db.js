import { createRequire } from 'module'
import path from 'path'
import fs from 'fs'

const require = createRequire(import.meta.url)
const initSqlJs = require('sql.js')

const DB_PATH = process.env.DB_PATH || 'H:\\IA\\database\\bancada.db'
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

// sql.js é assíncrono — inicializa uma vez e exporta uma Promise
let _db = null

async function getDb() {
  if (_db) return _db

  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    _db = new SQL.Database(fileBuffer)
  } else {
    _db = new SQL.Database()
  }

  // Schema
  _db.run(`
    CREATE TABLE IF NOT EXISTS aparelhos (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      modelo    TEXT DEFAULT '',
      notas     TEXT DEFAULT '',
      criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      aberto_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS conversas (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      aparelho_id INTEGER NOT NULL,
      role        TEXT NOT NULL,
      content     TEXT NOT NULL,
      tem_imagem  INTEGER NOT NULL DEFAULT 0,
      criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `)

  salvarDisco()
  return _db
}

// Persiste o banco em disco após cada escrita
function salvarDisco() {
  if (!_db) return
  try {
    const data = _db.export()
    fs.writeFileSync(DB_PATH, Buffer.from(data))
  } catch (e) {
    console.error('Erro ao salvar banco:', e.message)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function queryAll(db, sql, params = []) {
  const stmt   = db.prepare(sql)
  const rows   = []
  stmt.bind(params)
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function queryOne(db, sql, params = []) {
  return queryAll(db, sql, params)[0] || null
}

function run(db, sql, params = []) {
  db.run(sql, params)
  salvarDisco()
  return db
}

// ── Aparelhos ─────────────────────────────────────────────────────────────────

export async function listarAparelhos() {
  const db = await getDb()
  return queryAll(db, `
    SELECT a.*, COUNT(c.id) as total_msgs
    FROM aparelhos a
    LEFT JOIN conversas c ON c.aparelho_id = a.id
    GROUP BY a.id
    ORDER BY a.aberto_em DESC
  `)
}

export async function criarAparelho(nome, modelo = '', notas = '') {
  const db = await getDb()
  run(db, `INSERT INTO aparelhos (nome, modelo, notas) VALUES (?, ?, ?)`, [nome, modelo, notas])
  const ap = queryOne(db, `SELECT * FROM aparelhos ORDER BY id DESC LIMIT 1`)
  return ap
}

export async function buscarAparelho(id) {
  const db = await getDb()
  return queryOne(db, `SELECT * FROM aparelhos WHERE id = ?`, [id])
}

export async function atualizarAbertura(id) {
  const db = await getDb()
  run(db, `UPDATE aparelhos SET aberto_em = datetime('now', 'localtime') WHERE id = ?`, [id])
}

export async function deletarAparelho(id) {
  const db = await getDb()
  run(db, `DELETE FROM conversas WHERE aparelho_id = ?`, [id])
  run(db, `DELETE FROM aparelhos WHERE id = ?`, [id])
}

// ── Conversas ─────────────────────────────────────────────────────────────────

export async function salvarMensagem(aparelhoId, role, content, temImagem = false) {
  const db = await getDb()
  run(db, `
    INSERT INTO conversas (aparelho_id, role, content, tem_imagem)
    VALUES (?, ?, ?, ?)
  `, [aparelhoId, role, content, temImagem ? 1 : 0])
}

export async function carregarConversa(aparelhoId, limite = 60) {
  const db = await getDb()
  const rows = queryAll(db, `
    SELECT * FROM conversas
    WHERE aparelho_id = ?
    ORDER BY id DESC
    LIMIT ?
  `, [aparelhoId, limite])
  return rows.reverse()
}

export async function limparConversa(aparelhoId) {
  const db = await getDb()
  run(db, `DELETE FROM conversas WHERE aparelho_id = ?`, [aparelhoId])
}
