const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadenza.pt";
const ACCENT = "#7c5cff";
const INSTAGRAM_URL = "https://instagram.com/cadenza.pt";
const FACEBOOK_URL = "https://facebook.com/cadenza.pt";

/**
 * Molde HTML das mensagens da Cadenza — cabeçalho com a marca, corpo e um
 * botão de ação opcional. Estilos inline para máxima compatibilidade em email.
 */
export function renderEmail({
  heading,
  intro,
  bodyHtml,
  cta,
  footnote,
}: {
  heading: string;
  intro?: string;
  bodyHtml?: string;
  cta?: { label: string; url: string };
  footnote?: string;
}): string {
  return `
  <div style="margin:0;padding:24px;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececf1;">
      <tr>
        <td style="background:${ACCENT};padding:20px 28px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">Cadenza</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">${heading}</h1>
          ${intro ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>` : ""}
          ${bodyHtml ?? ""}
          ${
            cta
              ? `<div style="margin:24px 0;">
                   <a href="${cta.url}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:9999px;">${cta.label}</a>
                 </div>
                 <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Se o botão não funcionar, copia este link:</p>
                 <p style="margin:0;font-size:12px;color:${ACCENT};word-break:break-all;">${cta.url}</p>`
              : ""
          }
          ${footnote ? `<p style="margin:16px 0 0;font-size:13px;color:#6b7280;">${footnote}</p>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:18px 28px;border-top:1px solid #ececf1;">
          <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
            A Cadenza — a comunidade de músicos. <a href="${siteUrl}" style="color:${ACCENT};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>
          </p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            <a href="${INSTAGRAM_URL}" style="color:${ACCENT};text-decoration:none;">Instagram @cadenza.pt</a>
            &nbsp;·&nbsp;
            <a href="${FACEBOOK_URL}" style="color:${ACCENT};text-decoration:none;">Facebook @cadenza.pt</a>
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}
