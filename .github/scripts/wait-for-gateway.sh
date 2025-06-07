#!/usr/bin/env bash

set -euo pipefail

GATEWAY_DOMAIN="$1"

for i in {1..30}; do
  if curl -sf "$GATEWAY_DOMAIN/health" > /dev/null; then
    echo "Gateway is healthy!"
    exit 0
  fi
  echo "Waiting for gateway... ($i/30)"
  sleep 5
done

echo "Gateway did not start in time"
exit 1
