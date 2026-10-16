import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execFileAsync = promisify(execFile)

const POPPLER_BIN = process.env.POPPLER_PATH
const CACHE_DIR   = process.env.CACHE_DIR

/**
 * Converte uma página do PDF em imagem PNG.
 * @param {string} pdfPath - Caminho absoluto para o PDF
 * @param {number} page    - Número da página (começa em 1)
 * @param {number} dpi     - Resolução da imagem (padrão 150)
 * @returns {Promise<string>} Caminho para o arquivo PNG gerado
 */
export async function pdfPageToImage(pdfPath, page, dpi = 150) {
  const pdftoppm = path.join(POPPLER_BIN, 'pdftoppm.exe')
  const prefix   = path.join(CACHE_DIR, `page-${Date.now()}`)

  await execFileAsync(pdftoppm, [
    '-r', String(dpi),
    '-f', String(page),
    '-l', String(page),
    '-png',
    pdfPath,
    prefix
  ])

  // pdftoppm gera o arquivo como <prefix>-01.png
  const paddedPage = String(page).padStart(2, '0')
  const outputPath = `${prefix}-${paddedPage}.png`

  if (!fs.existsSync(outputPath)) {
    throw new Error(`Imagem não gerada para página ${page}: ${outputPath}`)
  }

  return outputPath
}

/**
 * Retorna o número total de páginas do PDF.
 * @param {string} pdfPath
 * @returns {Promise<number>}
 */
export async function getPdfPageCount(pdfPath) {
  const pdfinfo = path.join(POPPLER_BIN, 'pdfinfo.exe')
  const { stdout } = await execFileAsync(pdfinfo, [pdfPath])

  const match = stdout.match(/Pages:\s+(\d+)/)
  if (!match) throw new Error('Não foi possível obter número de páginas')

  return parseInt(match[1], 10)
}
