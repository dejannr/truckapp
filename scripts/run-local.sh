#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env first."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Running Prisma migrate..."
npx prisma migrate dev --name init

echo "Seeding database..."
npx prisma db seed

echo "Starting Next.js dev server on http://localhost:3000"
npm run dev
