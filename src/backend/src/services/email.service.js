const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Para desarrollo usamos variables de entorno (Ethereal o SMTP real).
  // Si no hay SMTP configurado, nodemailer fallará al intentar enviar,
  // por lo que usamos try-catch bloqueando el petardeo del servidor.
  if (!process.env.SMTP_HOST) {
    return null; // SMTP no configurado
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    // Si no hay SMTP (entorno local sin config), solo loggeamos el mail.
    console.log(`[Email Service - STUB] TO: ${to} | SUBJ: ${subject}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"EcoAlerta" <noreply@ecoalerta.tfg>',
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.warn(`Failed to send email to ${to}:`, error.message);
  }
};

/**
 * Envía un correo notificando el cambio de estado de una incidencia
 */
const sendStatusChangeEmail = async (userEmail, incidentTitle, oldStatus, newStatus) => {
  const subject = `EcoAlerta: Actualización de incidencia "${incidentTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-w-lg mx-auto p-4">
      <h2 style="color: #0080FF;">Actualización de Incidencia</h2>
      <p>Hola,</p>
      <p>Te informamos que el estado de la incidencia <strong>"${incidentTitle}"</strong> ha cambiado.</p>
      <p>Nuevo estado: <strong>${newStatus.toUpperCase()}</strong></p>
      <p>Gracias por tu colaboración en EcoAlerta.</p>
    </div>
  `;
  await sendEmail(userEmail, subject, html);
};

/**
 * Envía un correo a una entidad cuando se le asigna una incidencia
 */
const sendAssignmentEmail = async (entityEmail, incidentTitle, incidentId) => {
  if (!entityEmail) return;

  const subject = `EcoAlerta: Nueva incidencia asignada - "${incidentTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-w-lg mx-auto p-4">
      <h2 style="color: #0080FF;">Nueva Asignación</h2>
      <p>Una nueva nueva incidencia medioambiental le ha sido asignada a su entidad.</p>
      <p><strong>Incidencia:</strong> ${incidentTitle}</p>
      <p>Por favor, acceda al portal de administración de EcoAlerta para revisar los detalles correspondientes (ID: ${incidentId}).</p>
    </div>
  `;
  await sendEmail(entityEmail, subject, html);
};

module.exports = {
  sendStatusChangeEmail,
  sendAssignmentEmail
};
