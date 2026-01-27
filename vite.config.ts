import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // HTTPS configuration - use certificates if available, otherwise use self-signed
  const getHttpsConfig = () => {
    const certPath = process.env.SSL_CERT_PATH;
    const keyPath = process.env.SSL_KEY_PATH;
    
    if (certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };
    }
    // Use self-signed certificates for development
    return true;
  };

  const httpsConfig = getHttpsConfig();
  
  // For local development, use HTTP and localhost unless HTTPS is explicitly requested
  const useHttps = process.env.VITE_USE_HTTPS === 'true';
  const serverHost = process.env.VITE_HOST || (useHttps ? "::" : "localhost");

  return {
    server: {
      host: serverHost,
      port: 8080,
      // Only use HTTPS if explicitly enabled via environment variable
      // @ts-expect-error - Vite supports https: true for self-signed certs, but types are strict
      https: useHttps ? httpsConfig : false,
    },
    preview: {
      host: "::", // Listen on all interfaces (required for CloudFront/EC2)
      port: 4173, // Explicitly set preview port
      allowedHosts: true, // Allow all hosts - CloudFront handles security
      // Only use HTTPS if explicitly enabled via environment variable
      // CloudFront typically connects via HTTP, so HTTPS may cause connection issues
      // @ts-expect-error - Vite supports https: true for self-signed certs, but types are strict
      https: process.env.VITE_PREVIEW_HTTPS === 'true' ? httpsConfig : false,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});