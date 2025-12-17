#!/bin/bash

echo "=== FleetTrack Cloudflare Workers Deploy ==="
echo ""

# Step 1: Build frontend
echo "1. Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi

# Step 2: Copy to workers/public
echo "2. Copying frontend to workers/public..."
mkdir -p workers/public
rm -rf workers/public/*
cp -r dist/public/* workers/public/

# Step 3: Deploy to Cloudflare
echo "3. Deploying to Cloudflare Workers..."
cd workers
npx wrangler deploy

echo ""
echo "=== Deploy complete! ==="
echo "Your app is live at: https://frota.20230043.workers.dev"
