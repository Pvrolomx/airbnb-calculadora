// api/fx-usd.js
// Endpoint para obtener tipo de cambio USD/MXN de Banxico
// NO modifica fórmulas, solo provee datos de TC

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const token = process.env.BANXICO_TOKEN;
    if (!token) {
      return res.status(500).json({ ok: false, error: 'No token configured' });
    }

    const response = await fetch(
      'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno',
      {
        headers: {
          'Bmx-Token': token,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Banxico API error: ' + response.status);
    }

    const data = await response.json();
    const serie = data?.bmx?.series?.[0];
    const dato = serie?.datos?.[0];

    if (!dato) {
      throw new Error('No data from Banxico');
    }

    const rate = parseFloat(dato.dato.replace(',', ''));
    
    if (!Number.isFinite(rate)) {
      throw new Error('Invalid rate');
    }

    return res.status(200).json({
      ok: true,
      rate: rate,
      fecha: dato.fecha,
      fuente: 'Banxico'
    });

  } catch (error) {
    console.error('FX Error:', error.message);
    return res.status(500).json({ ok: false, error: 'FX fetch failed' });
  }
}
