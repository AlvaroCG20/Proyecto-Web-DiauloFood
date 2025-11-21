const nodemailer = require('nodemailer');
require('dotenv').config();

// =============================================
// CONFIGURAR TRANSPORTER
// =============================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servicio de email listo para enviar mensajes');
  }
});

// =============================================
// ENVIAR EMAIL DE BIENVENIDA (REGISTRO)
// =============================================
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: '🎉 Bienvenido a DiauloFood',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍽️ DiauloFood</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">¡Hola ${userName}! 👋</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Gracias por registrarte en <strong>DiauloFood</strong>, tu plataforma de gestión de restaurante.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Ya puedes acceder a tu cuenta y comenzar a gestionar:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.8;">
            <li>📋 Mesas y reservas</li>
            <li>🍕 Productos del menú</li>
            <li>💰 Órdenes y ventas</li>
            <li>👥 Equipo de garzones</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:8100/auth" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;">
              Iniciar Sesión
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Si tienes alguna pregunta, responde a este correo.
          </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} DiauloFood - Sistema de Gestión de Restaurantes
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenida enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de bienvenida:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// ENVIAR EMAIL DE CONFIRMACIÓN DE RESERVA
// =============================================
const sendReservationEmail = async (toEmail, reservationDetails) => {
  const { customerName, tableNumber, reservationTime, partySize } = reservationDetails;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: '✅ Confirmación de Reserva - DiauloFood',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍽️ DiauloFood</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Reserva Confirmada ✅</h2>
          
          <p style="color: #666; font-size: 16px;">
            Hola <strong>${customerName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px;">
            Tu reserva ha sido confirmada con los siguientes detalles:
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%; color: #666;">
              <tr>
                <td style="padding: 10px 0;"><strong>🪑 Mesa:</strong></td>
                <td style="padding: 10px 0; text-align: right;">Mesa ${tableNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>👥 Personas:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${partySize} personas</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>🕐 Hora:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${reservationTime}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Te esperamos en DiauloFood. ¡Que disfrutes tu experiencia! 🎉
          </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} DiauloFood
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de reserva enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de reserva:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// ENVIAR EMAIL DE NUEVA ORDEN
// =============================================
const sendOrderNotification = async (toEmail, orderDetails) => {
  const { orderNumber, tableNumber, total, items } = orderDetails;
  
  const itemsList = items.map(item => 
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `🛎️ Nueva Orden #${orderNumber} - Mesa ${tableNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍽️ DiauloFood</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Nueva Orden Registrada 🛎️</h2>
          
          <p style="color: #666; font-size: 16px;">
            <strong>Orden #${orderNumber}</strong> - Mesa ${tableNumber}
          </p>
          
          <table style="width: 100%; background-color: white; border-radius: 10px; overflow: hidden; margin: 20px 0;">
            <thead>
              <tr style="background-color: #667eea;">
                <th style="padding: 15px; color: white; text-align: left;">Producto</th>
                <th style="padding: 15px; color: white; text-align: center;">Cant.</th>
                <th style="padding: 15px; color: white; text-align: right;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background-color: #f0f0f0;">
                <td colspan="2" style="padding: 15px; font-weight: bold;">TOTAL</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">$${total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} DiauloFood
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de orden enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de orden:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// EXPORTAR FUNCIONES
// =============================================
module.exports = {
  sendWelcomeEmail,
  sendReservationEmail,
  sendOrderNotification
};