// PDF Generator - Usando html2pdf.js
async function generatePDF() {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv || resultsDiv.style.display === 'none') {
    alert('Primero calcula los resultados / First calculate results');
    return;
  }

  const btn = document.getElementById('btnDescargarPDF');
  const originalText = btn.textContent;
  btn.textContent = 'Generando PDF...';
  btn.disabled = true;

  try {
    const element = document.getElementById('results');
    const opt = {
      margin: 10,
      filename: 'calculo-hospedaje.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generando PDF');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('btnDescargarPDF');
  if (btn) {
    btn.addEventListener('click', generatePDF);
  }
});
