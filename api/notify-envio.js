import twilio from 'twilio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { telefono, nombre, numero, horario, lunes1, custom_msg } = req.body;

  if (!telefono || !numero) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }

  // Formatear número argentino → WhatsApp internacional
  let tel = telefono.replace(/\s+/g, '').replace(/-/g, '');
  if (tel.startsWith('0')) tel = tel.slice(1);
  if (!tel.startsWith('+')) {
    if (tel.startsWith('549')) tel = '+' + tel;
    else if (tel.startsWith('54')) tel = '+' + tel;
    else tel = '+549' + tel;
  }

  const mensaje = custom_msg ||
    `🚚 *¡Tu pedido Viandix está en camino!*\n\n` +
    `Hola ${nombre || 'cliente'}! Tu pedido *#${numero}* ya salió y está en camino a tu casa.\n\n` +
    `📅 Entrega: *${lunes1 || 'hoy'}*\n` +
    `🕐 Horario: *${horario || 'el turno elegido'}*\n\n` +
    `Tené listo un espacito en el freezer ❄️\n\n` +
    `Cualquier consulta respondé este mensaje.`;

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${tel}`,
      body: mensaje,
    });

    return res.status(200).json({ success: true, sid: message.sid });
  } catch (err) {
    console.error('Twilio error:', err);
    return res.status(500).json({ error: err.message });
  }
}
