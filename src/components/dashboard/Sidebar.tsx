import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BarChart3, PieChart, Users, Table, TrendingUp, FileText, Settings, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  showMobile?: boolean;
  onCloseMobile?: () => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const menuItems = [
  {
    id: 'filtros',
    label: 'Filtros',
    icon: Settings,
    description: 'Filtros de seleção'
  },
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: BarChart3,
    description: 'Estatísticas e resumo'
  },
  {
    id: 'radar',
    label: 'Gráfico Radar',
    icon: PieChart,
    description: 'Comparação por eixos'
  },
  {
    id: 'barras',
    label: 'Gráfico Barras',
    icon: TrendingUp,
    description: 'Ranking de maturidade'
  },
  {
    id: 'populacao',
    label: 'População',
    icon: Users,
    description: 'Distribuição demográfica'
  },
  {
    id: 'tabela',
    label: 'Tabela Eixos',
    icon: Table,
    description: 'Detalhamento por eixos'
  },
  {
    id: 'recomendacoes',
    label: 'Recomendações',
    icon: FileText,
    description: 'Sugestões por eixo'
  },
  {
    id: 'executivo',
    label: 'Dashboard Executivo',
    icon: Target,
    description: 'Visão estratégica'
  },
  {
    id: 'analise-avancada',
    label: 'Análise Avançada',
    icon: TrendingUp,
    description: 'Comparação entre regiões'
  }
];

export function Sidebar({ onNavigate, activeSection, showMobile = false, onCloseMobile, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Colapsado por padrão

  // Notificar mudanças no estado de colapso
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-30",
      isCollapsed ? "w-14" : "w-72",
      showMobile ? "block" : "hidden sm:block", // Mostrar em mobile quando ativo
      showMobile && "w-72" // Forçar largura completa em mobile
    )}>
             {/* Toggle Button */}
       <div className="flex justify-between items-center p-2">
         {showMobile && (
           <Button
             variant="ghost"
             size="sm"
             onClick={onCloseMobile}
             className="h-8 w-8 p-0"
           >
             <ChevronLeft className="h-4 w-4" />
           </Button>
         )}
         <Button
           variant="ghost"
           size="sm"
           onClick={handleToggleCollapse}
           className="h-8 w-8 p-0 ml-auto"
         >
           {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
         </Button>
       </div>

      {/* Menu Items */}
      <div className="px-2 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-200 cursor-pointer z-10 relative",
                isCollapsed ? "px-2" : "px-3",
                activeSection === item.id 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-blue-50 hover:text-blue-600"
              )}
              onClick={() => {
                console.log('Sidebar: Navegando para', item.id);
                onNavigate(item.id);
              }}
            >
              <Icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs opacity-70">{item.description}</span>
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-2 right-2">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Navegação</span>
            </div>
            <p className="text-xs text-gray-500">
              Use esta barra para navegar rapidamente entre as seções do dashboard
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 