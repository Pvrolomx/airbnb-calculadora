// api/crear-sesion.js
// Vercel Serverless Function para crear sesión de pago Stripe

const Stripe = require('stripe');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY no configurada');
    return res.status(500).json({ 
      ok: false, 
      error: 'Configuración de pago incompleta' 
    });
  }

  try {
    const stripe = new Stripe(secretKey);
    
    // Obtener el origen para construir URLs de retorno
    const origin = req.headers.origin || req.headers.referer || 'https://airbnb-calculadora.vercel.app';
    const baseUrl = origin.replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            unit_amount: 1000, // $10.00 MXN en centavos
            product_data: {
              name: '10 cálculos adicionales',
              description: 'Paquete de 10 cálculos para la calculadora de hospedaje',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?payment=success`,
      cancel_url: `${baseUrl}/?payment=cancel`,
    });

    return res.status(200).json({
      ok: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al crear sesión de pago',
    });
  }
};
