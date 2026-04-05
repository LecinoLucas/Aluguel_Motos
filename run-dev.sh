#!/bin/zsh

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
FULL_RESET=false

if [[ "${1:-}" == "--full" ]]; then
	FULL_RESET=true
fi

find_available_port() {
	local port="$1"

	while lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
		port=$((port + 1))
	done

	echo "$port"
}

wait_for_port() {
	local port="$1"
	local label="$2"
	local attempts="${3:-60}"
	local delay="${4:-0.5}"
	local attempt=1

	while (( attempt <= attempts )); do
		if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
			return 0
		fi

		sleep "$delay"
		attempt=$((attempt + 1))
	done

	echo "Nao foi possivel confirmar $label na porta $port dentro do tempo esperado." >&2
	return 1
}

kill_listening_port() {
	local port="$1"
	local pids

	pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
	if [[ -n "$pids" ]]; then
		echo "Encerrando processos na porta $port"
		for pid in ${(f)pids}; do
			kill -9 "$pid" 2>/dev/null || true
		done
	fi
}

reset_dev_ports() {
	local port

	for port in {3000..3010}; do
		kill_listening_port "$port"
	done

	for port in {5173..5185}; do
		kill_listening_port "$port"
	done

	kill_listening_port 24678
	sleep 1
}

if [[ "$FULL_RESET" == true ]]; then
	echo "Limpando portas do ambiente de desenvolvimento"
	reset_dev_ports
fi

PREFERRED_BACKEND_PORT="${PORT:-3000}"
BACKEND_PORT=$(find_available_port "$PREFERRED_BACKEND_PORT")
BACKEND_ORIGIN="http://localhost:$BACKEND_PORT"

cleanup() {
	local exit_code=$?

	if [[ -n "${BACKEND_PID:-}" ]]; then
		kill "$BACKEND_PID" 2>/dev/null || true
	fi

	if [[ -n "${FRONTEND_PID:-}" ]]; then
		kill "$FRONTEND_PID" 2>/dev/null || true
	fi

	wait 2>/dev/null || true
	exit "$exit_code"
}

trap cleanup INT TERM EXIT

echo "Iniciando backend em $BACKEND_DIR na porta $BACKEND_PORT"
(
	cd "$BACKEND_DIR"
	PORT="$BACKEND_PORT" npm run dev
) &
BACKEND_PID=$!

echo "Aguardando backend ficar disponivel em $BACKEND_ORIGIN"
wait_for_port "$BACKEND_PORT" "backend"

echo "Iniciando frontend em $FRONTEND_DIR usando API em $BACKEND_ORIGIN"
(
	cd "$FRONTEND_DIR"
	VITE_BACKEND_ORIGIN="$BACKEND_ORIGIN" npm run dev
) &
FRONTEND_PID=$!

while true; do
	if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
		wait "$BACKEND_PID"
		break
	fi

	if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
		wait "$FRONTEND_PID"
		break
	fi

	sleep 1
done
