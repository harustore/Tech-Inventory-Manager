import { randomUUID } from "node:crypto";
import { Router } from "express";

const router = Router();
const pendingStates = new Set<string>();
let mercadoLibreAccessToken: string | null = null;

router.get("/connect", (_req, res) => {
  const clientId = process.env.MERCADOLIBRE_CLIENT_ID;
  const redirectUri = process.env.MERCADOLIBRE_REDIRECT_URI;
  if (!clientId || !redirectUri) { res.status(500).send("Faltan credenciales de MercadoLibre en el .env"); return; }
  const state = randomUUID();
  pendingStates.add(state);
  const params = new URLSearchParams({ response_type: "code", client_id: clientId, redirect_uri: redirectUri, state });
  res.redirect(`https://auth.mercadolibre.cl/authorization?${params.toString()}`);
});

router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) { res.status(400).send(`MercadoLibre rechazó la conexión: ${String(error)}`); return; }
  if (typeof code !== "string" || typeof state !== "string" || !pendingStates.has(state)) { res.status(400).send("Retorno de MercadoLibre inválido o expirado."); return; }
  pendingStates.delete(state);
  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", client_id: process.env.MERCADOLIBRE_CLIENT_ID ?? "", client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET ?? "", code, redirect_uri: process.env.MERCADOLIBRE_REDIRECT_URI ?? "" }) });
    if (!response.ok) throw new Error(`MercadoLibre respondió ${response.status}`);
    const token = await response.json() as { access_token?: string };
    mercadoLibreAccessToken = token.access_token ?? null;
    if (!mercadoLibreAccessToken) throw new Error("No se recibió access_token");
    res.send("<h2>MercadoLibre conectado correctamente</h2><p>Ya puedes volver a TechStock.</p>");
  } catch (connectionError) { console.error("Error conectando MercadoLibre", connectionError); res.status(502).send("No se pudo completar la conexión con MercadoLibre."); }
});

export function hasMercadoLibreConnection() { return Boolean(mercadoLibreAccessToken); }
export default router;
