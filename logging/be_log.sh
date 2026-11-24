#!/bin/bash
DAY=$(date +%F)
OUT=/var/log/gpuscout/be-$DAY.log

mkdir -p /var/log/gpuscout
echo "===== GPUscout BE log - $DAY =====" > "$OUT"

echo "----- API output -----" >> "$OUT"
journalctl -u gpuscout-api --since today --no-pager >> "$OUT" 2>&1

echo "----- Firewall (UFW) -----" >> "$OUT"
grep -e "$DAY" -e "$(date +'%b %e')" /var/log/ufw.log >> "$OUT" 2>/dev/null

chmod 640 "$OUT"
