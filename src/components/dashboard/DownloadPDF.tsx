import { useState } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const SECTION_CONFIG = [
  { id: "stats", label: "Estatísticas Gerais", selector: '[data-section="stats"]' },
  { id: "radar", label: "Gráfico Radar (Comparação por Eixos)", selector: '[data-section="radar"]' },
  { id: "bar", label: "Gráfico de Barras (Ranking)", selector: '[data-section="bar"]' },
  { id: "table", label: "Tabela de Eixos", selector: '[data-section="table"]' },
  { id: "population", label: "Gráfico de População", selector: '[data-section="population"]' },
  { id: "recommendations", label: "Recomendações por Eixo", selector: '[data-section="recommendations"]' },
  { id: "executive", label: "Dashboard Executivo", selector: '[data-section="executive"]' },
  { id: "advanced", label: "Análise Avançada", selector: '[data-section="advanced"]' },
  { id: "eixos-detail", label: "Detalhamento por Eixos de Maturidade", selector: '[data-section="eixos-detail"]' },
];

function createHeaderDOM({ microrregiao, indice }) {
  const header = document.createElement('div');
  header.style.width = '100%';
  header.style.background = '#f1f5f9';
  header.style.padding = '10px 0 8px 0';
  header.style.borderBottom = '1px solid #e5e7eb';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.innerHTML = `
    <div style="font-size: 15px; color: #1e40af; font-weight: bold; margin-left: 18px;">Microrregião: ${microrregiao}</div>
    <div style="font-size: 14px; color: #374151; margin-right: 18px;">Índice Geral: <span style="color: #2563eb; font-weight: bold;">${indice}</span></div>
  `;
  return header;
}

function generateCoverPage({ microrregiao }) {
  return `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0;">
      <h1 style="color: #1e40af; font-size: 32px; font-weight: bold; margin-bottom: 30px;">Relatório de Maturidade Digital</h1>
      <h2 style="color: #374151; font-size: 22px; font-weight: bold; margin-bottom: 20px;">Microrregião: ${microrregiao}</h2>
      <div style="background: #f8fafc; padding: 30px 40px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 18px; margin-bottom: 10px;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      <p style="color: #6b7280; font-size: 16px; margin-top: 40px;">Gerado pelo Sistema de Monitoramento Regional</p>
    </div>
  `;
}

export function DownloadPDF({ microrregiao = 'NÃO DEFINIDO', indice = '---' }) {
  const [selected, setSelected] = useState(SECTION_CONFIG.map(s => s.id));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleAll = () => {
    if (selected.length === SECTION_CONFIG.length) setSelected([]);
    else setSelected(SECTION_CONFIG.map(s => s.id));
  };
  const toggleSection = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  // Função para adicionar uma página HTML ao PDF
  const addHtmlPageToPDF = async (pdf, html, isCover = false) => {
    const pageElement = document.createElement('div');
    pageElement.style.width = '210mm';
    pageElement.style.minHeight = '297mm';
    pageElement.style.backgroundColor = 'white';
    pageElement.style.fontFamily = 'Arial, sans-serif';
    pageElement.style.fontSize = '13px';
    pageElement.style.lineHeight = '1.5';
    pageElement.style.position = 'absolute';
    pageElement.style.left = '-9999px';
    pageElement.style.top = '0';
    pageElement.innerHTML = html;
    document.body.appendChild(pageElement);
    await new Promise(res => setTimeout(res, 200));
    const canvas = await html2canvas(pageElement, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let imgWidth = pdfWidth - 20;
    let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    if (imgHeight > pdfHeight - 20) {
      imgHeight = pdfHeight - 20;
      imgWidth = (imgProps.width * imgHeight) / imgProps.height;
    }
    if (!isCover) pdf.addPage();
    pdf.addImage(imgData, "PNG", (pdfWidth - imgWidth) / 2, 10, imgWidth, imgHeight);
    document.body.removeChild(pageElement);
  };

  // Função para adicionar cabeçalho + bloco como imagens separadas
  const addHeaderAndBlockToPDF = async (pdf, headerProps, el) => {
    // Cabeçalho
    const headerDiv = createHeaderDOM(headerProps);
    document.body.appendChild(headerDiv);
    await new Promise(res => setTimeout(res, 100));
    const headerCanvas = await html2canvas(headerDiv, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    document.body.removeChild(headerDiv);
    // Bloco
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise(res => setTimeout(res, 700));
    const blockCanvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    // Adiciona ao PDF
    pdf.addPage();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    // Cabeçalho
    const headerImg = headerCanvas.toDataURL("image/png");
    const headerPropsImg = pdf.getImageProperties(headerImg);
    const headerHeight = 20;
    pdf.addImage(headerImg, "PNG", 10, 10, pdfWidth - 20, headerHeight);
    // Bloco
    const blockImg = blockCanvas.toDataURL("image/png");
    const blockPropsImg = pdf.getImageProperties(blockImg);
    let blockWidth = pdfWidth - 20;
    let blockHeight = (blockPropsImg.height * blockWidth) / blockPropsImg.width;
    if (blockHeight > pdfHeight - 30 - headerHeight) {
      blockHeight = pdfHeight - 30 - headerHeight;
      blockWidth = (blockPropsImg.width * blockHeight) / blockPropsImg.height;
    }
    pdf.addImage(blockImg, "PNG", 10, 10 + headerHeight + 5, blockWidth, blockHeight);
  };

  const handleExport = async () => {
    setLoading(true);
    setProgress("Gerando capa...");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // CAPA
    const capaHtml = generateCoverPage({ microrregiao });
    await addHtmlPageToPDF(pdf, capaHtml, true);
    for (const section of SECTION_CONFIG) {
      if (!selected.includes(section.id)) continue;
      setProgress(`Capturando: ${section.label}`);
      const el = document.querySelector(section.selector) as HTMLElement;
      if (!el) continue;
      await addHeaderAndBlockToPDF(pdf, { microrregiao, indice }, el);
    }
    setProgress("Finalizando...");
    pdf.save("relatorio-dashboard.pdf");
    setLoading(false);
    setProgress("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg" size="lg">
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-blue-50 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configurar Relatório PDF
          </DialogTitle>
          <DialogDescription>
            Selecione as seções que deseja incluir no relatório PDF da microrregião. Marque ou desmarque as opções conforme sua necessidade antes de gerar o arquivo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={selected.length === SECTION_CONFIG.length} onChange={toggleAll} />
            <span className="font-semibold">Selecionar Todos</span>
          </div>
          <div className="space-y-3">
            {SECTION_CONFIG.map(section => (
              <div key={section.id} className="flex items-center space-x-2">
                <input type="checkbox" checked={selected.includes(section.id)} onChange={() => toggleSection(section.id)} />
                <span className="text-sm">{section.label}</span>
              </div>
            ))}
          </div>
          {loading && (
            <div className="pt-2 text-center">
              <p className="text-sm text-blue-600 font-medium">{progress}</p>
            </div>
          )}
          <div className="pt-4 border-t space-y-2">
            <Button onClick={handleExport} className="w-full" disabled={loading || selected.length === 0}>
              {loading ? "Gerando PDF..." : "Exportar PDF"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center mt-2">
            <b>Dica:</b> Expanda todas as caixas e role até o final do dashboard antes de exportar.<br />
            O PDF será gerado exatamente como está visível na tela.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 