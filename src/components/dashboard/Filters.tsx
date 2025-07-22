import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MicroRegionData, FilterOptions } from "@/types/dashboard";
import { Filter, MapPin, Building, Target, Check, ChevronsUpDown, Search, Database } from "lucide-react";
import { DownloadPDF } from "./DownloadPDF";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDataCache } from "@/hooks/useDataCache";
import { Input } from "@/components/ui/input";

interface FiltersProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  filters: FilterOptions;
  onMicroregiaoChange: (microrregiao: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  selectedData: MicroRegionData;
}

export function Filters({ 
  data, 
  selectedMicroregiao, 
  filters, 
  onMicroregiaoChange, 
  onFiltersChange,
  selectedData
}: FiltersProps) {
  
  const [openMacro, setOpenMacro] = useState(false);
  const [openRegional, setOpenRegional] = useState(false);
  const [openMicroregiao, setOpenMicroregiao] = useState(false);
  
  // Usar o hook de cache de dados
  const { 
    filteredData: cachedFilteredData, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    clearCache, 
    cacheStats 
  } = useDataCache(data, filters);
  
  const uniqueValues = {
    macrorregioes: Array.from(new Set(data.map(item => item.macrorregiao))).sort(),
    regionaisSaude: Array.from(new Set(data.map(item => item.regional_saude))).sort(),
    classificacoes: Array.from(new Set(data.map(item => item.classificacao_inmsd))).sort()
  };

  const filteredMicroregioes = cachedFilteredData;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Seleção
          </CardTitle>
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{activeFiltersCount} filtro(s) ativo(s)</Badge>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Limpar
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>Cache: {cacheStats.hits}/{cacheStats.hits + cacheStats.misses}</span>
            </div>
            <DownloadPDF 
              microrregiao={selectedData?.microrregiao || 'NÃO DEFINIDO'}
              indice={selectedData?.indice_geral ? parseFloat(String(selectedData.indice_geral)).toFixed(3) : '---'}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Barra de Pesquisa REMOVIDA */}
        {/* <div className="mb-4">
          <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Pesquisar Microrregiões
          </label>
          <div className="relative">
            <Input
              placeholder="Digite para pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 sm:h-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-muted-foreground mt-1">
              {filteredMicroregioes.length} resultado(s) encontrado(s)
            </p>
          )}
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filtro Macrorregião - AGORA PRIMEIRO */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Macrorregião
            </label>
            <Popover open={openMacro} onOpenChange={setOpenMacro}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMacro}
                  className="w-full justify-between bg-white border border-gray-300 hover:border-primary/50 transition-colors shadow-sm"
                >
                  {filters.macrorregiao || "Todas as macrorregiões"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar macrorregião..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma macrorregião encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="todas"
                        onSelect={() => {
                          onFiltersChange({ ...filters, macrorregiao: undefined });
                          setOpenMacro(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !filters.macrorregiao ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todas as macrorregiões
                      </CommandItem>
                      {uniqueValues.macrorregioes.map((macro) => (
                        <CommandItem
                          key={macro}
                          value={macro}
                          onSelect={() => {
                            onFiltersChange({ ...filters, macrorregiao: macro });
                            setOpenMacro(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.macrorregiao === macro ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {macro}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Microrregião - AGORA SEGUNDO */}
          <div className="lg:col-span-2">
            <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Microrregião (Principal)
            </label>
            <Popover open={openMicroregiao} onOpenChange={setOpenMicroregiao}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMicroregiao}
                  className="w-full justify-between bg-white border-2 border-primary/20 focus:border-primary transition-colors shadow-sm h-12 sm:h-10"
                >
                  {selectedMicroregiao || "Selecione uma microrregião"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar microrregião..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma microrregião encontrada.</CommandEmpty>
                    <CommandGroup>
                      {filteredMicroregioes
                        .sort((a, b) => a.microrregiao.localeCompare(b.microrregiao, 'pt-BR'))
                        .map((item) => (
                        <CommandItem
                          key={item.microrregiao}
                          value={item.microrregiao}
                          onSelect={() => {
                            onMicroregiaoChange(item.microrregiao);
                            setOpenMicroregiao(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMicroregiao === item.microrregiao ? "opacity-100" : "opacity-0"
                            )}
                          />
                    <div className="flex flex-col">
                      <span>{item.microrregiao}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.macrorregiao} • {item.classificacao_inmsd}
                      </span>
                    </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filtro de Classificação INMSD */}
        <div className="mt-4">
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Classificação INMSD
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFiltersChange({ ...filters, classificacao_inmsd: undefined })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                !filters.classificacao_inmsd 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todas
            </button>
            {uniqueValues.classificacoes.map(classificacao => (
              <button
                key={classificacao}
                onClick={() => onFiltersChange({ ...filters, classificacao_inmsd: classificacao })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filters.classificacao_inmsd === classificacao
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {classificacao}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo da Seleção */}
        <div className="mt-4 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Microrregião Selecionada:</span>
              <span className="text-primary font-semibold">{selectedMicroregiao}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Filtros Ativos:</span>
              <div className="flex gap-2">
                {filters.macrorregiao ? (
                  <Badge variant="outline" className="text-xs">
                    {filters.macrorregiao}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Todas as macrorregiões
                  </Badge>
                )}
                {filters.classificacao_inmsd ? (
                  <Badge variant="outline" className="text-xs">
                    {filters.classificacao_inmsd}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Todas as classificações
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50">
              <span className="text-muted-foreground">
                {filteredMicroregioes.length} microrregião(ões) disponível(eis) para análise
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}