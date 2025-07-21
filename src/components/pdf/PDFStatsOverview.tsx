import React from 'react';

interface PDFStatsOverviewProps {
  data: any[];
  selectedData: any;
}

export function PDFStatsOverview({ data, selectedData }: PDFStatsOverviewProps) {
  return (
    <div style={{
      border: '2px solid #2563eb',
      borderRadius: 10,
      padding: 24,
      marginBottom: 24,
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      fontSize: 15,
      width: '100%',
      boxShadow: '0 2px 8px #2563eb22',
    }}>
      <h2 style={{
        fontSize: 22,
        marginBottom: 12,
        color: '#2563eb',
        fontWeight: 700,
        letterSpacing: 1,
        textShadow: '0 1px 0 #fff',
      }}>
        📊 Estatísticas Gerais
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>Total de Microrregiões</div>
          <div style={{ fontSize: 28, color: '#2563eb', fontWeight: 700 }}>{data.length}</div>
        </div>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>Microrregião Selecionada</div>
          <div style={{ fontSize: 18, color: '#0ea5e9', fontWeight: 600 }}>{selectedData?.microrregiao || 'Não informado'}</div>
        </div>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>População Total</div>
          <div style={{ fontSize: 18, color: '#0ea5e9', fontWeight: 600 }}>
            {data.reduce((sum, item) => sum + (parseInt(item.populacao) || 0), 0).toLocaleString('pt-BR')}
          </div>
        </div>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>IDH Médio</div>
          <div style={{ fontSize: 18, color: '#0ea5e9', fontWeight: 600 }}>
            {(
              data.reduce((sum, item) => sum + (parseFloat(item.idh_valor) || 0), 0) / (data.length || 1)
            ).toFixed(3)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 18, color: '#64748b', fontSize: 13 }}>
        <b>Data de geração:</b> {new Date().toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
} 