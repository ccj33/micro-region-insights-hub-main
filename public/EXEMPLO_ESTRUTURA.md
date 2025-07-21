# 📊 Estrutura do Arquivo Excel

## 📁 Onde colocar o arquivo
Coloque seu arquivo Excel na pasta `public/` com o nome `database.xlsx`

## 📋 Colunas necessárias

| Coluna | Tipo | Exemplo | Obrigatório |
|--------|------|---------|-------------|
| `microrregiao` | Texto | "Região Metropolitana de São Paulo" | ✅ |
| `macrorregiao` | Texto | "São Paulo" | ✅ |
| `regional_saude` | Texto | "Regional de Saúde SP" | ✅ |
| `analista` | Texto | "João Silva" | ✅ |
| `email_analista` | Texto | "joao.silva@saude.gov.br" | ✅ |
| `populacao` | Número | 1234567 | ✅ |
| `idh_completo` | Texto | "0.850" | ✅ |
| `idh_valor` | Texto | "0.850" | ✅ |
| `idh_classificacao` | Texto | "Alto" | ✅ |
| `classificacao_inmsd` | Texto | "Consolidado" | ✅ |
| `indice_geral` | Texto | "0.750" | ✅ |
| `eixo_1` | Texto | "0.800" | ✅ |
| `eixo_2` | Texto | "0.700" | ✅ |
| `eixo_3` | Texto | "0.750" | ✅ |
| `eixo_4` | Texto | "0.650" | ✅ |
| `eixo_5` | Texto | "0.800" | ✅ |
| `eixo_6` | Texto | "0.700" | ✅ |
| `eixo_7` | Texto | "0.750" | ✅ |
| `ponto_focal` | Texto | "Maria Santos" | ✅ |
| `email_ponto_focal` | Texto | "maria.santos@saude.gov.br" | ✅ |
| `municipios` | Texto | "São Paulo, Guarulhos, Osasco" | ✅ |
| `macro_micro` | Texto | "SP-RMSP" | ✅ |
| `status_inmsd` | Texto | "Ativo" | ✅ |
| `pontuacao_geral` | Texto | "0.750" | ✅ |
| `situacao_eixo_1` | Texto | "Situação atual do eixo 1..." | ✅ |
| `recomendacao_eixo_1` | Texto | "Recomendações para o eixo 1..." | ✅ |
| `ferramenta_eixo_1` | Texto | "Ferramentas sugeridas..." | ✅ |
| `situacao_eixo_2` | Texto | "Situação atual do eixo 2..." | ✅ |
| `recomendacao_eixo_2` | Texto | "Recomendações para o eixo 2..." | ✅ |
| `ferramenta_eixo_2` | Texto | "Ferramentas sugeridas..." | ✅ |
| `situacao_eixo_3` | Texto | "Situação atual do eixo 3..." | ✅ |
| `recomendacao_eixo_3` | Texto | "Recomendações para o eixo 3..." | ✅ |
| `ferramenta_eixo_3` | Texto | "Ferramentas sugeridas..." | ✅ |
| `situacao_eixo_4` | Texto | "Situação atual do eixo 4..." | ✅ |
| `recomendacao_eixo_4` | Texto | "Recomendações para o eixo 4..." | ✅ |
| `ferramenta_eixo_4` | Texto | "Ferramentas sugeridas..." | ✅ |
| `situacao_eixo_5` | Texto | "Situação atual do eixo 5..." | ✅ |
| `recomendacao_eixo_5` | Texto | "Recomendações para o eixo 5..." | ✅ |
| `ferramenta_eixo_5` | Texto | "Ferramentas sugeridas..." | ✅ |
| `situacao_eixo_6` | Texto | "Situação atual do eixo 6..." | ✅ |
| `recomendacao_eixo_6` | Texto | "Recomendações para o eixo 6..." | ✅ |
| `ferramenta_eixo_6` | Texto | "Ferramentas sugeridas..." | ✅ |
| `situacao_eixo_7` | Texto | "Situação atual do eixo 7..." | ✅ |
| `recomendacao_eixo_7` | Texto | "Recomendações para o eixo 7..." | ✅ |
| `ferramenta_eixo_7` | Texto | "Ferramentas sugeridas..." | ✅ |

## 🎯 Dicas importantes

1. **Primeira linha**: Deve conter os cabeçalhos das colunas
2. **Nomes das colunas**: Use exatamente os nomes listados acima
3. **Valores dos eixos**: Use formato decimal (ex: "0.750")
4. **População**: Use números inteiros
5. **Textos longos**: Para recomendações, pode usar quebras de linha

## 🔄 Como atualizar

1. **Substitua** o arquivo `database.xlsx` na pasta `public/`
2. **Recarregue** a página do sistema
3. **Clique** no botão "Atualizar" se necessário
4. **Verifique** se aparece "Dados do Excel" no cabeçalho 