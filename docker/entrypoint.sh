#!/bin/sh
set -eu

mkdir -p /data/dependencies /root/.android

if [ ! -f "$WS_SCRCPY_CONFIG" ]; then
    cp /app/docker-config.example.json "$WS_SCRCPY_CONFIG"
fi

adb start-server >/dev/null

old_ifs=$IFS
IFS=','
for endpoint in ${ADB_CONNECT:-}; do
    endpoint=$(printf '%s' "$endpoint" | tr -d '[:space:]')
    if [ -n "$endpoint" ]; then
        adb connect "$endpoint" || true
    fi
done
IFS=$old_ifs

exec "$@"
