# Dados do Sistema

Esta pasta contém os arquivos de dados do sistema de análise de maturidade digital.

## 📊 Arquivos de Dados

- `mockData.ts` - Dados de exemplo/mock
- `database.xlsx` - Banco de dados principal (Excel) - **COLOCAR NA PASTA `public/`**
- `database.json` - Versão JSON dos dados (se necessário)

## 🔄 Como Atualizar

1. **Coloque** o arquivo `database.xlsx` na pasta `public/` do projeto
2. **O sistema** carregará automaticamente os dados do Excel
3. **Se não encontrar** o Excel, usará dados de exemplo
4. **Clique** no botão "Atualizar" para recarregar os dados

## 📋 Estrutura dos Dados

O arquivo Excel deve conter as seguintes colunas:
- microrregiao
- macrorregiao
- regional_saude
- analista
- email_analista
- populacao
- idh_completo
- classificacao_inmsd
- indice_geral
- eixo_1, eixo_2, eixo_3, eixo_4, eixo_5, eixo_6, eixo_7
- situacao_eixo_1, situacao_eixo_2, etc.
- recomendacao_eixo_1, recomendacao_eixo_2, etc.
- ferramenta_eixo_1, ferramenta_eixo_2, etc. 