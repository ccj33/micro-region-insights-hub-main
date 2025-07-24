import { useState, useEffect } from 'react';
import { MicroRegionData } from '@/types/dashboard';
import { readExcelFile, checkExcelFile } from '@/data/excelReader';
import { mockData } from '@/data/mockData';

export function useExcelData() {
  const [data, setData] = useState<MicroRegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'excel' | 'mock'>('mock');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Verificar se o arquivo Excel existe
        const excelExists = await checkExcelFile();
        
        if (excelExists) {
          // console.log('Arquivo Excel encontrado, carregando dados...');
          const excelData = await readExcelFile();
          
          if (excelData.length > 0) {
            setData(excelData);
            setDataSource('excel');
            // console.log('Dados do Excel carregados com sucesso:', excelData.length, 'registros');
          } else {
            throw new Error('Arquivo Excel vazio ou inválido');
          }
        } else {
          // console.log('Arquivo Excel não encontrado, usando dados mock');
          setData(mockData);
          setDataSource('mock');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setData(mockData);
        setDataSource('mock');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se o arquivo Excel existe
      const excelExists = await checkExcelFile();
      
      if (excelExists) {
        // console.log('Arquivo Excel encontrado, carregando dados...');
        const excelData = await readExcelFile();
        
        if (excelData.length > 0) {
          setData(excelData);
          setDataSource('excel');
          // console.log('Dados do Excel carregados com sucesso:', excelData.length, 'registros');
        } else {
          throw new Error('Arquivo Excel vazio ou inválido');
        }
      } else {
        // console.log('Arquivo Excel não encontrado, usando dados mock');
        setData(mockData);
        setDataSource('mock');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData(mockData);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    dataSource,
    refreshData
  };
} 