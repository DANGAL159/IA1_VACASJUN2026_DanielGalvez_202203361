import React, { useState } from 'react';
import { exportarFactura } from '../api/api';

export default function ExportButton({ facturaId }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (formato) => {
    setIsExporting(true);
    try {
      const blob = await exportarFactura(facturaId, formato); 
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${facturaId}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error al exportar el documento.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <button className="btn-icon" onClick={() => handleExport('pdf')} disabled={isExporting}>PDF</button>
      <button className="btn-icon" onClick={() => handleExport('xlsx')} disabled={isExporting}>Excel</button>
      <button className="btn-icon" onClick={() => handleExport('csv')} disabled={isExporting}>CSV</button>
    </div>
  );
}