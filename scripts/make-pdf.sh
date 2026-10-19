#!/bin/sh
# Generuje gotowe CV w PDF z wersji do druku strony (index.html, styl @media print).
# Użycie: sh scripts/make-pdf.sh   → assets/Lukasz-Ratajczyk-CV.pdf
# Uruchom po każdej zmianie treści CV, żeby plik do pobrania był aktualny.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/Lukasz-Ratajczyk-CV.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "Nie znaleziono Google Chrome w /Applications." >&2
  exit 1
fi

# świeży profil przy każdym uruchomieniu — bez starych stylów z pamięci podręcznej
PROFILE="$(mktemp -d)"
trap 'rm -rf "${PROFILE:?}"' EXIT

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --user-data-dir="$PROFILE" --virtual-time-budget=8000 \
  --print-to-pdf="$OUT" "file://$ROOT/index.html" 2>/dev/null

echo "Gotowe: $OUT"
