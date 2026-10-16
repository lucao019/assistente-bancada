const { app, BrowserWindow, dialog } = require('electron')
const { spawn, fork }                = require('child_process')
const path                           = require('path')
const { createServer }               = require('net')

// Caminhos absolutos dos componentes externos
// Em desenvolvimento: __dirname = H:\IA\assistente-bancada
// Em produção (empacotado): process.resourcesPath aponta para resources/
const BASE = app.isPackaged
  ? path.join(process.resourcesPath, 'ia')
  : 'H:\\IA'

const LLAMA_SERVER = path.join(BASE, 'llama', 'llama-server.exe')
const MODEL_PATH   = path.join(BASE, 'models', 'qwen2.5-vl-3b', 'Qwen2.5-VL-3B-Instruct-Q4_K_M.gguf')
const MMPROJ_PATH  = path.join(BASE, 'models', 'qwen2.5-vl-3b', 'mmproj-Qwen2.5-VL-3B-Instruct-f16.gguf')

const APP_PORT   = 3000
const LLAMA_PORT = 8080

let mainWindow   = null
let llamaProcess = null
let appProcess   = null

// ── Aguarda porta ficar ocupada (serviço subiu) ───────────────────────────────
function waitForPort(port, timeout = 90000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      const sock = new (require('net').Socket)()
      sock.setTimeout(500)
      sock.connect(port, '127.0.0.1', () => {
        sock.destroy()
        resolve()
      })
      sock.on('error', () => {
        sock.destroy()
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout aguardando porta ${port}`))
        } else {
          setTimeout(check, 600)
        }
      })
      sock.on('timeout', () => {
        sock.destroy()
        setTimeout(check, 600)
      })
    }
    check()
  })
}

// ── Inicia o llama-server ─────────────────────────────────────────────────────
function startLlamaServer() {
  return new Promise((resolve, reject) => {
    console.log('BASE:', BASE)
    console.log('LLAMA_SERVER:', LLAMA_SERVER)
    console.log('MODEL_PATH:', MODEL_PATH)
    console.log('MMPROJ_PATH:', MMPROJ_PATH)

    // Verifica se os arquivos existem antes de tentar subir
    const fs = require('fs')
    for (const [nome, p] of [['llama-server', LLAMA_SERVER], ['modelo', MODEL_PATH], ['mmproj', MMPROJ_PATH]]) {
      if (!fs.existsSync(p)) {
        return reject(new Error(`Arquivo não encontrado (${nome}):\n${p}`))
      }
    }

    console.log('Iniciando llama-server...')

    llamaProcess = spawn(LLAMA_SERVER, [
      '-m', MODEL_PATH,
      '--mmproj', MMPROJ_PATH,
      '--port', String(LLAMA_PORT),
      '--image-min-tokens', '1024'
    ], { stdio: 'pipe' })

    llamaProcess.stderr.on('data', d => {
      const msg = d.toString()
      console.log('[llama]', msg.trim())
      if (msg.includes('listening')) resolve()
    })

    llamaProcess.on('error', err => reject(new Error(`Falha ao iniciar llama-server: ${err.message}`)))
    llamaProcess.on('exit', code => {
      if (code !== 0 && code !== null) {
        reject(new Error(`llama-server encerrou com código ${code}`))
      }
    })

    // Fallback: tenta detectar pela porta
    waitForPort(LLAMA_PORT, 120000).then(resolve).catch(reject)
  })
}

// ── Inicia o servidor Express (como processo filho) ───────────────────────────
function startExpressServer() {
  return new Promise((resolve, reject) => {
    const serverScript = app.isPackaged
      ? path.join(process.resourcesPath, 'app', 'src', 'server.js')
      : path.join(__dirname, 'src', 'server.js')

    const env = {
      ...process.env,
      LLAMA_SERVER_URL: `http://127.0.0.1:${LLAMA_PORT}`,
      MODELS_DIR:       path.join(BASE, 'models'),
      DOCUMENTS_DIR:    path.join(BASE, 'documents'),
      DB_PATH:          path.join(BASE, 'database', 'bancada.db'),
      CACHE_DIR:        path.join(BASE, 'cache'),
      TESSERACT_PATH:   path.join(BASE, 'ocr', 'tesseract.exe'),
      POPPLER_PATH:     path.join(BASE, 'poppler', 'poppler-26.09.0', 'Library', 'bin'),
      PORT:             String(APP_PORT)
    }

    appProcess = spawn(process.execPath, [serverScript], {
      env,
      stdio: 'pipe'
    })

    // Detecta subida pelo log ou pela porta
    appProcess.stdout.on('data', d => {
      if (d.toString().includes('rodando em')) resolve()
    })
    appProcess.on('error', reject)

    waitForPort(APP_PORT, 30000).then(resolve).catch(reject)
  })
}

// ── Splash screen ─────────────────────────────────────────────────────────────
function createSplash() {
  const splash = new BrowserWindow({
    width: 400,
    height: 240,
    frame: false,
    resizable: false,
    backgroundColor: '#141414',
    webPreferences: { nodeIntegration: false }
  })

  splash.loadURL(`data:text/html;charset=utf-8,<!DOCTYPE html>
<html><body style="margin:0;background:%23141414;display:flex;flex-direction:column;
align-items:center;justify-content:center;height:100vh;
font-family:'Segoe UI',sans-serif;color:%23e0e0e0;text-align:center">
<div style="font-size:2.5rem;margin-bottom:12px">🔧</div>
<div style="font-size:1.1rem;font-weight:600;margin-bottom:6px">Assistente de Bancada</div>
<div style="font-size:0.78rem;color:%23666">Carregando modelo de IA, aguarde...</div>
</body></html>`)

  return splash
}

// ── Janela principal ──────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Assistente de Bancada',
    backgroundColor: '#0f0f0f',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadURL(`http://127.0.0.1:${APP_PORT}`)
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  const splash = createSplash()

  try {
    await startLlamaServer()
    await startExpressServer()
    createMainWindow()
    splash.close()
  } catch (err) {
    splash.close()
    dialog.showErrorBox('Erro ao iniciar o Assistente de Bancada', err.message)
    app.quit()
  }
})

function cleanup() {
  if (llamaProcess) { llamaProcess.kill(); llamaProcess = null }
  if (appProcess)   { appProcess.kill();   appProcess   = null }
}

app.on('window-all-closed', () => { cleanup(); app.quit() })
app.on('before-quit', cleanup)
