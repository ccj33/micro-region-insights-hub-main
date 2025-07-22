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
  const getEixoValue = (index: number): number => {
    const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
    return parseFloat(String(data[eixoKey]).replace(',', '.'));
  };

  const getStatusBadge = (valor: number) => {
    if (valor >= 0.7) return { variant: 'default', text: 'Consolidado', color: 'bg-success text-success-foreground' };
    if (valor >= 0.4) return { variant: 'secondary', text: 'Em Evolução', color: 'bg-warning text-warning-foreground' };
    return { variant: 'destructive', text: 'Inicial', color: 'bg-error text-error-foreground' };
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
          
          const situacao = data[`situacao_eixo_${index + 1}` as keyof MicroRegionData];
          const recomendacao = data[`recomendacao_eixo_${index + 1}` as keyof MicroRegionData];
          const ferramenta = data[`ferramenta_eixo_${index + 1}` as keyof MicroRegionData];

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
                        {situacao}
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
                        {formatText(recomendacao)}
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
                        {ferramenta}
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