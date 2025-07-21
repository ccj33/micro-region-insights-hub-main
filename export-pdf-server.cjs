const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3005;

// Exemplo: GET /export-pdf?url=http://localhost:5173
app.get('/export-pdf', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('URL do dashboard é obrigatória.');
  }
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // Aguarda o dashboard carregar completamente
    await page.waitForTimeout(2000);
    // Gera o PDF (A4, paisagem ou retrato conforme desejar)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' },
      landscape: false
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="dashboard-profissional.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).send('Erro ao gerar PDF: ' + err.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de exportação PDF rodando em http://localhost:${PORT}`);
}); 