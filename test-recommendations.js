// Script de teste para verificar as recomendações
const mockData = [
  {
    microrregiao: "Águas Formosas",
    eixo_1: "0,47",
    eixo_2: "0,29", 
    eixo_3: "0,57",
    eixo_4: "0,15",
    eixo_5: "0,25",
    eixo_6: "0,36",
    eixo_7: "0,13",
    situacao_eixo_1: "Situação do eixo 1",
    recomendacao_eixo_1: "Recomendação do eixo 1",
    ferramenta_eixo_1: "Ferramenta do eixo 1",
    situacao_eixo_2: "Situação do eixo 2",
    recomendacao_eixo_2: "Recomendação do eixo 2", 
    ferramenta_eixo_2: "Ferramenta do eixo 2",
    situacao_eixo_3: "Situação do eixo 3",
    recomendacao_eixo_3: "Recomendação do eixo 3",
    ferramenta_eixo_3: "Ferramenta do eixo 3",
    situacao_eixo_4: "Situação do eixo 4",
    recomendacao_eixo_4: "Recomendação do eixo 4",
    ferramenta_eixo_4: "Ferramenta do eixo 4",
    situacao_eixo_5: "Situação do eixo 5",
    recomendacao_eixo_5: "Recomendação do eixo 5",
    ferramenta_eixo_5: "Ferramenta do eixo 5",
    situacao_eixo_6: "Situação do eixo 6",
    recomendacao_eixo_6: "Recomendação do eixo 6",
    ferramenta_eixo_6: "Ferramenta do eixo 6",
    situacao_eixo_7: "Situação do eixo 7",
    recomendacao_eixo_7: "Recomendação do eixo 7",
    ferramenta_eixo_7: "Ferramenta do eixo 7"
  }
];

function generateRecommendationsSection(selectedData) {
  const eixos = [
    { nome: 'Gestão e Governança', valor: selectedData.eixo_1, situacao: selectedData.situacao_eixo_1, recomendacao: selectedData.recomendacao_eixo_1, ferramenta: selectedData.ferramenta_eixo_1 },
    { nome: 'Infraestrutura e Conectividade', valor: selectedData.eixo_2, situacao: selectedData.situacao_eixo_2, recomendacao: selectedData.recomendacao_eixo_2, ferramenta: selectedData.ferramenta_eixo_2 },
    { nome: 'Sistemas e Dados', valor: selectedData.eixo_3, situacao: selectedData.situacao_eixo_3, recomendacao: selectedData.recomendacao_eixo_3, ferramenta: selectedData.ferramenta_eixo_3 },
    { nome: 'Capacitação e Desenvolvimento', valor: selectedData.eixo_4, situacao: selectedData.situacao_eixo_4, recomendacao: selectedData.recomendacao_eixo_4, ferramenta: selectedData.ferramenta_eixo_4 },
    { nome: 'Serviços Digitais', valor: selectedData.eixo_5, situacao: selectedData.situacao_eixo_5, recomendacao: selectedData.recomendacao_eixo_5, ferramenta: selectedData.ferramenta_eixo_5 },
    { nome: 'Interoperabilidade', valor: selectedData.eixo_6, situacao: selectedData.situacao_eixo_6, recomendacao: selectedData.recomendacao_eixo_6, ferramenta: selectedData.ferramenta_eixo_6 },
    { nome: 'Segurança e Privacidade', valor: selectedData.eixo_7, situacao: selectedData.situacao_eixo_7, recomendacao: selectedData.recomendacao_eixo_7, ferramenta: selectedData.ferramenta_eixo_7 }
  ];

  console.log('Eixos para recomendações:', eixos.map((eixo, index) => ({
    eixo: index + 1,
    nome: eixo.nome,
    temSituacao: !!eixo.situacao,
    temRecomendacao: !!eixo.recomendacao,
    temFerramenta: !!eixo.ferramenta
  })));

  const content = eixos.map((eixo, index) => `
    <div style="margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 10px; font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>Eixo ${index + 1} – ${eixo.nome}</span>
          <span style="background-color: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-size: 10px;">${parseFloat(String(eixo.valor).replace(',', '.')).toFixed(3)}</span>
      </div>
      <div style="padding: 12px; font-size: 10px;">
        
        <!-- Situação Atual -->
        <div style="margin-bottom: 12px; background-color: #fef3c7; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="background-color: #f59e0b; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; margin-right: 6px;">!</span>
            <strong style="color: #92400e; font-size: 11px;">Situação Atual</strong>
          </div>
          <p style="margin: 0; line-height: 1.4; color: #78350f; font-size: 9px;">${eixo.situacao || 'Informação não disponível'}</p>
        </div>
        
        <!-- Recomendação -->
        <div style="margin-bottom: 12px; background-color: #dbeafe; padding: 10px; border-radius: 6px; border-left: 3px solid #3b82f6;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="background-color: #3b82f6; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; margin-right: 6px;">→</span>
            <strong style="color: #1e40af; font-size: 11px;">Recomendação</strong>
          </div>
          <div style="line-height: 1.4; color: #1e3a8a; font-size: 9px;">
            ${eixo.recomendacao ? eixo.recomendacao.split('\n').map((line, idx) => 
              line.trim().startsWith('**') ? 
                `<div style="margin: 6px 0; padding: 6px; background-color: rgba(59,130,246,0.1); border-radius: 3px; font-weight: bold;">${line.replace(/\*\*/g, '')}</div>` :
                `<p style="margin: 3px 0;">${line}</p>`
            ).join('') : 'Informação não disponível'}
          </div>
        </div>
        
        <!-- Ferramenta Sugerida -->
        <div style="background-color: #d1fae5; padding: 10px; border-radius: 6px; border-left: 3px solid #10b981;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="background-color: #10b981; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; margin-right: 6px;">✓</span>
            <strong style="color: #065f46; font-size: 11px;">Ferramenta Sugerida</strong>
          </div>
          <p style="margin: 0; line-height: 1.4; color: #064e3b; font-size: 9px;">${eixo.ferramenta || 'Informação não disponível'}</p>
        </div>
        
      </div>
    </div>
  `).join('');

  console.log('Número de eixos gerados:', eixos.length);
  console.log('Tamanho do conteúdo gerado:', content.length);
  console.log('Número de ocorrências de "Eixo" no conteúdo:', (content.match(/Eixo \d+/g) || []).length);

  return content;
}

// Testar a função
const result = generateRecommendationsSection(mockData[0]);
console.log('\n=== RESULTADO DO TESTE ===');
console.log('Conteúdo gerado com sucesso!');
console.log('Total de eixos processados: 7');
console.log('Tamanho do conteúdo:', result.length); 