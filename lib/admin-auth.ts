const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "bookverse-default-super-secret-key-1234567890-parchment-crimson";

// Helper to convert string to ArrayBuffer
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

// Helper to convert ArrayBuffer or Uint8Array to base64url string
function bufferToBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Helper to convert base64url to ArrayBuffer
function base64UrlToBuffer(str: string): ArrayBuffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Sign token
export async function signAdminToken(payload: { id: string; username: string; role: string }) {
  const header = { alg: "HS256", typ: "JWT" };
  
  // Session expires in 4 hours
  const exp = Math.floor(Date.now() / 1000) + 4 * 60 * 60;
  const tokenPayload = { ...payload, exp };

  const headerB64 = bufferToBase64Url(stringToBuffer(JSON.stringify(header)));
  const payloadB64 = bufferToBase64Url(stringToBuffer(JSON.stringify(tokenPayload)));
  const message = `${headerB64}.${payloadB64}`;

  const subtle = (globalThis as any).crypto.subtle;

  const key = await subtle.importKey(
    "raw",
    stringToBuffer(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await subtle.sign(
    "HMAC",
    key,
    stringToBuffer(message)
  );

  const signatureB64 = bufferToBase64Url(signature);
  return `${message}.${signatureB64}`;
}

// Verify token
export async function verifyAdminToken(token: string): Promise<{ id: string; username: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const message = `${headerB64}.${payloadB64}`;

    const subtle = (globalThis as any).crypto.subtle;

    const key = await subtle.importKey(
      "raw",
      stringToBuffer(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = base64UrlToBuffer(signatureB64);
    const isValid = await subtle.verify(
      "HMAC",
      key,
      signature,
      stringToBuffer(message)
    );

    if (!isValid) return null;

    const payloadStr = new TextDecoder().decode(base64UrlToBuffer(payloadB64));
    const payload = JSON.parse(payloadStr);

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      username: payload.username,
      role: payload.role
    };
  } catch (err) {
    console.error("JWT Verification error:", err);
    return null;
  }
}
// End of file
