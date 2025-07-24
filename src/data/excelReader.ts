import * as XLSX from 'xlsx';
import { MicroRegionData } from '@/types/dashboard';

export async function readExcelFile(): Promise<any[]> {
  try {
    // Tentar carregar o arquivo Excel da pasta public
    const response = await fetch('/database.xlsx');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Ler o arquivo Excel
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Primeira planilha
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Arquivo Excel vazio ou sem dados válidos');
    }
    
    // Pular o cabeçalho (primeira linha)
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];

    // Novo mapeamento: cada linha é um eixo
    const mappedData = rows.map((row) => {
      const eixoData: any = {};
      headers.forEach((header, colIndex) => {
        if (row[colIndex] !== undefined && row[colIndex] !== null) {
          eixoData[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex];
        }
      });
      return eixoData;
    }).filter(item => Object.keys(item).length > 0); // Remover linhas vazias

    // console.log('Dados carregados do Excel (vertical):', mappedData.length, 'registros');
    return mappedData;
  } catch (error) {
    console.error('Erro ao carregar arquivo Excel:', error);
    // Se não conseguir carregar o Excel, usar dados mock
    // console.log('Usando dados mock como fallback');
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

// Função utilitária para normalizar nomes de colunas
function normalizeColumnName(name: string): string {
  return name
    .normalize('NFD').replace(/[ -]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9]+/g, '_') // Troca qualquer coisa que não seja letra/número por _
    .replace(/_+/g, '_') // Troca múltiplos _ por um só
    .replace(/^_|_$/g, '') // Remove _ do início/fim
    .toLowerCase();
}

// Função para ler o arquivo macros.xlsx e retornar recomendações por eixo e tier
export async function readMacrosExcelFile(): Promise<any[]> {
  try {
    // Carregar o arquivo macros.xlsx da pasta public
    const response = await fetch('/macros.xlsx');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    // Usar a primeira aba
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Converter para JSON (primeira linha como cabeçalho)
    let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

    if (!jsonData || jsonData.length === 0) {
      throw new Error('Arquivo macros.xlsx vazio ou sem dados válidos');
    }

    // Limpar e normalizar nomes das colunas e valores
    jsonData = jsonData.map((row: any) => {
      const cleanedRow: any = {};
      Object.keys(row).forEach((key) => {
        // Normaliza o nome da coluna
        const cleanKey = normalizeColumnName(key);
        let value = row[key];
        if (typeof value === 'string') {
          value = value.trim();
        }
        cleanedRow[cleanKey] = value;
      });
      return cleanedRow;
    }).filter(item => Object.keys(item).length > 0); // Remover linhas vazias

    return jsonData;
  } catch (error) {
    console.error('Erro ao carregar macros.xlsx:', error);
    return [];
  }
} 