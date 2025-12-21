// Dual Currency Logic
let currentCurrency = 'USD';
let fxRate = 20;

// Fetch FX rate
async function loadFxRate() {
  try {
    const res = await fetch('/fx-usd');
    const data = await res.json();
    if (data.ok && data.rate) {
      fxRate = data.rate;
    }
  } catch (err) {
    console.error('Error loading FX rate:', err);
  }
}

loadFxRate();

// Labels
const inputLabels = {
  USD: {
    tarifa_noche: 'Nightly rate (USD)',
    noches: 'Number of nights',
    tarifa_limpieza: 'Cleaning fee (USD)',
    gasto_limpieza_real: 'Actual cleaning cost (USD)',
    gasto_consumibles: 'Consumables/amenities (USD)',
    gasto_comisiones_otras: 'Other fees (USD)'
  },
  MXN: {
    tarifa_noche: 'Tarifa por noche (MXN)',
    noches: 'Número de noches',
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

async function formatDual(mxnAmount, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const usdAmount = (mxnAmount / fxRate).toFixed(2);
  const mxnFormatted = mxnAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const usdFormatted = parseFloat(usdAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  if (currentCurrency === 'USD') {
    element.innerHTML = `<strong>$${usdFormatted} USD</strong><br><span style="color:#9ca3af;font-size:0.9em">≈ $${mxnFormatted} MXN</span>`;
  } else {
    element.innerHTML = `<strong>$${mxnFormatted} MXN</strong><br><span style="color:#9ca3af;font-size:0.9em">≈ $${usdFormatted} USD</span>`;
  }
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
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
