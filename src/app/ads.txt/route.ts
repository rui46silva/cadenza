// Gera dinamicamente o /ads.txt exigido pela Google AdSense.
// Sem publisher id configurado, devolve vazio (evita servir um ficheiro inválido).
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!client) {
    return new Response("", {
      headers: { "content-type": "text/plain" },
    });
  }

  // O publisher id vem no formato `ca-pub-XXXX`; o ads.txt usa `pub-XXXX`.
  const publisherId = client.replace(/^ca-/, "");
  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: { "content-type": "text/plain" },
  });
}
