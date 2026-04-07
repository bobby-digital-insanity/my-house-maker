/** W3C traceparent so the server can continue this trace (checkout, traffic sim, etc.). */
export function buildW3CTraceparentHeaders(): Record<string, string> {
  const traceId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const spanId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { traceparent: `00-${traceId}-${spanId}-01` };
}
