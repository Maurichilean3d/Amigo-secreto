// netlify/functions/send-email.js
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Configurar SendGrid API Key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Parsear el body
    const { to, subject, body, html } = JSON.parse(event.body);

    // Validar campos requeridos
    if (!to || !subject || (!body && !html)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan campos requeridos: to, subject, body/html' })
      };
    }

    // Preparar el mensaje
    const msg = {
      to: to,
      from: process.env.FROM_EMAIL || 'noreply@tudominio.com',
      subject: subject,
      text: body,
      html: html || body
    };

    // Enviar email
    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email enviado correctamente' 
      })
    };

  } catch (error) {
    console.error('Error enviando email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al enviar el email',
        details: error.message 
      })
    };
  }
};

