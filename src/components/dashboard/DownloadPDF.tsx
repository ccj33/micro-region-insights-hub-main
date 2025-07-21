import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Settings } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MicroRegionData } from "@/types/dashboard";
import { useState } from "react";

interface DownloadPDFProps {
  selectedData: MicroRegionData;
  data: MicroRegionData[];
  selectedMicroregiao: string;
}

interface SectionOption {
  id: string;
  label: string;
  checked: boolean;
}

export function DownloadPDF({ selectedData, data, selectedMicroregiao }: DownloadPDFProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<SectionOption[]>([
    { id: 'stats', label: 'Estatísticas Gerais', checked: true },
    { id: 'radar', label: 'Gráfico Radar (Comparação por Eixos)', checked: true },
    { id: 'bar', label: 'Gráfico de Barras (Ranking)', checked: true },
    { id: 'table', label: 'Tabela de Eixos', checked: true },
    { id: 'population', label: 'Gráfico de População', checked: true },
    { id: 'recommendations', label: 'Recomendações por Eixo', checked: true },
    { id: 'executive', label: 'Dashboard Executivo', checked: true },
    { id: 'advanced', label: 'Análise Avançada', checked: true },
    { id: 'eixos-detail', label: 'Detalhamento por Eixos de Maturidade', checked: true },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  const handleSelectAll = (checked: boolean) => {
    setSections(sections.map(section => ({ ...section, checked })));
  };

  const handleSectionChange = (id: string, checked: boolean) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, checked } : section
    ));
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const selectedSections = sections.filter(s => s.checked);
      if (selectedSections.length === 0) {
        alert('Selecione pelo menos uma seção para incluir no PDF.');
        setIsGenerating(false);
        return;
      }

      setGenerationProgress('Iniciando geração do PDF...');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let currentPage = 1;
      // Calcular total de páginas incluindo as páginas extras dos eixos
      const hasRecommendations = selectedSections.some(s => s.id === 'recommendations');
      const extraPages = hasRecommendations ? 7 : 0; // 7 páginas extras para os eixos
      const totalPages = selectedSections.length + 1 + extraPages;

      setGenerationProgress('Criando página de capa...');
      const coverPage = generateCoverPage();
      await addPageToPDF(pdf, coverPage, currentPage, totalPages);
      currentPage++;

      await new Promise(resolve => setTimeout(resolve, 500));

      for (const section of selectedSections) {
        try {
          setGenerationProgress(`Gerando seção: ${section.label}...`);
          
          let sectionContent = '';
          switch (section.id) {
            case 'stats':
              sectionContent = generateStatsPage();
              break;
            case 'radar':
              sectionContent = await generateRadarPage();
              break;
            case 'bar':
              sectionContent = await generateBarPage();
              break;
            case 'table':
              sectionContent = generateTablePage();
              break;
            case 'population':
              sectionContent = await generatePopulationPage();
              break;
            case 'recommendations':
              // Gerar uma página para cada eixo individualmente
              const eixos = [
                { nome: 'Gestão e Governança', valor: selectedData.eixo_1, situacao: selectedData.situacao_eixo_1, recomendacao: selectedData.recomendacao_eixo_1, ferramenta: selectedData.ferramenta_eixo_1 },
                { nome: 'Infraestrutura e Conectividade', valor: selectedData.eixo_2, situacao: selectedData.situacao_eixo_2, recomendacao: selectedData.recomendacao_eixo_2, ferramenta: selectedData.ferramenta_eixo_2 },
                { nome: 'Sistemas e Dados', valor: selectedData.eixo_3, situacao: selectedData.situacao_eixo_3, recomendacao: selectedData.recomendacao_eixo_3, ferramenta: selectedData.ferramenta_eixo_3 },
                { nome: 'Capacitação e Desenvolvimento', valor: selectedData.eixo_4, situacao: selectedData.situacao_eixo_4, recomendacao: selectedData.recomendacao_eixo_4, ferramenta: selectedData.ferramenta_eixo_4 },
                { nome: 'Serviços Digitais', valor: selectedData.eixo_5, situacao: selectedData.situacao_eixo_5, recomendacao: selectedData.recomendacao_eixo_5, ferramenta: selectedData.ferramenta_eixo_5 },
                { nome: 'Interoperabilidade', valor: selectedData.eixo_6, situacao: selectedData.situacao_eixo_6, recomendacao: selectedData.recomendacao_eixo_6, ferramenta: selectedData.ferramenta_eixo_6 },
                { nome: 'Segurança e Privacidade', valor: selectedData.eixo_7, situacao: selectedData.situacao_eixo_7, recomendacao: selectedData.recomendacao_eixo_7, ferramenta: selectedData.ferramenta_eixo_7 }
              ];
              
              // Primeiro, adicionar página de introdução
              const introPage = generateRecommendationsPage();
              await addPageToPDF(pdf, introPage, currentPage, totalPages + 6); // +6 para os 7 eixos
              currentPage++;
              
              // Depois, adicionar uma página para cada eixo
              for (let i = 0; i < eixos.length; i++) {
                setGenerationProgress(`Gerando página do Eixo ${i + 1}...`);
                const eixoPage = generateSingleEixoPage(eixos[i], i);
                await addPageToPDF(pdf, eixoPage, currentPage, totalPages + 6);
                currentPage++;
                await new Promise(resolve => setTimeout(resolve, 300));
              }
              continue; // Pular o processamento normal desta seção
            case 'executive':
              sectionContent = generateExecutivePage();
              break;
            case 'advanced':
              sectionContent = generateAdvancedPage();
              break;
            case 'eixos-detail':
              sectionContent = generateEixosDetailPage();
              break;
          }
          
          if (sectionContent) {
            setGenerationProgress(`Adicionando página ${currentPage} de ${totalPages}...`);
            await addPageToPDF(pdf, sectionContent, currentPage, totalPages);
            currentPage++;
          }
        } catch (error) {
          console.error(`Erro ao processar seção ${section.id}:`, error);
        }
      }

      setGenerationProgress('Finalizando e salvando PDF...');
      const fileName = `relatorio-maturidade-${selectedData.microrregiao.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      setGenerationProgress('PDF gerado com sucesso!');
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress('');
        setIsOpen(false);
      }, 800);

    } catch (error) {
      console.error('Erro geral:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
      setGenerationProgress('Erro na geração do PDF');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const addPageToPDF = async (pdf: jsPDF, content: string, currentPage: number, totalPages: number) => {
    const pageElement = document.createElement('div');
    pageElement.style.width = '210mm';
    pageElement.style.padding = '15mm'; // Reduzido para mais espaço
    pageElement.style.backgroundColor = 'white';
    pageElement.style.fontFamily = 'Arial, sans-serif';
    pageElement.style.fontSize = '11px'; // Reduzido para caber mais
    pageElement.style.lineHeight = '1.4'; // Reduzido para caber mais
    pageElement.style.position = 'absolute';
    pageElement.style.left = '-9999px';
    pageElement.style.top = '0';
    pageElement.style.color = '#000';
    pageElement.style.boxSizing = 'border-box';

    pageElement.innerHTML = content;
    document.body.appendChild(pageElement);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(pageElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pageElement.scrollWidth,
        height: pageElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // **SOLUÇÃO CRIATIVA: Sempre dividir em páginas menores para evitar cortes**
      const maxHeightPerPage = pageHeight * 0.9; // 90% da página para margem
      const numPages = Math.ceil(imgHeight / maxHeightPerPage);
      
      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const sourceY = i * (canvas.height / numPages);
        const sourceHeight = canvas.height / numPages;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        
        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const tempImgData = tempCanvas.toDataURL('image/png');
          const tempImg = new Image();
          
          await new Promise((resolve) => {
            tempImg.onload = () => {
              const tempImgHeight = (tempImg.height * imgWidth) / tempImg.width;
              pdf.addImage(tempImg, 'PNG', 0, 0, imgWidth, Math.min(tempImgHeight, maxHeightPerPage));
              resolve(true);
            };
            tempImg.src = tempImgData;
          });
        }
      }

    } catch (error) {
      console.error('Erro ao adicionar página ao PDF:', error);
    } finally {
      document.body.removeChild(pageElement);
    }
  };

  const generateCoverPage = () => `
    <div style="text-align: center; padding-top: 60px;">
      <h1 style="color: #1e40af; font-size: 32px; margin-bottom: 30px; font-weight: bold;">
        Relatório de Maturidade Digital
      </h1>
      <h2 style="color: #374151; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin: 40px 0;">
        <p style="color: #6b7280; font-size: 18px; margin-bottom: 15px;">
          <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}
        </p>
        <p style="color: #6b7280; font-size: 18px; margin-bottom: 15px;">
          <strong>Índice Geral:</strong> ${parseFloat(String(selectedData.indice_geral).replace(',', '.')).toFixed(3)}
        </p>
        <p style="color: #6b7280; font-size: 18px;">
          <strong>Status:</strong> ${getStatusText(selectedData.indice_geral)}
        </p>
      </div>
      <p style="color: #6b7280; font-size: 16px; margin-top: 40px;">
        Gerado pelo Sistema de Monitoramento Regional
      </p>
    </div>
  `;

  const generateHeaderSection = () => `
    <div style="margin-bottom: 20px; page-break-inside: avoid;">
      <h3 style="color: #1e40af; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #1e40af; padding-bottom: 3px;">
        Informações Detalhadas da Microrregião
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; margin-bottom: 15px;">
        <div style="background-color: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong>Macrorregião:</strong> ${selectedData.macrorregiao}
        </div>
        <div style="background-color: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong>Regional de Saúde:</strong> ${selectedData.regional_saude}
        </div>
        <div style="background-color: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong>Analista:</strong> ${selectedData.analista}
          ${selectedData.email_analista ? `<br/><small>${selectedData.email_analista}</small>` : ''}
        </div>
        <div style="background-color: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong>População:</strong> ${selectedData.populacao} habitantes
        </div>
        <div style="background-color: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong>IDH:</strong> ${selectedData.idh_completo}
        </div>
        <div style="background-color: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong>Classificação INMSD:</strong> ${selectedData.classificacao_inmsd}
        </div>
      </div>

      <div style="margin-top: 10px; background-color: #eff6ff; padding: 15px; border-radius: 4px; text-align: center; border: 2px solid #1e40af;">
        <strong style="color: #1e40af; font-size: 18px;">
          Índice Geral de Maturidade Digital: ${parseFloat(String(selectedData.indice_geral).replace(',', '.')).toFixed(3)}
        </strong>
      </div>
    </div>
  `;

  const generateStatsSection = () => `
    <div style="margin-bottom: 20px; page-break-inside: avoid;">
      <h3 style="color: #1e40af; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #1e40af; padding-bottom: 3px;">
        Estatísticas Gerais
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; font-size: 11px;">
        <div style="background-color: #f0f9ff; padding: 10px; border-radius: 4px; text-align: center; border-left: 4px solid #1e40af;">
          <div style="font-size: 18px; font-weight: bold; color: #1e40af;">${data.length}</div>
          <div style="font-size: 10px; color: #6b7280;">Total de Microrregiões</div>
        </div>
        <div style="background-color: #f0f9ff; padding: 10px; border-radius: 4px; text-align: center; border-left: 4px solid #1e40af;">
          <div style="font-size: 18px; font-weight: bold; color: #1e40af;">${data.reduce((sum, item) => sum + parseInt(String(item.populacao).replace(/\./g, '')), 0).toLocaleString('pt-BR')}</div>
          <div style="font-size: 10px; color: #6b7280;">População Total</div>
        </div>
        <div style="background-color: #f0f9ff; padding: 10px; border-radius: 4px; text-align: center; border-left: 4px solid #1e40af;">
          <div style="font-size: 18px; font-weight: bold; color: #1e40af;">${(data.reduce((sum, item) => sum + parseFloat(String(item.indice_geral).replace(',', '.')), 0) / data.length).toFixed(3)}</div>
          <div style="font-size: 10px; color: #6b7280;">Maturidade Média</div>
        </div>
        <div style="background-color: #f0f9ff; padding: 10px; border-radius: 4px; text-align: center; border-left: 4px solid #1e40af;">
          <div style="font-size: 18px; font-weight: bold; color: #1e40af;">${data.sort((a, b) => parseFloat(String(b.indice_geral).replace(',', '.')) - parseFloat(String(a.indice_geral).replace(',', '.'))).findIndex(item => item.microrregiao === selectedData.microrregiao) + 1}º</div>
          <div style="font-size: 10px; color: #6b7280;">Posição no Ranking</div>
        </div>
      </div>
    </div>
  `;

  const generateRecommendationsSection = () => {
    const eixos = [
      { nome: 'Gestão e Governança', valor: selectedData.eixo_1, situacao: selectedData.situacao_eixo_1, recomendacao: selectedData.recomendacao_eixo_1, ferramenta: selectedData.ferramenta_eixo_1 },
      { nome: 'Infraestrutura e Conectividade', valor: selectedData.eixo_2, situacao: selectedData.situacao_eixo_2, recomendacao: selectedData.recomendacao_eixo_2, ferramenta: selectedData.ferramenta_eixo_2 },
      { nome: 'Sistemas e Dados', valor: selectedData.eixo_3, situacao: selectedData.situacao_eixo_3, recomendacao: selectedData.recomendacao_eixo_3, ferramenta: selectedData.ferramenta_eixo_3 },
      { nome: 'Capacitação e Desenvolvimento', valor: selectedData.eixo_4, situacao: selectedData.situacao_eixo_4, recomendacao: selectedData.recomendacao_eixo_4, ferramenta: selectedData.ferramenta_eixo_4 },
      { nome: 'Serviços Digitais', valor: selectedData.eixo_5, situacao: selectedData.situacao_eixo_5, recomendacao: selectedData.recomendacao_eixo_5, ferramenta: selectedData.ferramenta_eixo_5 },
      { nome: 'Interoperabilidade', valor: selectedData.eixo_6, situacao: selectedData.situacao_eixo_6, recomendacao: selectedData.recomendacao_eixo_6, ferramenta: selectedData.ferramenta_eixo_6 },
      { nome: 'Segurança e Privacidade', valor: selectedData.eixo_7, situacao: selectedData.situacao_eixo_7, recomendacao: selectedData.recomendacao_eixo_7, ferramenta: selectedData.ferramenta_eixo_7 }
    ];

    return `
      <div style="margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h3 style="color: white; font-size: 16px; margin: 0; font-weight: bold;">
            📋 Recomendações por Eixo de Maturidade Digital
          </h3>
          <p style="color: white; font-size: 12px; margin: 5px 0 0 0;">
            Microrregião: ${selectedData.microrregiao}
          </p>
        </div>
        
        <div style="margin-top: 25px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="color: #1e40af; font-size: 14px; margin-bottom: 12px;">Como usar estas recomendações:</h4>
          <div style="font-size: 11px; line-height: 1.6; color: #374151;">
            <p style="margin: 6px 0;"><strong>🎯 Priorização:</strong> Foque primeiro nos eixos com menor pontuação</p>
            <p style="margin: 6px 0;"><strong>📈 Evolução:</strong> As recomendações são baseadas no nível atual de maturidade</p>
            <p style="margin: 6px 0;"><strong>🔄 Iterativo:</strong> Implemente gradualmente e monitore o progresso</p>
            <p style="margin: 6px 0;"><strong>🤝 Colaboração:</strong> Envolva diferentes setores na implementação</p>
          </div>
        </div>
      </div>
    `;
  };

  const generateSingleEixoPage = (eixo: any, index: number) => {
    return `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1e40af; font-size: 22px; margin-bottom: 12px; font-weight: bold;">
          Eixo ${index + 1} - ${eixo.nome}
        </h1>
        <h2 style="color: #374151; font-size: 16px; margin-bottom: 8px;">
          Microrregião: ${selectedData.microrregiao}
        </h2>
      </div>
      
      ${generateHeaderSection()}
      
      <div style="margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 12px; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
          <span>Eixo ${index + 1} – ${eixo.nome}</span>
          <span style="background-color: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 3px; font-size: 11px;">${parseFloat(String(eixo.valor).replace(',', '.')).toFixed(3)}</span>
        </div>
        
        <div style="padding: 15px; font-size: 11px;">
          
          <!-- Situação Atual -->
          <div style="margin-bottom: 15px; background-color: #fef3c7; padding: 12px; border-radius: 5px; border-left: 3px solid #f59e0b;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="background-color: #f59e0b; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 8px;">!</span>
              <strong style="color: #92400e; font-size: 12px;">Situação Atual</strong>
            </div>
            <p style="margin: 0; line-height: 1.5; color: #78350f; font-size: 10px;">${eixo.situacao || 'Informação não disponível'}</p>
          </div>
          
          <!-- Recomendação -->
          <div style="margin-bottom: 15px; background-color: #dbeafe; padding: 12px; border-radius: 5px; border-left: 3px solid #3b82f6;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="background-color: #3b82f6; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 8px;">→</span>
              <strong style="color: #1e40af; font-size: 12px;">Recomendação</strong>
            </div>
            <div style="line-height: 1.5; color: #1e3a8a; font-size: 10px;">
              ${eixo.recomendacao ? eixo.recomendacao.split('\n').map((line: string, idx: number) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('**')) {
                  return `<div style="margin: 8px 0; padding: 8px; background-color: rgba(59,130,246,0.1); border-radius: 3px; font-weight: bold; border-left: 2px solid #3b82f6;">${trimmedLine.replace(/\*\*/g, '')}</div>`;
                } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                  return `<div style="margin: 4px 0; padding-left: 15px; position: relative;"><span style="position: absolute; left: 0; color: #3b82f6;">•</span>${trimmedLine.substring(1)}</div>`;
                } else if (trimmedLine.match(/^\d+\./)) {
                  return `<div style="margin: 6px 0; font-weight: bold; color: #1e40af;">${trimmedLine}</div>`;
                } else if (trimmedLine.length > 0) {
                  return `<p style="margin: 4px 0;">${trimmedLine}</p>`;
                }
                return '';
              }).join('') : 'Informação não disponível'}
            </div>
          </div>
          
          <!-- Ferramenta Sugerida -->
          <div style="background-color: #d1fae5; padding: 12px; border-radius: 5px; border-left: 3px solid #10b981;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="background-color: #10b981; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 8px;">✓</span>
              <strong style="color: #065f46; font-size: 12px;">Ferramenta Sugerida</strong>
            </div>
            <p style="margin: 0; line-height: 1.5; color: #064e3b; font-size: 10px;">${eixo.ferramenta || 'Informação não disponível'}</p>
          </div>
          
        </div>
      </div>
    `;
  };

  const getStatusText = (valor: string): string => {
    const num = parseFloat(String(valor).replace(',', '.'));
    if (num >= 0.7) return 'Consolidado';
    if (num >= 0.4) return 'Em Evolução';
    return 'Inicial';
  };

  const generateStatsPage = () => `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
        Estatísticas Gerais
      </h1>
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    ${generateHeaderSection()}
    ${generateStatsSection()}
  `;

  const generateRadarPage = async () => `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
        Análise de Maturidade por Eixos
      </h1>
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    ${generateHeaderSection()}
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Gráfico Radar</h3>
      <p style="font-size: 14px; line-height: 1.8; color: #374151;">
        Esta seção mostra o gráfico radar comparando os 7 eixos de maturidade digital.
      </p>
    </div>
  `;

  const generateBarPage = async () => `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
        Ranking do Índice Geral
      </h1>
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    ${generateHeaderSection()}
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Gráfico de Barras</h3>
      <p style="font-size: 14px; line-height: 1.8; color: #374151;">
        Esta seção mostra o ranking das microrregiões por índice de maturidade.
      </p>
    </div>
  `;

  const generateTablePage = () => `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
        Tabela Detalhada por Eixos
      </h1>
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    ${generateHeaderSection()}
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Tabela de Eixos</h3>
      <p style="font-size: 14px; line-height: 1.8; color: #374151;">
        Esta seção mostra a tabela detalhada com os valores de cada eixo.
      </p>
    </div>
  `;

  const generatePopulationPage = async () => `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
        Análise Demográfica
      </h1>
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    ${generateHeaderSection()}
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Gráfico de População</h3>
      <p style="font-size: 14px; line-height: 1.8; color: #374151;">
        Esta seção mostra o gráfico de distribuição populacional.
      </p>
    </div>
  `;

  const generateRecommendationsPage = () => `
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 15px; font-weight: bold;">
        📋 Recomendações por Eixo de Maturidade Digital
      </h1>
      <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    
    ${generateHeaderSection()}
    
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Como usar estas recomendações:</h3>
      <div style="font-size: 14px; line-height: 1.8; color: #374151;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af;">
            <p style="margin: 0;"><strong>🎯 Priorização:</strong> Foque primeiro nos eixos com menor pontuação</p>
          </div>
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af;">
            <p style="margin: 0;"><strong>📈 Evolução:</strong> As recomendações são baseadas no nível atual de maturidade</p>
          </div>
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af;">
            <p style="margin: 0;"><strong>🔄 Iterativo:</strong> Implemente gradualmente e monitore o progresso</p>
          </div>
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e40af;">
            <p style="margin: 0;"><strong>🤝 Colaboração:</strong> Envolva diferentes setores na implementação</p>
          </div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;">
      <h4 style="color: #0c4a6e; font-size: 16px; margin-bottom: 12px;">📄 Estrutura do Relatório:</h4>
      <div style="font-size: 13px; line-height: 1.6; color: #0c4a6e;">
        <p style="margin: 6px 0;"><strong>Página 1:</strong> Capa do relatório</p>
        <p style="margin: 6px 0;"><strong>Página 2:</strong> Introdução e orientações (esta página)</p>
        <p style="margin: 6px 0;"><strong>Páginas 3-9:</strong> Um eixo por página com recomendações detalhadas</p>
      </div>
    </div>
  `;

  const generateExecutivePage = () => {
    const indiceGeral = parseFloat(String(selectedData.indice_geral).replace(',', '.'));
    const classification = indiceGeral >= 0.8 ? 'Consolidado' : indiceGeral >= 0.5 ? 'Em Evolução' : indiceGeral >= 0.2 ? 'Emergente' : 'Inicial';
    
    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
          Dashboard Executivo
        </h1>
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
          Microrregião: ${selectedData.microrregiao}
        </h2>
      </div>
      ${generateHeaderSection()}
      
      <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Resumo Executivo</h3>
        <div style="font-size: 14px; line-height: 1.8; color: #374151;">
          <p><strong>Índice Geral de Maturidade:</strong> ${(indiceGeral * 100).toFixed(1)}%</p>
          <p><strong>Classificação:</strong> ${classification}</p>
          <p><strong>Status:</strong> ${selectedData.microrregiao} está em processo de evolução digital</p>
        </div>
      </div>
    `;
  };

  const generateAdvancedPage = () => `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
        Análise Avançada
      </h1>
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
        Microrregião: ${selectedData.microrregiao}
      </h2>
    </div>
    ${generateHeaderSection()}
    
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Comparação entre Regiões</h3>
      <div style="font-size: 14px; line-height: 1.8; color: #374151;">
        <p><strong>Funcionalidade:</strong> Esta seção permite comparar ${selectedData.microrregiao} com outras microrregiões</p>
        <p><strong>Análise:</strong> Gráficos radar, barras e resumo executivo comparativo</p>
        <p><strong>Insights:</strong> Identificação de pontos fortes e oportunidades de melhoria</p>
      </div>
    </div>
  `;

  const generateEixosDetailPage = () => {
    const eixosNames = [
      'Gestão e Governança',
      'Infraestrutura e Conectividade', 
      'Sistemas e Dados',
      'Capacitação e Desenvolvimento',
      'Serviços Digitais',
      'Interoperabilidade',
      'Segurança e Privacidade'
    ];

    let eixosContent = '';
    for (let i = 1; i <= 7; i++) {
      const eixoKey = `eixo_${i}` as keyof MicroRegionData;
      const valor = parseFloat(String(selectedData[eixoKey]).replace(',', '.'));
      const status = valor >= 0.8 ? 'Avançado' : valor >= 0.5 ? 'Em Evolução' : valor >= 0.2 ? 'Emergente' : 'Inicial';
      const statusColor = valor >= 0.8 ? '#10b981' : valor >= 0.5 ? '#f59e0b' : valor >= 0.2 ? '#f97316' : '#ef4444';
      
      eixosContent += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
          <h4 style="color: #1e40af; font-size: 16px; margin-bottom: 10px; font-weight: bold;">
            Eixo ${i} - ${eixosNames[i-1]}
          </h4>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 14px; color: #374151;">Pontuação: <strong>${(valor * 100).toFixed(1)}%</strong></span>
            <span style="font-size: 14px; color: ${statusColor}; font-weight: bold;">${status}</span>
          </div>
          <div style="background-color: #f3f4f6; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${valor * 100}%; height: 100%; background-color: ${statusColor};"></div>
          </div>
        </div>
      `;
    }

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
          Detalhamento por Eixos de Maturidade
        </h1>
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">
          Microrregião: ${selectedData.microrregiao}
        </h2>
      </div>
      ${generateHeaderSection()}
      
      <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Análise Detalhada por Eixo</h3>
        ${eixosContent}
      </div>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white shadow-lg"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Relatório PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-blue-50 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Relatório PDF
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="select-all"
              checked={sections.every(s => s.checked)}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-semibold">
              Selecionar Todos
            </Label>
          </div>
          
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={section.id}
                  checked={section.checked}
                  onCheckedChange={(checked) => handleSectionChange(section.id, checked as boolean)}
                />
                <Label htmlFor={section.id} className="text-sm">
                  {section.label}
                </Label>
              </div>
            ))}
          </div>
          
          {isGenerating && (
            <div className="pt-2 text-center">
              <p className="text-sm text-blue-600 font-medium">{generationProgress}</p>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <Button 
              onClick={generatePDF}
              className="w-full"
              disabled={!sections.some(s => s.checked) || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 