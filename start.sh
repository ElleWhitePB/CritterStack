#!/bin/bash
# CritterStack — start all services with one command.
# Usage: ./start.sh
# Press Ctrl+C to stop everything.

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Colour helpers ────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
CYAN="\033[36m"
RED="\033[31m"

# ── Prefix each service's output with a coloured tag ─────────
run_service() {
  local label="$1"
  local colour="$2"
  local dir="$3"
  local cmd="$4"
  (cd "$dir" && eval "$cmd") 2>&1 \
    | while IFS= read -r line; do
        printf "${colour}[%-8s]${RESET} %s\n" "$label" "$line"
      done &
}

# ── Shut everything down cleanly on Ctrl+C ───────────────────
cleanup() {
  echo ""
  echo -e "${BOLD}Shutting down CritterStack...${RESET}"
  kill $(jobs -p) 2>/dev/null
  wait 2>/dev/null
  echo -e "${GREEN}All services stopped.${RESET}"
  exit 0
}
trap cleanup INT TERM

# ── Preflight checks ──────────────────────────────────────────
missing=0

if [ ! -d "$ROOT/creature-service/node_modules" ]; then
  echo -e "${RED}✗ creature-service: node_modules missing — run 'npm install' in creature-service/${RESET}"
  missing=1
fi

if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo -e "${RED}✗ frontend: node_modules missing — run 'npm install' in frontend/${RESET}"
  missing=1
fi

if [ ! -f "$ROOT/biome-service/venv/bin/python" ]; then
  echo -e "${RED}✗ biome-service: venv missing — run 'python -m venv venv && pip install -r requirements.txt' in biome-service/${RESET}"
  missing=1
fi

if [ "$missing" -eq 1 ]; then
  echo ""
  echo -e "${RED}Fix the above issues then re-run ./start.sh${RESET}"
  exit 1
fi

# ── Start services ────────────────────────────────────────────
echo ""
echo -e "${BOLD}🐾 Starting CritterStack${RESET}"
echo ""

run_service "creature" "$YELLOW" "$ROOT/creature-service" "npm run dev"
run_service "biome   " "$GREEN"  "$ROOT/biome-service"   "venv/bin/python manage.py runserver 8000"
run_service "frontend" "$CYAN"   "$ROOT/frontend"         "npm run dev"

echo -e "  ${YELLOW}🐾 Creature Service${RESET}  →  http://localhost:3000"
echo -e "  ${GREEN}🌿 Biome Service${RESET}     →  http://localhost:8000"
echo -e "  ${CYAN}🖥  Frontend${RESET}          →  http://localhost:5173"
echo ""
echo -e "Press ${BOLD}Ctrl+C${RESET} to stop all services."
echo ""

wait
