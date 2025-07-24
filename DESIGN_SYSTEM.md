# Design System - Micro-Region Insights Hub

## 🎨 Melhorias Implementadas

### **Tipografia Moderna**

#### **Font Stack Profissional**
- **Fonte Principal**: Inter (Google Fonts)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
- **Monospace**: JetBrains Mono, Fira Code, Monaco
- **Display**: Inter para títulos e headings

#### **Hierarquia de Tipografia**
```css
.text-hero      /* 4xl-6xl, extrabold, tight tracking */
.text-title     /* 2xl-3xl, bold, tight tracking */
.text-subtitle  /* xl-2xl, semibold, wide tracking */
.text-headline  /* lg-xl, semibold, wide tracking */
.text-body-large /* base-lg, normal, relaxed leading */
.text-body-small /* sm, normal, normal leading */
.text-caption   /* sm, medium, wide tracking */
.text-caption-small /* xs, medium, wide tracking */
```

### **Paleta de Cores Moderna**

#### **Cores Principais**
- **Primary**: `hsl(217 91% 60%)` - Azul moderno e profissional
- **Background**: `hsl(220 14% 96%)` - Cinza muito claro
- **Foreground**: `hsl(222 84% 5%)` - Preto suave

#### **Cores de Status**
- **Success**: `hsl(142 76% 36%)` - Verde profissional
- **Warning**: `hsl(38 92% 50%)` - Amarelo suave
- **Error**: `hsl(0 84% 60%)` - Vermelho equilibrado

#### **Cores de Gráficos**
```css
--chart-primary: hsl(217 91% 60%)    /* Azul */
--chart-secondary: hsl(142 76% 36%)  /* Verde */
--chart-tertiary: hsl(38 92% 50%)    /* Amarelo */
--chart-quaternary: hsl(262 83% 58%) /* Roxo */
--chart-fifth: hsl(0 84% 60%)        /* Vermelho */
--chart-sixth: hsl(199 89% 48%)      /* Azul claro */
--chart-seventh: hsl(330 81% 60%)    /* Rosa */
```

### **Melhorias de Acessibilidade**

#### **Contraste e Legibilidade**
- Contraste WCAG AA garantido
- Espaçamento de letras otimizado
- Altura de linha profissional (1.5-1.75)
- Pesos de fonte consistentes (300-800)

#### **Suporte para Daltônicos**
```css
.colorblind-friendly {
  --red-daltonic: #d73027;
  --blue-daltonic: #4575b4;
  --green-daltonic: #1a9850;
  --yellow-daltonic: #fee08b;
  --orange-daltonic: #fd8d3c;
}
```

### **Sombras e Elevação**

#### **Sistema de Sombras**
```css
--shadow-card: 0 1px 3px 0 hsl(var(--primary) / 0.1)
--shadow-elevated: 0 4px 6px -1px hsl(var(--primary) / 0.1)
--shadow-header: 0 1px 2px 0 hsl(var(--primary) / 0.05)
```

### **Animações e Transições**

#### **Curvas de Animação**
- **Smooth**: `cubic-bezier(0.4, 0, 0.2, 1)` - 300ms
- **Fast**: `cubic-bezier(0.4, 0, 0.2, 1)` - 150ms

#### **Animações Disponíveis**
```css
.animate-fade-in-up
.animate-fade-in
.animate-slide-in-left
.animate-slide-in-right
.animate-pulse-slow
.animate-bounce-slow
```

## 🚀 Benefícios das Melhorias

### **Profissionalismo**
- Tipografia moderna e legível
- Paleta de cores equilibrada
- Hierarquia visual clara

### **Usabilidade**
- Melhor contraste e legibilidade
- Navegação mais intuitiva
- Feedback visual aprimorado

### **Acessibilidade**
- Suporte para daltônicos
- Contraste WCAG AA
- Navegação por teclado

### **Performance**
- Fontes otimizadas
- Animações suaves
- Carregamento eficiente

## 📋 Como Usar

### **Classes de Tipografia**
```jsx
<h1 className="text-hero">Título Principal</h1>
<h2 className="text-title">Subtítulo</h2>
<p className="text-body-large">Texto do corpo</p>
<span className="text-caption">Legenda</span>
```

### **Classes de Cores**
```jsx
<div className="bg-primary text-primary-foreground">
<div className="bg-success text-success-foreground">
<div className="bg-chart-primary">
```

### **Classes de Animação**
```jsx
<div className="animate-fade-in-up">
<div className="hover-lift">
<div className="smooth-transition">
```

## 🎯 Próximos Passos

1. **Implementar modo escuro**
2. **Adicionar mais variações de cores**
3. **Criar componentes de design system**
4. **Documentar padrões de uso**
5. **Testes de acessibilidade**

---

*Design System atualizado em: Dezembro 2024* 