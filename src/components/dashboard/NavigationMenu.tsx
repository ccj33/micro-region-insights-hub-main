import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, BarChart3, PieChart, Users, Table, FileText, Menu, X, Target, TrendingUp, Activity, MapPin, BookOpen } from 'lucide-react';

interface NavigationMenuProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const sections = [
  { id: 'overview', label: 'Visão Geral', icon: Home, description: 'Resumo completo' },
  { id: 'populacao', label: 'População', icon: Users, description: 'Distribuição demográfica' },
  { id: 'barras', label: 'Gráfico Barras', icon: BarChart3, description: 'Ranking de maturidade' },
  { id: 'radar', label: 'Gráfico Radar', icon: PieChart, description: 'Comparação por eixos' },
  { id: 'executivo', label: 'Dashboard Executivo', icon: Target, description: 'Visão estratégica' },
  { id: 'tabela', label: 'Tabela Eixos', icon: Table, description: 'Detalhamento por eixos' },
  { id: 'recomendacoes', label: 'Recomendações', icon: BookOpen, description: 'Sugestões por eixo' },
  { id: 'analise-avancada', label: 'Análise Avançada', icon: TrendingUp, description: 'Comparação entre regiões' },
];

export function NavigationMenu({ activeSection, onNavigate }: NavigationMenuProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    setShowMobileMenu(false); // Fecha o menu mobile após navegação
  };

  return (
    <>
      {/* Menu de Navegação Fixo */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 w-full">
            {/* Logo/Título */}
            <div className="flex-shrink-0 flex items-center pl-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-50 shadow-lg border-2 border-blue-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-20"></div>
                <svg className="h-6 w-6 text-blue-600 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white drop-shadow-lg tracking-tight">
                  RADAR NSDIGI
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-100 drop-shadow-sm tracking-wide uppercase">
                    Sistema de Transformação Digital
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Centralizado - Desktop */}
            <div className="flex-1 flex justify-center hidden lg:block">
              <div className="flex items-center gap-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleNavigate(section.id)}
                      className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-md transition-all duration-200 cursor-pointer group ${
                        activeSection === section.id 
                          ? 'bg-white/25 text-white font-semibold shadow-md' 
                          : 'hover:bg-white/15 text-white hover:text-white'
                      }`}
                      style={{ minWidth: 70 }}
                      data-tour={`menu-${section.id}`}
                    >
                      <Icon className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform duration-200 text-white" />
                      <span className="text-xs leading-tight font-medium tracking-wide drop-shadow-sm">
                        {section.label.split(' ')[1] || section.label}
                      </span>
                      <span className="text-xs opacity-70 hidden group-hover:block transition-opacity">
                        {section.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão Hambúrguer - Mobile */}
            <div className="lg:hidden flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-white hover:bg-white/10"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>

            {/* Espaço à direita para balancear */}
            <div className="flex-shrink-0 w-32 hidden lg:block" />
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-t border-blue-200 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNavigate(section.id)}
                      className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                        activeSection === section.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "text-blue-700 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{section.label}</span>
                      <span className="text-xs opacity-70">{section.description}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>


    </>
  );
} 