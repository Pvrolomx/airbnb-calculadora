// PDF Generator - Usando html2pdf.js (con debug mejorado)
async function generatePDF() {
  console.log('generatePDF called');
  
  const resultsDiv = document.getElementById('results');
  console.log('resultsDiv:', resultsDiv);
  console.log('resultsDiv display:', resultsDiv ? resultsDiv.style.display : 'N/A');
  
  if (!resultsDiv || resultsDiv.style.display === 'none') {
    alert('Primero calcula los resultados / First calculate results');
    return;
  }

  const btn = document.getElementById('btnDescargarPDF');
  if (!btn) {
    console.error('Button not found');
    return;
  }
  
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generando PDF...';
  btn.disabled = true;

  try {
    // Verificar que html2pdf existe
    if (typeof html2pdf === 'undefined') {
      throw new Error('html2pdf library not loaded');
    }
    
    console.log('html2pdf available, generating...');
    
    const opt = {
      margin: 10,
      filename: 'calculo-hospedaje.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(resultsDiv).save();
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generando PDF: ' + error.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Vincular evento al cargar
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up PDF button');
  const btn = document.getElementById('btnDescargarPDF');
  console.log('PDF button found:', btn);
  
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('PDF button clicked');
      generatePDF();
    });
    console.log('Click event attached to PDF button');
  } else {
    console.warn('btnDescargarPDF not found in DOM');
  }
});

// También exponer globalmente por si acaso
window.generatePDF = generatePDF;
