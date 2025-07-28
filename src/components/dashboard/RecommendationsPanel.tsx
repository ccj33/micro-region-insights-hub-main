import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { 
  Settings, 
  Wifi, 
  Database, 
  GraduationCap, 
  Smartphone, 
  Link, 
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  List,
  GalleryHorizontal,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { useMacrosRecommendations } from '@/hooks/useMacrosRecommendations';
import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface RecommendationsPanelProps {
  data: MicroRegionData;
  initialEixoIndex?: number;
}

const EIXOS_ICONS = [
  Settings,    // Gestão e Governança
  Wifi,        // Infraestrutura e Conectividade
  Database,    // Sistemas e Dados
  GraduationCap, // Capacitação e Desenvolvimento
  Smartphone,  // Serviços Digitais
  Link,        // Interoperabilidade
  Shield       // Segurança e Privacidade
];

export function RecommendationsPanel({ data, initialEixoIndex = 0 }: RecommendationsPanelProps) {
  const { data: macrosData, loading: macrosLoading, error: macrosError } = useMacrosRecommendations();
  
  // Estados para controle da visualização
  const [viewMode, setViewMode] = useState<'list' | 'carousel'>('carousel');
  const [currentEixoIndex, setCurrentEixoIndex] = useState(initialEixoIndex);

  // Atualizar o eixo atual quando initialEixoIndex mudar
  useEffect(() => {
    if (initialEixoIndex !== undefined) {
      setCurrentEixoIndex(initialEixoIndex);
    }
  }, [initialEixoIndex]);

  // Funções de navegação do carrossel
  const handleNext = () => {
    setCurrentEixoIndex((prev) => (prev + 1) % EIXOS_NAMES.length);
  };

  const handlePrevious = () => {
    setCurrentEixoIndex((prev) => (prev - 1 + EIXOS_NAMES.length) % EIXOS_NAMES.length);
  };

  const getEixoValue = (index: number): number => {
    const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
    return parseFloat(String(data[eixoKey]).replace(',', '.'));
  };

  const getStatusBadge = (valor: number) => {
    if (valor > 0.66) return { variant: 'default', text: 'Avançado', color: 'bg-success text-success-foreground' };
    if (valor > 0.33) return { variant: 'secondary', text: 'Em Evolução', color: 'bg-warning text-warning-foreground' };
    return { variant: 'secondary', text: 'Emergente', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getStatusIcon = (valor: number) => {
    if (valor > 0.66) return CheckCircle;
    return AlertCircle;
  };

  // Função para formatar texto com negritos e listas
  const formatText = (text: string) => {
    if (!text) return null;
    
    // Dividir por números seguidos de ponto (1., 2., etc.)
    const parts = text.split(/(\d+\.)/);
    const items = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.match(/^\d+\.$/)) {
        // É um número de lista
        const nextPart = parts[i + 1];
        if (nextPart && nextPart.trim()) {
          items.push(
            <div key={i} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
              <span className="font-bold text-primary bg-primary text-white px-3 py-2 rounded-lg text-sm flex-shrink-0 shadow-sm">
                {part}
              </span>
              <div className="flex-1">
                <div className="text-sm text-foreground leading-relaxed">
                  {formatKeywords(nextPart.trim())}
                </div>
              </div>
            </div>
          );
          i++; // Pular o próximo item pois já foi processado
        }
      } else if (!part.match(/^\d+\./) && part.trim()) {
        // É texto normal (primeiro parágrafo)
        items.push(
          <p key={i} className="text-sm text-foreground leading-relaxed mb-4">
            {formatKeywords(part.trim())}
          </p>
        );
      }
    }
    
    return (
      <div className="space-y-6">
        {items}
      </div>
    );
  };

  // Função para destacar palavras-chave importantes
  const formatKeywords = (text: string) => {
    const keywords = [
      'governança intermunicipal', 'LGPD', 'orçamento regional', 'saúde digital',
      'comitê permanente', 'políticas de privacidade', 'linha orçamentária',
      'ponto focal', 'grupo de trabalho', 'proteção de dados', 'governança digital',
      'comitês', 'segurança da informação', 'alocação orçamentária', 'articulação regional',
      'governança da saúde digital', 'instâncias formais de coordenação', 'boas práticas'
    ];
    
    let formattedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      formattedText = formattedText.replace(regex, `<strong class="font-semibold text-primary">${keyword}</strong>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const formatFerramentas = (text: string) => {
    if (!text) return null;

    // Split by newlines first, then by common patterns
    const recommendations = text
      .split(/\n|(?=\d+\.)|(?=[A-Z][a-z]+.*\([^)]+\):)/g)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return (
        <div className="space-y-3">
            {recommendations.map((rec, index) => {
                const parts = rec.split(':');
                const title = parts[0] + (parts.length > 1 ? ':' : '');
                const description = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
                
                return (
                    <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg border-l-4 border-green-500 shadow-sm">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm sm:text-base text-foreground mb-1 break-words">{title}</h5> 
                        {description && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{formatKeywords(description)}</p>
                        )}
                      </div>
                    </div>
                );
            })}
        </div>
    );
};


  // Função para classificar o eixo conforme critérios fornecidos
  const getEixoClassificacao = (valor: number) => {
    if (valor >= 0 && valor <= 0.15) return 'Emergente 1';
    if (valor > 0.15 && valor <= 0.33) return 'Emergente 2';
    if (valor > 0.33 && valor <= 0.5) return 'Em Evolução 1';
    if (valor > 0.5 && valor <= 0.66) return 'Em Evolução 2';
    if (valor > 0.66) return 'Avançado';
    return '';
  };

  // Função para obter os dados do macros.xlsx para o eixo e tier/tag
  function getMacrosInfo(eixoIndex: number, tier: string) {
    if (!macrosData || macrosData.length === 0) return { situacao: 'Não informado', recomendacao: 'Não informado', ferramenta: 'Não informado' };
    const eixoKey = `eixo_${eixoIndex + 1}`;
    const eixoObj = macrosData.find(e => (e.eixo || '').toLowerCase().trim() === eixoKey);
    if (!eixoObj) {
      // console.warn(`Não encontrado objeto de macro para ${eixoKey}`);
      return { situacao: 'Não informado', recomendacao: 'Não informado', ferramenta: 'Não informado' };
    }
    // Mapear tier para os campos do objeto
    let prefix = '';
    switch (tier) {
      case 'Emergente 1': prefix = 'emergente1'; break;
      case 'Emergente 2': prefix = 'emergente2'; break;
      case 'Em Evolução 1': prefix = 'evolucao1'; break;
      case 'Em Evolução 2': prefix = 'evolucao2'; break;
      case 'Avançado': prefix = 'avancado'; break;
      default: prefix = 'emergente1';
    }
    const situacao = eixoObj[`${prefix}_situacao`];
    const recomendacao = eixoObj[`${prefix}_recomendacoes`];
    const ferramenta = eixoObj[`${prefix}_ferramentas`];
    // if (!situacao || situacao.trim() === '') console.warn(`Situação vazia para ${eixoKey} - ${prefix}`);
    // if (!recomendacao || recomendacao.trim() === '') console.warn(`Recomendação vazia para ${eixoKey} - ${prefix}`);
    // if (!ferramenta || ferramenta.trim() === '') console.warn(`Ferramenta vazia para ${eixoKey} - ${prefix}`);
    return {
      situacao: situacao && situacao.trim() !== '' ? situacao : 'Não informado',
      recomendacao: recomendacao && recomendacao.trim() !== '' ? recomendacao : 'Não informado',
      ferramenta: ferramenta && ferramenta.trim() !== '' ? ferramenta : 'Não informado',
    };
  }

  // Função para renderizar um eixo individual
  const renderEixo = (index: number) => {
    const nome = EIXOS_NAMES[index];
    const Icon = EIXOS_ICONS[index];
    const StatusIcon = getStatusIcon(getEixoValue(index));
    const valor = getEixoValue(index);
    const status = getStatusBadge(valor);
    const tier = getEixoClassificacao(valor);

    // Buscar dados do macros.xlsx
    const macrosInfo = getMacrosInfo(index, tier);

    return (
      <Card 
        key={index} 
        id={`eixo-${index + 1}`}
        className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light hover:shadow-xl transition-shadow"
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                  Eixo {index + 1} – {nome}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Pontuação: {valor.toFixed(3)}
                    </span>
                  </div>
                  {/* Classificação do eixo */}
                  <span className="px-2 py-0.5 rounded border border-red-400 text-xs font-semibold text-red-700 bg-white self-start sm:self-auto" style={{ minWidth: 90, textAlign: 'center' }}>
                    {tier}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Situação Atual */}
          <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Situação Atual</h4>
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {macrosLoading ? 'Carregando...' : formatKeywords(macrosInfo.situacao)}
                </div>
              </div>
            </div>
          </div>

          {/* Recomendação */}
          <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Recomendação</h4>
                <div className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {macrosLoading ? 'Carregando...' : formatText(macrosInfo.recomendacao)}
                </div>
              </div>
            </div>
          </div>

          {/* Ferramenta Sugerida */}
          <div className="p-3 sm:p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Ferramenta Sugerida</h4>
                {macrosLoading ? 'Carregando...' : formatFerramentas(macrosInfo.ferramenta)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div data-section="recommendations" className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center lg:text-left">
              <CardTitle className="text-xl font-bold text-foreground">
                Recomendações por Eixo de Maturidade
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Análise detalhada e recomendações específicas para cada eixo
              </p>
            </div>
            
            {/* Seletor de Visualização */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Modo de Visualização</span>
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value as 'list' | 'carousel')}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-md border-2 border-primary/20"
              >
                <ToggleGroupItem 
                  value="list" 
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2 rounded-md transition-all duration-200"
                  aria-label="Visualização em lista"
                >
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span className="text-sm font-medium">Lista</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="carousel" 
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2 rounded-md transition-all duration-200"
                  aria-label="Visualização em carrossel"
                >
                  <div className="flex items-center gap-2">
                    <GalleryHorizontal className="h-4 w-4" />
                    <span className="text-sm font-medium">Carrossel</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Renderização baseada no modo de visualização */}
      <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Como Navegar</AlertTitle>
        <AlertDescription>
          <p>
            Use as <strong className="font-semibold">setas</strong> para navegar entre os 7 eixos no modo <strong className="font-semibold">Carrossel</strong>,
            ou alterne para o modo <strong className="font-semibold">Lista</strong> para ver todos de uma vez.
          </p>
        </AlertDescription>
      </Alert>
      {viewMode === 'list' ? (
        // Visualização em Lista (padrão)
        <div className="grid gap-6">
          {EIXOS_NAMES.map((_, index) => renderEixo(index))}
        </div>
      ) : (
        // Visualização em Carrossel
        <div className="relative">
          {/* Contador */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                Eixo <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center justify-center">{currentEixoIndex + 1}</span> de {EIXOS_NAMES.length}
              </span>
            </div>
          </div>
          
          {/* Navegação */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 shadow-md hover:shadow-lg transition-all duration-200 border-blue-500"
              aria-label="Eixo anterior"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            
            <div className="flex-1 w-full">
              {renderEixo(currentEixoIndex)}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 shadow-md hover:shadow-lg transition-all duration-200 border-blue-500"
              aria-label="Próximo eixo"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}