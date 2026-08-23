#!/bin/sh
set -eu

mkdir -p /data/dependencies /root/.android

if [ ! -f "$WS_SCRCPY_CONFIG" ]; then
    cp /app/docker-config.example.json "$WS_SCRCPY_CONFIG"
fi

adb start-server >/dev/null

connect_adb_endpoints() {
    old_ifs=$IFS
    IFS=','
    for endpoint in ${ADB_CONNECT:-}; do
        endpoint=$(printf '%s' "$endpoint" | tr -d '[:space:]')
        if [ -n "$endpoint" ]; then
            adb connect "$endpoint" || true
        fi
    done
    IFS=$old_ifs
}

connect_adb_endpoints

if [ -n "${ADB_CONNECT:-}" ]; then
    (
        while sleep "${ADB_CONNECT_RETRY_SECONDS:-15}"; do
            connect_adb_endpoints >/dev/null 2>&1
        done
    ) &
fi

exec "$@"
