import { Resend } from 'resend';
import type { DevisFormData } from '../types/devis';
import { generateConfirmationEmailHTML } from './email-templates/confirmation';
import { generateAdminNotificationEmailHTML } from './email-templates/admin-notification';

// Initialisation de Resend
const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Configuration des emails
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'Tousgether <noreply@tousgether.com>';
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || 'contact@tousgether.com';
const SITE_URL = import.meta.env.SITE_URL || 'https://tousgether.com';

/**
 * Envoie un email de confirmation à l'utilisateur après sa demande de devis
 */
export async function sendConfirmationEmail(data: DevisFormData, devisId: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Votre demande de devis a bien été reçue - Tousgether',
      html: generateConfirmationEmailHTML(data, devisId),
    });

    if (error) {
      console.error('Erreur envoi email confirmation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error);
    return false;
  }
}

/**
 * Envoie une notification à l'admin lors d'une nouvelle demande de devis
 */
export async function sendAdminNotificationEmail(data: DevisFormData, devisId: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nouvelle demande de devis - ${data.entreprise}`,
      html: generateAdminNotificationEmailHTML(data, devisId, SITE_URL),
    });

    if (error) {
      console.error('Erreur envoi email admin:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur envoi email admin:', error);
    return false;
  }
}

/**
 * Envoie les deux emails (confirmation + notification admin)
 */
export async function sendDevisEmails(data: DevisFormData, devisId: string): Promise<{ confirmationSent: boolean; adminSent: boolean }> {
  const [confirmationSent, adminSent] = await Promise.all([
    sendConfirmationEmail(data, devisId),
    sendAdminNotificationEmail(data, devisId),
  ]);

  return { confirmationSent, adminSent };
}
