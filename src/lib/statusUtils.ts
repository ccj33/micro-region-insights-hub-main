import { Award, Clock, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Target } from 'lucide-react';

export type StatusLevel = 'Avançado' | 'Em Evolução' | 'Emergente' | 'Positivo' | 'Negativo' | 'Alerta' | 'Destaque' | 'Padrão';

export const getStatusAppearance = (level: StatusLevel) => {
  switch (level) {
    // Níveis de Maturidade
    case 'Avançado':
      return {
        icon: Award,
        textColor: 'text-green-800',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
      };
    case 'Em Evolução':
      return {
        icon: Clock,
        textColor: 'text-blue-800',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
      };
    case 'Emergente':
      return {
        icon: AlertTriangle,
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
      };

    // Indicadores de Análise
    case 'Positivo':
        return {
          icon: CheckCircle,
          textColor: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
        };
    case 'Negativo':
        return {
            icon: TrendingDown,
            textColor: 'text-orange-800',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100',
        };
    case 'Alerta':
        return {
            icon: AlertTriangle,
            textColor: 'text-yellow-800',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-100',
        };
    
    // Outros
    case 'Destaque':
        return {
            icon: Target,
            textColor: 'text-indigo-800',
            bgColor: 'bg-indigo-100',
            borderColor: 'border-indigo-200',
        };
    case 'Padrão':
    default:
      return {
        icon: CheckCircle,
        textColor: 'text-slate-800',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
      };
  }
}; 