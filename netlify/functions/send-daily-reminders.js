// Esta función se puede llamar manualmente para enviar recordatorios
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Recordatorios enviados' 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al enviar recordatorios',
        details: error.message 
      })
    };
  }
};

