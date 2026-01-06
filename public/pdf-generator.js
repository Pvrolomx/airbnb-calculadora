// PDF Generator - Estilo Ledger profesional
async function generatePDF() {
  console.log('generatePDF called');
  
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv || resultsDiv.style.display === 'none') {
    alert('Primero calcula los resultados / First calculate results');
    return;
  }

  const btn = document.getElementById('btnDescargarPDF');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generando PDF...';
  btn.disabled = true;

  try {
    if (typeof html2pdf === 'undefined') {
      throw new Error('html2pdf library not loaded');
    }
    
    // Obtener valores actuales
    const ingresoBruto = document.getElementById('res-ingreso-bruto')?.textContent || '—';
    const comision = document.getElementById('res-comision')?.textContent || '—';
    const gastos = document.getElementById('res-gastos')?.textContent || '—';
    const impuestos = document.getElementById('res-impuestos')?.textContent || '—';
    const gananciaNeta = document.getElementById('res-ganancia-neta')?.textContent || '—';
    
    const labelIngreso = document.getElementById('res-label-ingreso-bruto')?.textContent?.trim() || 'Ingreso bruto';
    const labelComision = document.getElementById('res-label-comision')?.textContent?.trim() || 'Comisión plataforma';
    const labelGastos = document.getElementById('res-label-gastos')?.textContent?.trim() || 'Gastos directos';
    const labelImpuestos = document.getElementById('res-label-impuestos')?.textContent?.trim() || 'Impuestos';
    const labelNeta = document.getElementById('res-label-ganancia-neta')?.textContent?.trim() || 'Ganancia neta';
    
    // Detectar si ganancia es negativa
    const isNegative = gananciaNeta.includes('-');
    const netaColor = isNegative ? '#dc2626' : '#059669';
    
    // Crear HTML estilo ledger
    const ledgerHTML = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background: #ffffff; color: #1e293b;">
        <h2 style="text-align: center; color: #1e40af; margin-bottom: 24px; font-size: 20px; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          📊 Cálculo de Hospedaje
        </h2>
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-bottom: 24px;">
          Generado: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1; font-weight: 600;">${labelIngreso}</td>
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #059669;">${ingresoBruto}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1;">${labelComision}</td>
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1; text-align: right; color: #dc2626;">${comision}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1;">${labelGastos}</td>
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1; text-align: right; color: #dc2626;">${gastos}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1;">${labelImpuestos}</td>
            <td style="padding: 12px 16px; border: 1px solid #cbd5e1; text-align: right; color: #dc2626;">${impuestos}</td>
          </tr>
          <tr style="background: #1e40af;">
            <td style="padding: 14px 16px; border: 1px solid #1e3a8a; font-weight: 700; color: #ffffff; font-size: 15px;">${labelNeta}</td>
            <td style="padding: 14px 16px; border: 1px solid #1e3a8a; text-align: right; font-weight: 700; font-size: 18px; color: ${isNegative ? '#fca5a5' : '#86efac'};">${gananciaNeta}</td>
          </tr>
        </table>
        
        <div style="margin-top: 24px; padding: 12px; background: #f8fafc; border-left: 4px solid #3b82f6; font-size: 11px; color: #64748b;">
          <strong>Nota:</strong> Este cálculo es una estimación. Consulte a un contador para asesoría fiscal profesional.
        </div>
        
        <p style="text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8;">
          calculadora-hospedaje.vercel.app
        </p>
      </div>
    `;
    
    // Crear contenedor temporal
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ledgerHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    const opt = {
      margin: 10,
      filename: 'calculo-hospedaje.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(tempDiv.firstChild).save();
    console.log('PDF generated successfully');
    
    document.body.removeChild(tempDiv);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generando PDF: ' + error.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

window.generatePDF = generatePDF;

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('btnDescargarPDF');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      generatePDF();
    });
  }
});
