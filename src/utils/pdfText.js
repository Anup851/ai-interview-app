import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export async function extractPdfText(file) {
  const bytes = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
  const pages = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (text) pages.push(text)
  }

  return pages.join('\n\n').trim()
}
