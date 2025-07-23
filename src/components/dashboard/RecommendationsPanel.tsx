import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight
} from "lucide-react";
import { useMacrosRecommendations } from '@/hooks/useMacrosRecommendations';

interface RecommendationsPanelProps {
  data: MicroRegionData;
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

export function RecommendationsPanel({ data }: RecommendationsPanelProps) {
  const { data: macrosData, loading: macrosLoading, error: macrosError } = useMacrosRecommendations();

  const getEixoValue = (index: number): number => {
    const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
    return parseFloat(String(data[eixoKey]).replace(',', '.'));
  };

  const getStatusBadge = (valor: number) => {
    if (valor >= 0.7) return { variant: 'default', text: 'Avançado', color: 'bg-success text-success-foreground' };
    if (valor >= 0.4) return { variant: 'secondary', text: 'Em Evolução', color: 'bg-warning text-warning-foreground' };
    return { variant: 'secondary', text: 'Emergente', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getStatusIcon = (valor: number) => {
    if (valor >= 0.7) return CheckCircle;
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
      'comitê permanente', 'políticas de privacidade', 'linha orçamentária'
    ];
    
    let formattedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      formattedText = formattedText.replace(regex, `<strong class="font-semibold text-primary">${keyword}</strong>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
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
      console.warn(`Não encontrado objeto de macro para ${eixoKey}`);
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
    if (!situacao || situacao.trim() === '') console.warn(`Situação vazia para ${eixoKey} - ${prefix}`);
    if (!recomendacao || recomendacao.trim() === '') console.warn(`Recomendação vazia para ${eixoKey} - ${prefix}`);
    if (!ferramenta || ferramenta.trim() === '') console.warn(`Ferramenta vazia para ${eixoKey} - ${prefix}`);
    return {
      situacao: situacao && situacao.trim() !== '' ? situacao : 'Não informado',
      recomendacao: recomendacao && recomendacao.trim() !== '' ? recomendacao : 'Não informado',
      ferramenta: ferramenta && ferramenta.trim() !== '' ? ferramenta : 'Não informado',
    };
  }

  return (
    <div data-section="recommendations" className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-center text-foreground">
            Recomendações por Eixo de Maturidade
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Análise detalhada e recomendações específicas para cada eixo
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {EIXOS_NAMES.map((nome, index) => {
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Eixo {index + 1} – {nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Pontuação: {valor.toFixed(3)}
                        </span>
                        {/* Classificação do eixo */}
                        <span className="ml-2 px-2 py-0.5 rounded border border-red-400 text-xs font-semibold text-red-700 bg-white" style={{ minWidth: 90, textAlign: 'center' }}>
                          {tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    {status.text}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Situação Atual */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-3 text-base">Situação Atual</h4>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {macrosLoading ? 'Carregando...' : macrosInfo.situacao}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recomendação */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-3 text-base">Recomendação</h4>
                      <div className="text-sm text-foreground leading-relaxed">
                        {macrosLoading ? 'Carregando...' : formatText(macrosInfo.recomendacao)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ferramenta Sugerida */}
                <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-3 text-base">Ferramenta Sugerida</h4>
                      <div className="text-sm text-foreground leading-relaxed">
                        {macrosLoading ? 'Carregando...' : macrosInfo.ferramenta}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}