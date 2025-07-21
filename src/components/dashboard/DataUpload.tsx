import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface DataUploadProps {
  onDataUpdate?: (data: any[]) => void;
}

export function DataUpload({ onDataUpdate }: DataUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é um arquivo Excel
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];

    const isValidType = validTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      
      // Ler arquivo Excel
      const data = await file.arrayBuffer();
      
      const workbook = XLSX.read(data);
      
      // Assumir que os dados estão na primeira planilha
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('Nenhuma planilha encontrada no arquivo');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Normalizar os nomes das colunas (remover espaços e deixar minúsculo)
      const normalizeKey = (key: string) => key.trim().toLowerCase();
      const normalizedData = jsonData.map((row: any) => {
        const newRow: any = {};
        Object.keys(row).forEach((key) => {
          newRow[normalizeKey(key)] = row[key];
        });
        return newRow;
      });

      if (normalizedData.length === 0) {
        throw new Error('Arquivo vazio ou sem dados válidos');
      }

      // Validar se tem as colunas essenciais (mais flexível)
      const firstRow = normalizedData[0] as any;

      // Procurar por colunas que contenham as palavras-chave (case insensitive)
      const keys = Object.keys(firstRow).map(k => k.toLowerCase());
      const hasMicroregiao = keys.some(k => k.includes('micro') || k.includes('região'));
      const hasMacroregiao = keys.some(k => k.includes('macro') || k.includes('região'));

      if (!hasMicroregiao && !hasMacroregiao) {
        throw new Error('Não foi possível identificar colunas de região. Verifique se o arquivo contém dados de microrregiões ou macrorregiões.');
      }

      setUploadStatus('success');
      setLastUpdate(new Date());
      toast.success(`Arquivo processado com sucesso! ${normalizedData.length} registros carregados.`);

      // Atualizar os dados no componente pai
      if (onDataUpdate) {
        onDataUpdate(normalizedData);
      }

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setUploadStatus('error');
      
      // Mensagem de erro mais específica
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao processar arquivo: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    toast.info('Iniciando download do template...');
    // Em uma implementação real, aqui você geraria e baixaria um template Excel
    // com a estrutura correta das colunas
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = () => {
    switch (uploadStatus) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">Atualizado</Badge>;
      case 'error':
        return <Badge className="bg-error text-error-foreground">Erro</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getStatusIcon()}
          Atualização de Dados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Substitua o arquivo Excel para atualizar automaticamente todos os dados do painel
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <div className="font-medium text-foreground">Status dos Dados</div>
            {lastUpdate ? (
              <div className="text-sm text-muted-foreground">
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Dados de exemplo carregados
              </div>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'Processando...' : 'Carregar Excel'}
          </Button>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Template
          </Button>
        </div>

        {/* Input oculto para arquivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Instruções */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2">Como atualizar os dados:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Baixe o template Excel com a estrutura correta</li>
            <li>Mantenha os nomes das colunas inalterados</li>
            <li>Preencha com os novos dados das microrregiões</li>
            <li>Carregue o arquivo usando o botão "Carregar Excel"</li>
            <li>O painel será atualizado automaticamente</li>
          </ol>
        </div>

        {/* Colunas esperadas */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Estrutura esperada do arquivo:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              'macrorregiao', 'microrregiao', 'regional_saude', 'analista',
              'indice_geral', 'eixo_1', 'eixo_2', 'eixo_3', 'eixo_4', 'eixo_5', 'eixo_6', 'eixo_7',
              'idh_completo', 'populacao', 'classificacao_inmsd', 'situacao_eixo_1', 'recomendacao_eixo_1'
            ].map(column => (
              <Badge key={column} variant="outline" className="text-xs">
                {column}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">
              ... e outras
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}