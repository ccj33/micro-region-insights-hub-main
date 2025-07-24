import { useEffect, useState } from 'react';
import { readMacrosExcelFile } from '@/data/excelReader';

export interface MacrosRecommendation {
  eixo: string;
  emergente1_situacao: string;
  emergente1_recomendacoes: string;
  emergente1_ferramentas: string;
  emergente2_situacao: string;
  emergente2_recomendacoes: string;
  emergente2_ferramentas: string;
  evolucao1_situacao: string;
  evolucao1_recomendacoes: string;
  evolucao1_ferramentas: string;
  evolucao2_situacao: string;
  evolucao2_recomendacoes: string;
  evolucao2_ferramentas: string;
  avancado_situacao: string;
  avancado_recomendacoes: string;
  avancado_ferramentas: string;
}

export function useMacrosRecommendations() {
  const [data, setData] = useState<MacrosRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await readMacrosExcelFile();
        setData(result as MacrosRecommendation[]);
        // console.log('Dados macros carregados:', result);
      } catch (err) {
        setError('Erro ao carregar recomendações do macros.xlsx');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
} 