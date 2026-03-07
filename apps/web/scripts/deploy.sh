#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(dirname "${SCRIPT_DIR}")"
OG_DIR="${WEB_DIR}/../../node_modules/next/dist/compiled/@vercel/og"

cd "${WEB_DIR}"

echo "Stubbing unused @vercel/og to reduce bundle size..."
printf '\x00\x61\x73\x6d\x01\x00\x00\x00' >"${OG_DIR}/resvg.wasm"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00' >"${OG_DIR}/yoga.wasm"
echo 'module.exports={ImageResponse:class ImageResponse{constructor(){throw new Error("@vercel/og stubbed out")}}}' >"${OG_DIR}/index.edge.js"
echo 'module.exports={ImageResponse:class ImageResponse{constructor(){throw new Error("@vercel/og stubbed out")}}}' >"${OG_DIR}/index.node.js"

echo "Building with OpenNext..."
npx opennextjs-cloudflare build

rm -f .open-next/assets/_redirects 2>/dev/null || true

echo "Deploying to Cloudflare Workers..."
npx wrangler deploy --keep-vars

echo "Restoring @vercel/og files..."
cd "${WEB_DIR}/../.." && npm rebuild next 2>/dev/null || true

echo "Deploy complete!"
