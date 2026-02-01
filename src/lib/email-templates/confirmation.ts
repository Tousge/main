import type { DevisFormData } from '../../types/devis';
import {
  TYPE_BUSINESS_LABELS,
  BUDGET_LABELS,
  DELAI_LABELS,
} from '../../types/devis';

export function generateConfirmationEmailHTML(data: DevisFormData, devisId: string): string {
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
                Votre demande a bien été reçue !
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
                      Récapitulatif de votre demande
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
                Si vous avez demandé à être recontacté par téléphone, nous vous appellerons dans les plus brefs délais au <strong style="color: #1d1d1f;">${data.telephone}</strong>.
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
