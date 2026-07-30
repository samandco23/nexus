<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Invest - Vérification</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#10b981);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Nexus Invest</h1>
              <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px;">Investissez dans votre avenir</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">Bonjour <strong>{{ $first_name }}</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">Merci de vous être inscrit sur Nexus Invest. Voici votre code de vérification :</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px dashed #10b981;border-radius:12px;margin:20px 0;">
                <tr>
                  <td align="center" style="padding:24px 16px;">
                    <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;">Code de vérification</p>
                    <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:8px;color:#059669;font-family:'Courier New',monospace;">{{ $code }}</p>
                    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Ce code expire dans 10 minutes</p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#94a3b8;text-align:center;">Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;"><span style="font-weight:700;color:#10b981;">Nexus Invest</span> — Abidjan, Côte d'Ivoire</p>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">&copy; {{ date('Y') }} Nexus Invest. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
