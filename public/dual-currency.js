console.log('🔵 Dual Currency Script Loaded');

// Dual Currency Logic
let currentCurrency = 'USD';
let fxRate = 20;
let fxRateLoaded = false;

// Fetch FX rate con mejor logging
async function loadFxRate() {
  try {
    console.log('🔵 Fetching FX rate from Banxico...');
    const res = await fetch('/api/fx-usd');
    const data = await res.json();
    if (data.ok && data.rate) {
      fxRate = data.rate;
      fxRateLoaded = true;
      console.log(`✅ FX Rate loaded: ${fxRate} MXN/USD (${data.fecha})`);
      // Actualizar indicador en UI si existe
      const fxIndicator = document.getElementById('fx-rate-indicator');
      if (fxIndicator) {
        fxIndicator.textContent = `TC: $${fxRate.toFixed(2)}`;
        fxIndicator.title = `Tipo de cambio Banxico: ${data.fecha}`;
      }
    } else {
      console.warn('⚠️ FX API response not ok, using default:', fxRate);
    }
  } catch (err) {
    console.error('❌ Error loading FX rate:', err);
    console.warn('⚠️ Using fallback rate:', fxRate);
  }
}

loadFxRate();

// Labels - SOLO campos monetarios (noches NO es monetario)
const inputLabels = {
  USD: {
    tarifa_noche: 'Nightly rate (USD)',
    tarifa_limpieza: 'Cleaning fee (USD)',
    gasto_limpieza_real: 'Actual cleaning cost (USD)',
    gasto_consumibles: 'Consumables/amenities (USD)',
    gasto_comisiones_otras: 'Other fees (USD)'
  },
  MXN: {
    tarifa_noche: 'Tarifa por noche (MXN)',
    tarifa_limpieza: 'Cargo de limpieza (MXN)',
    gasto_limpieza_real: 'Costo real de limpieza (MXN)',
    gasto_consumibles: 'Consumibles/amenidades (MXN)',
    gasto_comisiones_otras: 'Otras comisiones (MXN)'
  }
};

function updateInputLabels(currency) {
  const labels = inputLabels[currency];
  for (const [key, text] of Object.entries(labels)) {
    const labelEl = document.getElementById('label-' + key);
    if (labelEl) labelEl.textContent = text;
  }
  
  const currencyLabel = document.getElementById('label-currency');
  if (currencyLabel) {
    currencyLabel.textContent = currency === 'USD' ? 'Calculate in:' : 'Calcular en:';
  }
}

function convertFormToMXN(formData) {
  if (currentCurrency === 'MXN') return formData;
  
  const converted = {...formData};
  const fieldsToConvert = ['tarifa_noche', 'tarifa_limpieza', 'gasto_limpieza_real', 
                            'gasto_consumibles', 'gasto_comisiones_otras'];
  
  for (const field of fieldsToConvert) {
    if (converted[field]) {
      converted[field] = parseFloat(converted[field]) * fxRate;
    }
  }
  
  return converted;
}

// Función para formatear montos en dual currency
// Recibe monto en MXN (que es lo que devuelve el backend)
// Muestra en la moneda seleccionada como principal
function formatDualAmount(mxnAmount) {
  const usdAmount = mxnAmount / fxRate;
  const mxnFormatted = mxnAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const usdFormatted = usdAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  if (currentCurrency === 'USD') {
    // Usuario eligió USD → Mostrar USD arriba, MXN abajo
    return `<strong>$${usdFormatted} USD</strong><br><span style="color:#9ca3af;font-size:0.9em">≈ $${mxnFormatted} MXN</span>`;
  } else {
    // Usuario eligió MXN → Mostrar MXN arriba, USD abajo
    return `<strong>$${mxnFormatted} MXN</strong><br><span style="color:#9ca3af;font-size:0.9em">≈ $${usdFormatted} USD</span>`;
  }
}

// Mantener compatibilidad con función anterior
async function formatDual(mxnAmount, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.innerHTML = formatDualAmount(mxnAmount);
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔵 DOMContentLoaded - Initializing dual currency');
  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  currencyRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updateInputLabels(currentCurrency);
      localStorage.setItem('preferredCurrency', currentCurrency);
    });
  });
  
  const savedCurrency = localStorage.getItem('preferredCurrency');
  if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'MXN')) {
    currentCurrency = savedCurrency;
    const radio = document.getElementById('curr-' + savedCurrency.toLowerCase());
    if (radio) {
      radio.checked = true;
      updateInputLabels(currentCurrency);
    }
  } else {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('es')) {
      currentCurrency = 'MXN';
      const radioMXN = document.getElementById('curr-mxn');
      if (radioMXN) {
        radioMXN.checked = true;
        updateInputLabels('MXN');
      }
    } else {
      updateInputLabels('USD');
    }
  }
});
