import * as XLSX from 'xlsx';
import { MicroRegionData } from '@/types/dashboard';

export async function readExcelFile(): Promise<MicroRegionData[]> {
  try {
    // Tentar carregar o arquivo Excel da pasta public
    const response = await fetch('/database.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    
    // Ler o arquivo Excel
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Primeira planilha
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Pular o cabeçalho (primeira linha)
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];
    
    // Mapear os dados para o formato correto
    const mappedData: MicroRegionData[] = rows.map((row, index) => {
      const rowData: any = {};
      
      // Mapear cada coluna baseado no cabeçalho
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        if (value !== undefined && value !== null) {
          rowData[header.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      });
      
      // Garantir que todos os campos obrigatórios existam
      return {
        microrregiao: rowData.microrregiao || `Microrregião ${index + 1}`,
        macrorregiao: rowData.macrorregiao || 'Não informado',
        regional_saude: rowData.regional_saude || 'Não informado',
        analista: rowData.analista || 'Não informado',
        email_analista: rowData.email_analista || '',
        populacao: String(rowData.populacao || 0),
        idh_completo: rowData.idh_completo || '0.000',
        idh_valor: rowData.idh_valor || '0.000',
        idh_classificacao: rowData.idh_classificacao || 'Não informado',
        classificacao_inmsd: rowData.classificacao_inmsd || 'Não informado',
        indice_geral: rowData.indice_geral || '0.000',
        eixo_1: rowData.eixo_1 || '0.000',
        eixo_2: rowData.eixo_2 || '0.000',
        eixo_3: rowData.eixo_3 || '0.000',
        eixo_4: rowData.eixo_4 || '0.000',
        eixo_5: rowData.eixo_5 || '0.000',
        eixo_6: rowData.eixo_6 || '0.000',
        eixo_7: rowData.eixo_7 || '0.000',
        ponto_focal: rowData.ponto_focal || 'Não informado',
        email_ponto_focal: rowData.email_ponto_focal || '',
        municipios: rowData.municipios || 'Não informado',
        macro_micro: rowData.macro_micro || 'Não informado',
        status_inmsd: rowData.status_inmsd || 'Não informado',
        pontuacao_geral: rowData.pontuacao_geral || '0.000',
        situacao_eixo_1: rowData.situacao_eixo_1 || 'Não informado',
        situacao_eixo_2: rowData.situacao_eixo_2 || 'Não informado',
        situacao_eixo_3: rowData.situacao_eixo_3 || 'Não informado',
        situacao_eixo_4: rowData.situacao_eixo_4 || 'Não informado',
        situacao_eixo_5: rowData.situacao_eixo_5 || 'Não informado',
        situacao_eixo_6: rowData.situacao_eixo_6 || 'Não informado',
        situacao_eixo_7: rowData.situacao_eixo_7 || 'Não informado',
        recomendacao_eixo_1: rowData.recomendacao_eixo_1 || 'Não informado',
        recomendacao_eixo_2: rowData.recomendacao_eixo_2 || 'Não informado',
        recomendacao_eixo_3: rowData.recomendacao_eixo_3 || 'Não informado',
        recomendacao_eixo_4: rowData.recomendacao_eixo_4 || 'Não informado',
        recomendacao_eixo_5: rowData.recomendacao_eixo_5 || 'Não informado',
        recomendacao_eixo_6: rowData.recomendacao_eixo_6 || 'Não informado',
        recomendacao_eixo_7: rowData.recomendacao_eixo_7 || 'Não informado',
        ferramenta_eixo_1: rowData.ferramenta_eixo_1 || 'Não informado',
        ferramenta_eixo_2: rowData.ferramenta_eixo_2 || 'Não informado',
        ferramenta_eixo_3: rowData.ferramenta_eixo_3 || 'Não informado',
        ferramenta_eixo_4: rowData.ferramenta_eixo_4 || 'Não informado',
        ferramenta_eixo_5: rowData.ferramenta_eixo_5 || 'Não informado',
        ferramenta_eixo_6: rowData.ferramenta_eixo_6 || 'Não informado',
        ferramenta_eixo_7: rowData.ferramenta_eixo_7 || 'Não informado',
      };
    });
    
    console.log('Dados carregados do Excel:', mappedData.length, 'registros');
    return mappedData;
    
  } catch (error) {
    console.error('Erro ao carregar arquivo Excel:', error);
    // Se não conseguir carregar o Excel, usar dados mock
    console.log('Usando dados mock como fallback');
    return [];
  }
}

// Função para verificar se o arquivo Excel existe
export async function checkExcelFile(): Promise<boolean> {
  try {
    const response = await fetch('/database.xlsx');
    return response.ok;
  } catch (error) {
    return false;
  }
} 