// netlify/functions/send-daily-reminders.js
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Esta función puede ser llamada por un cron job de Netlify
  // O por el frontend al cargar la página
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const { sorteoData } = JSON.parse(event.body);

    if (!sorteoData || !sorteoData.participants) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan datos del sorteo' })
      };
    }

    const appUrl = event.headers.origin || 'https://tu-sitio.netlify.app';
    const remindersSent = [];

    // Encontrar participantes que tienen amigo secreto pero no han registrado su deseo
    for (const participant of sorteoData.participants) {
      const hasSecretFriend = participant.secretFriend !== null;
      const hasWish = participant.giftWish || 
                     (participant.giftLinks && participant.giftLinks.length > 0) || 
                     (participant.giftImages && participant.giftImages.length > 0);

      if (hasSecretFriend && !hasWish) {
        // Obtener nombre del amigo secreto
        const secretFriend = sorteoData.participants.find(p => p.id === participant.secretFriend);
        
        const funnyMessages = [
          `🎅 ${secretFriend.name} está esperando tu lista...`,
          `🎄 ¡Ayuda a ${secretFriend.name} a encontrar tu regalo!`,
          `❄️ ${secretFriend.name} necesita pistas navideñas`,
          `🎁 Dale ideas a ${secretFriend.name}`,
          `⭐ ${secretFriend.name} quiere sorprenderte`
        ];

        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

        const msg = {
          to: participant.email,
          from: process.env.FROM_EMAIL,
          subject: `🎅 Recordatorio Navideño: ${randomMessage}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
              <!-- Advertencia SPAM -->
              <div style="background: #fff3cd; padding: 12px; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 13px; font-weight: 600;">
                  ⚠️ Revisa tu carpeta de SPAM
                </p>
              </div>

              <!-- Header -->
              <div style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); padding: 40px 30px; text-align: center; position: relative;">
                <div style="font-size: 60px; margin-bottom: 10px;">🎅</div>
                <h1 style="color: white; margin: 0; font-size: 26px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                  ⏰ Recordatorio Navideño
                </h1>
                <div style="position: absolute; top: 15px; left: 15px; font-size: 25px;">🎄</div>
                <div style="position: absolute; top: 15px; right: 15px; font-size: 25px;">🎁</div>
              </div>
              
              <div style="background: #fff8e1; padding: 30px;">
                <p style="font-size: 18px; color: #333; text-align: center;">
                  Hola <strong>${participant.name}</strong> 🎄
                </p>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border: 3px dashed #ffc107; text-align: center;">
                  <p style="font-size: 28px; margin: 0 0 10px 0;">😅</p>
                  <p style="font-size: 20px; margin: 0; color: #ff9800;">
                    <strong>${randomMessage}</strong>
                  </p>
                </div>
                
                <p style="color: #666; font-size: 16px; text-align: center;">
                  Todavía no has registrado tu deseo de regalo en 
                  <strong>"${sorteoData.name}"</strong> 🎁
                </p>
                
                <p style="color: #666; font-size: 15px; text-align: center;">
                  Tu amigo secreto <strong>${secretFriend.name}</strong> está esperando 
                  para saber qué regalarte... ¡Sin tu lista podría elegir algo que no te guste! 😱
                </p>

                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0;">
                  <p style="margin: 0 0 10px 0; color: #856404; font-size: 15px; text-align: center;">
                    💡 <strong>Puedes agregar:</strong>
                  </p>
                  <ul style="color: #856404; font-size: 14px; line-height: 1.8; margin: 0;">
                    <li>✏️ Descripción de lo que deseas</li>
                    <li>🔗 Links de productos (Amazon, etc.)</li>
                    <li>📸 Fotos del regalo ideal</li>
                    <li>📊 Nivel de prioridad</li>
                  </ul>
                </div>
                
                <!-- Botón Principal -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appUrl}" 
                     style="display: inline-block; 
                            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); 
                            color: white; 
                            padding: 20px 60px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: bold; 
                            font-size: 20px;
                            border: 4px solid #ffc107;
                            box-shadow: 0 6px 20px rgba(255, 193, 7, 0.6);
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    🎁 REGISTRAR MI DESEO AHORA
                  </a>
                </div>

                <!-- Link backup -->
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="margin: 0 0 5px 0; color: #856404; font-size: 12px;">
                    ¿El botón no funciona? Copia este link:
                  </p>
                  <a href="${appUrl}" style="color: #ff9800; word-break: break-all; font-size: 13px;">
                    ${appUrl}
                  </a>
                </div>

                <!-- Instrucciones -->
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="color: #ff9800; margin: 0 0 15px 0;">📋 Pasos rápidos:</h3>
                  <ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>Click en el botón amarillo de arriba</li>
                    <li>Ingresa tu email: <strong>${participant.email}</strong></li>
                    <li>Registra tu deseo de regalo</li>
                    <li>¡Listo! ${secretFriend.name} recibirá la notificación</li>
                  </ol>
                </div>
                
                <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                  🎅 ¡No dejes que te regalen calcetines otra vez! 🧦😅
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #ffc107; padding: 15px; text-align: center;">
                <p style="color: white; margin: 0; font-size: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                  🎄 ⭐ 🎁 ❄️ 🎅
                </p>
              </div>
            </div>
          `
        };

        try {
          await sgMail.send(msg);
          remindersSent.push(participant.email);
          console.log(`✅ Recordatorio enviado a ${participant.email}`);
        } catch (emailError) {
          console.error(`Error enviando a ${participant.email}:`, emailError);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        remindersSent: remindersSent.length,
        emails: remindersSent
      })
    };

  } catch (error) {
    console.error('Error en recordatorios:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al enviar recordatorios',
        details: error.message 
      })
    };
  }
};
