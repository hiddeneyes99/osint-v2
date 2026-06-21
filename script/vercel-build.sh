#!/bin/sh
set -e
npx vite build --config vite.config.vercel.ts
npx esbuild api/_handler.ts --bundle --platform=node --format=cjs --outfile=api/index.js --alias:@shared=./shared --packages=external
npx esbuild api/cron/cleanup.ts --bundle --platform=node --format=cjs --outfile=api/cron/cleanup.js --alias:@shared=./shared --packages=external
