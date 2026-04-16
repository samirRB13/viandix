export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { titulo, total, numero, nombre, email } = req.body;

  if (!total || !numero) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }

  const preference = {
    items: [
      {
        title: titulo || 'Pack Viandix',
        quantity: 1,
        unit_price: Number(total),
        currency_id: 'ARS',
      }
    ],
    payer: {
      name: nombre || '',
      email: email || 'cliente@viandix.com',
    },
    external_reference: numero,
    back_urls: {
      success: 'https://viandix.vercel.app/gracias.html?status=success&ref=' + numero,
      failure: 'https://viandix.vercel.app/gracias.html?status=failure&ref=' + numero,
      pending: 'https://viandix.vercel.app/gracias.html?status=pending&ref=' + numero,
    },
    auto_return: 'approved',
    statement_descriptor: 'VIANDIX',
    notification_url: 'https://viandix.vercel.app/api/mp-webhook',
  };

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MP Error:', data);
      return res.status(500).json({ error: data.message || 'Error de MercadoPago' });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point,
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
