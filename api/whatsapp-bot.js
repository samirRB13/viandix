import twilio from 'twilio';

const FAQS = [
  {
    keys: ['horario', 'hora', 'cuando', 'cuándo', 'entrega', 'entregan', 'lunes'],
    respuesta: `🕐 *Horarios de entrega*\n\nEntregamos todos los *lunes* en La Rioja capital y alrededores en estos rangos:\n• 8:00 – 11:00 hs\n• 11:00 – 14:00 hs\n• 14:00 – 17:00 hs\n• 17:00 – 20:00 hs\n\nVos elegís el rango al hacer tu pedido.`
  },
  {
    keys: ['precio', 'cuesta', 'cuánto', 'cuanto', 'pack', 'packs', 'vale'],
    respuesta: `💰 *Nuestros packs*\n\nTenemos 4 opciones:\n• Pack 5 viandas: $14.000\n• Pack 10 viandas: $26.000\n• Pack 15 viandas: $37.500\n• Pack 20 viandas: $48.000\n\nTodos incluyen envío gratis 🚚\n\nPedí desde nuestra web: https://viandix.vercel.app`
  },
  {
    keys: ['zona', 'barrio', 'llegan', 'llego', 'direccion', 'dirección', 'donde', 'dónde'],
    respuesta: `📍 *Zona de entrega*\n\nActualmente entregamos en:\n• La Rioja Capital\n• Banda Florida\n• Alrededores hasta 15 km\n\nSi tenés dudas sobre tu dirección específica, escribinos y lo confirmamos.`
  },
  {
    keys: ['pago', 'pagar', 'transferencia', 'mercadopago', 'efectivo', 'tarjeta'],
    respuesta: `💳 *Métodos de pago*\n\nAceptamos:\n• Transferencia bancaria / CBU (Alias: VIANDIX)\n• MercadoPago (tarjeta, débito o dinero en cuenta)\n• Efectivo al recibir (solo zona capital)\n\nEl pago se hace al confirmar el pedido en la web.`
  },
  {
    keys: ['estudiante', 'estudiantes', 'descuento', 'universitario', 'facultad'],
    respuesta: `🎓 *Descuento estudiantes*\n\nTenemos un *15% de descuento* para estudiantes universitarios y terciarios de La Rioja.\n\nPara activarlo:\n1. Mandanos foto de tu credencial o constancia\n2. Te habilitamos el descuento\n3. ¡Listo!\n\nMás info: https://viandix.vercel.app/estudiantes.html`
  },
  {
    keys: ['congelar', 'freezer', 'congelada', 'congeladas', 'duran', 'vencimiento'],
    respuesta: `❄️ *Sobre las viandas congeladas*\n\nNuestras viandas:\n• Duran hasta *30 días* en el freezer\n• Se calientan en *5-10 minutos* en microondas u horno\n• Si no tenés freezer grande, podemos dividir tu pedido en 2 entregas semanales por un pequeño costo extra.`
  },
  {
    keys: ['cancelar', 'cambiar', 'modificar', 'devolucion', 'devolución'],
    respuesta: `🔄 *Cambios y cancelaciones*\n\nPodés modificar o cancelar tu pedido hasta el *domingo a las 20:00 hs* (antes del lunes de entrega).\n\nEscribinos por acá o al mismo número y lo gestionamos.`
  },
];

const MENU_RESPUESTA = `📋 *Menú esta semana*\n\nPara ver el menú completo y hacer tu pedido, entrá a:\n🌐 https://viandix.vercel.app\n\nEl menú se actualiza todos los miércoles con nuevas viandas.`;

const BIENVENIDA = `¡Hola! 👋 Soy el asistente de *Viandix*.\n\nPuedo ayudarte con:\n• Horarios de entrega\n• Precios y packs\n• Zona de cobertura\n• Métodos de pago\n• Descuento estudiantes\n\nO escribí *MENU* para ver el menú de esta semana.\n\nTambién podés hacer tu pedido directo en 👉 https://viandix.vercel.app`;

const NO_ENTIENDO = `No entendí bien tu consulta 😅\n\nPodés preguntarme sobre:\n• *horarios* de entrega\n• *precios* de los packs\n• *zona* de cobertura\n• *pago* y métodos\n• *estudiantes* y descuentos\n• *MENU* para ver las viandas\n\nO si preferís hablar con una persona, escribí *HUMANO* y te conectamos.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body;
  const from = body.From || '';
  const msgRaw = (body.Body || '').trim();
  const msg = msgRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let respuesta = '';

  // Comandos especiales
  if (msg === 'menu' || msg === 'menú') {
    respuesta = MENU_RESPUESTA;
  } else if (msg === 'humano' || msg === 'persona' || msg === 'atencion' || msg === 'atención') {
    respuesta = `👤 Te vamos a conectar con una persona de nuestro equipo.\n\nEn breve te contactamos. También podés escribirnos directamente al número de atención: https://wa.me/5493800000000`;
  } else if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas') || msg === 'hi' || msg === 'hey' || msg.length < 4) {
    respuesta = BIENVENIDA;
  } else {
    // Buscar en FAQs
    const faq = FAQS.find(f => f.keys.some(k => msg.includes(k)));
    respuesta = faq ? faq.respuesta : NO_ENTIENDO;
  }

  // Responder con TwiML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message><Body>${respuesta}</Body></Message>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml);
}
