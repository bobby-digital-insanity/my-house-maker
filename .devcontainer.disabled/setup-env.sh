#!/usr/bin/env bash
set -e

ENV_FILE=".env"

cat > "${ENV_FILE}" <<'EOF'
VITE_LAUNCHDARKLY_CLIENT_SIDE_ID=${VITE_LAUNCHDARKLY_CLIENT_SIDE_ID}
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
EOF

echo "Wrote environment variables to ${ENV_FILE}."

missing_vars=()
[[ -z "${VITE_LAUNCHDARKLY_CLIENT_SIDE_ID}" ]] && missing_vars+=("VITE_LAUNCHDARKLY_CLIENT_SIDE_ID")
[[ -z "${VITE_SUPABASE_URL}" ]] && missing_vars+=("VITE_SUPABASE_URL")
[[ -z "${VITE_SUPABASE_PUBLISHABLE_KEY}" ]] && missing_vars+=("VITE_SUPABASE_PUBLISHABLE_KEY")

if (( ${#missing_vars[@]} )); then
  echo "Warning: The following environment variables are not set inside the Codespace:"
  for var in "${missing_vars[@]}"; do
    echo "  - ${var}"
  done
  echo "Update your GitHub Codespaces secrets so these values populate automatically."
fi

