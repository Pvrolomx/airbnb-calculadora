// Sistema de creditos - 10 gratis (con gradiente de colores + i18n)
function getCredits(){const c=localStorage.getItem('calculos');return c===null?10:parseInt(c);}
function setCredits(n){localStorage.setItem('calculos',n);updateDisplay();}
function useCredit(){const c=getCredits();if(c>0){setCredits(c-1);return true;}return false;}
function addCredits(n){setCredits(getCredits()+n);}

function updateDisplay(){
  const c=getCredits();
  const lang=localStorage.getItem('lang')||'es';
  const el=document.getElementById('credit-counter');
  
  // Textos según idioma
  const texts={
    es:{
      remaining:'⚡ '+c+' cálculos restantes',
      none:'⚠️ Sin cálculos disponibles',
      btnNone:'Sin cálculos - Compra más',
      btnNormal:'Ver cuánto me queda',
      alert:'No tienes cálculos disponibles. Compra más para continuar.',
      paymentSuccess:'¡Pago exitoso! +10 cálculos agregados a tu cuenta'
    },
    en:{
      remaining:'⚡ '+c+' calculations remaining',
      none:'⚠️ No calculations available',
      btnNone:'No calculations - Buy more',
      btnNormal:'See my net earnings',
      alert:'You have no calculations available. Buy more to continue.',
      paymentSuccess:'Payment successful! +10 calculations added to your account'
    }
  };
  
  const t=texts[lang]||texts.es;
  
  if(el){
    if(c<=0){
      el.textContent=t.none;
      el.style.background='#dc2626';
    } else {
      el.textContent=t.remaining;
      
      // Gradiente de colores
      if(c>=9){
        el.style.background='#10b981';
      } else if(c===8){
        el.style.background='#22c55e';
      } else if(c===7){
        el.style.background='#84cc16';
      } else if(c===6){
        el.style.background='#eab308';
      } else if(c===5){
        el.style.background='#f59e0b';
      } else if(c===4){
        el.style.background='#f97316';
      } else if(c===3){
        el.style.background='#fb923c';
      } else if(c===2){
        el.style.background='#f87171';
      } else if(c===1){
        el.style.background='#ef4444';
      }
    }
  }
  
  // Actualizar botón de calcular
  const btnText=document.getElementById('btn-calcular-text');
  const btn=document.getElementById('btn-calcular');
  
  if(btn){
    btn.disabled=c<=0;
  }
  
  if(btnText){
    if(c<=0){
      btnText.textContent=t.btnNone;
    } else {
      btnText.textContent=t.btnNormal;
    }
  }
  
  // Mostrar/ocultar botón de compra según créditos
  const buyButton=document.getElementById('btnComprarReporte');
  const pdfBlock=document.getElementById('pdf-block');
  
  if(buyButton){
    buyButton.style.display=c<=0?'block':'none';
  }
  
  if(pdfBlock){
    pdfBlock.style.display=c<=0?'block':'none';
  }
  
  window._creditTexts=t;
}

// Exponer updateDisplay globalmente
window.updateDisplay=updateDisplay;

const originalUseCredit=useCredit;
window.useCredit=function(){
  const result=originalUseCredit();
  if(!result && window._creditTexts){
    alert(window._creditTexts.alert);
  }
  return result;
};

window.addEventListener('load',()=>{
  updateDisplay();
  const u=new URLSearchParams(window.location.search);
  if(u.get('payment')==='success'){
    addCredits(10);
    window.history.replaceState({},document.title,'/');
    if(window._creditTexts){
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
      `;
      notification.textContent = '✅ ' + window._creditTexts.paymentSuccess;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 4000);
    }
  }
});

if(!document.querySelector('style[data-credits-animations]')){
  const style = document.createElement('style');
  style.setAttribute('data-credits-animations', 'true');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
