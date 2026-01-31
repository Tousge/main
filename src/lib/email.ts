import { Resend } from 'resend';
import type { DevisFormData } from '../types/devis';
import {
  TYPE_BUSINESS_LABELS,
  INTEGRATION_MLM_LABELS,
  MODELE_MLM_LABELS,
  OBJECTIF_MLM_LABELS,
  FONCTIONNALITE_LABELS,
  TECHNOLOGIE_LABELS,
  BUDGET_LABELS,
  DELAI_LABELS,
} from '../types/devis';

// Initialisation de Resend (sera configuré avec la clé API via variable d'environnement)
const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Configuration des emails
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'Tousgether <noreply@tousgether.com>';
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || 'contact@tousgether.com';

/**
 * Envoie un email de confirmation à l'utilisateur après sa demande de devis
 */
export async function sendConfirmationEmail(data: DevisFormData, devisId: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: '✅ Votre demande de devis a bien été reçue - Tousgether',
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
      subject: `🆕 Nouvelle demande de devis - ${data.entreprise}`,
      html: generateAdminNotificationEmailHTML(data, devisId),
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

// ============================================================================
// Templates HTML des emails
// ============================================================================

function generateConfirmationEmailHTML(data: DevisFormData, devisId: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de votre demande de devis</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #803B85 0%, #9B4BA0 100%); border-radius: 16px 16px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Tousgether</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Votre partenaire MLM</p>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; padding: 40px 30px;">
          <tr>
            <td>
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 24px; font-weight: 600;">
                ✅ Votre demande a bien été reçue !
              </h2>
              
              <p style="margin: 0 0 20px; color: #6e6e73; font-size: 16px; line-height: 1.6;">
                Bonjour <strong style="color: #1d1d1f;">${data.nom_prenom}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #6e6e73; font-size: 16px; line-height: 1.6;">
                Nous avons bien reçu votre demande de devis et nous vous remercions de votre confiance. Notre équipe analyse actuellement vos besoins et reviendra vers vous très rapidement.
              </p>

              <!-- Récapitulatif -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 16px; color: #1d1d1f; font-size: 18px; font-weight: 600;">
                      📋 Récapitulatif de votre demande
                    </h3>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Référence</td>
                        <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500; text-align: right;">#${devisId.slice(0, 8).toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; border-top: 1px solid #e5e5e7;">Entreprise</td>
                        <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500; text-align: right; border-top: 1px solid #e5e5e7;">${data.entreprise}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; border-top: 1px solid #e5e5e7;">Type de projet</td>
                        <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500; text-align: right; border-top: 1px solid #e5e5e7;">${TYPE_BUSINESS_LABELS[data.type_business] || data.type_business}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; border-top: 1px solid #e5e5e7;">Budget estimé</td>
                        <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500; text-align: right; border-top: 1px solid #e5e5e7;">${BUDGET_LABELS[data.budget] || data.budget}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; border-top: 1px solid #e5e5e7;">Délai souhaité</td>
                        <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500; text-align: right; border-top: 1px solid #e5e5e7;">${DELAI_LABELS[data.delai] || data.delai}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #6e6e73; font-size: 16px; line-height: 1.6;">
                📞 Si vous avez demandé à être recontacté par téléphone, nous vous appellerons dans les plus brefs délais au <strong style="color: #1d1d1f;">${data.telephone}</strong>.
              </p>

              <p style="margin: 0; color: #6e6e73; font-size: 16px; line-height: 1.6;">
                À très bientôt,<br>
                <strong style="color: #803B85;">L'équipe Tousgether</strong>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #1d1d1f; border-radius: 0 0 16px 16px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="margin: 0 0 10px; color: rgba(255,255,255,0.7); font-size: 14px;">
                © ${new Date().getFullYear()} Tousgether - Tous droits réservés
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                Cet email a été envoyé suite à votre demande de devis sur notre site.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function generateAdminNotificationEmailHTML(data: DevisFormData, devisId: string): string {
  // Formatage des tableaux pour l'affichage
  const integrationLabels = data.integration_mlm.map(i => INTEGRATION_MLM_LABELS[i] || i).join(', ');
  const modeleLabels = data.modele_mlm.map(m => MODELE_MLM_LABELS[m] || m).join(', ');
  const fonctionnaliteLabels = data.fonctionnalites.map(f => FONCTIONNALITE_LABELS[f] || f).join(', ');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande de devis</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #E84A8A 0%, #803B85 100%); border-radius: 16px 16px 0 0; padding: 30px;">
          <tr>
            <td>
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                🆕 Nouvelle demande de devis
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Référence: #${devisId.slice(0, 8).toUpperCase()}
              </p>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; padding: 30px;">
          <tr>
            <td>
              <!-- Informations client -->
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #803B85;">
                👤 Informations client
              </h2>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; width: 150px;">Nom & Prénom</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">${data.nom_prenom}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Entreprise</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">${data.entreprise}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; color: #803B85; font-size: 14px; font-weight: 500;">
                    <a href="mailto:${data.email}" style="color: #803B85; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Téléphone</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">
                    <a href="tel:${data.telephone}" style="color: #803B85; text-decoration: none;">${data.telephone}</a>
                    ${data.recontact_telephone ? '<span style="background: #E84A8A; color: white; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">Souhaite être rappelé</span>' : ''}
                  </td>
                </tr>
                ${data.site_web ? `
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Site web</td>
                  <td style="padding: 8px 0; color: #803B85; font-size: 14px; font-weight: 500;">
                    <a href="${data.site_web}" target="_blank" style="color: #803B85; text-decoration: none;">${data.site_web}</a>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Projet MLM -->
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #803B85;">
                🎯 Projet MLM
              </h2>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; width: 150px;">Type de business</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">
                    ${TYPE_BUSINESS_LABELS[data.type_business] || data.type_business}
                    ${data.type_business_autre ? ` (${data.type_business_autre})` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Intégration MLM</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">${integrationLabels}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Modèle MLM</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">${modeleLabels}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Objectif principal</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">
                    ${OBJECTIF_MLM_LABELS[data.objectif_mlm] || data.objectif_mlm}
                    ${data.objectif_mlm_autre ? ` (${data.objectif_mlm_autre})` : ''}
                  </td>
                </tr>
              </table>

              <!-- Fonctionnalités -->
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #803B85;">
                ⚙️ Fonctionnalités souhaitées
              </h2>
              
              <p style="margin: 0 0 30px; color: #1d1d1f; font-size: 14px; line-height: 1.6;">
                ${fonctionnaliteLabels}
                ${data.fonctionnalites_autre ? `<br><em style="color: #6e6e73;">Autre: ${data.fonctionnalites_autre}</em>` : ''}
              </p>

              <!-- Technique -->
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #803B85;">
                🔧 Informations techniques
              </h2>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px; width: 150px;">Technologie</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">${TECHNOLOGIE_LABELS[data.technologie] || data.technologie}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Base de données</td>
                  <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 500;">
                    ${data.base_donnees_existante ? 'Oui' : 'Non'}
                    ${data.base_donnees_details ? `<br><em style="color: #6e6e73;">${data.base_donnees_details}</em>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Budget & Délais -->
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #803B85;">
                💰 Budget & Délais
              </h2>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 16px; background: rgba(128, 59, 133, 0.1); border-radius: 8px 0 0 8px; color: #1d1d1f; font-size: 16px; font-weight: 600; width: 50%;">
                    ${BUDGET_LABELS[data.budget] || data.budget}
                  </td>
                  <td style="padding: 12px 16px; background: rgba(232, 74, 138, 0.1); border-radius: 0 8px 8px 0; color: #1d1d1f; font-size: 16px; font-weight: 600; width: 50%;">
                    ${DELAI_LABELS[data.delai] || data.delai}
                  </td>
                </tr>
              </table>

              <!-- Description -->
              <h2 style="margin: 0 0 20px; color: #1d1d1f; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #803B85;">
                📝 Description du projet
              </h2>
              
              <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0; color: #1d1d1f; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.description_projet}</p>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${import.meta.env.SITE_URL || 'https://tousgether.com'}/admin/devis/${devisId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #803B85 0%, #9B4BA0 100%); color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 980px;">
                      Voir le devis dans l'admin →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #1d1d1f; border-radius: 0 0 16px 16px; padding: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                Email envoyé automatiquement le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}








