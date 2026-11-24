#!/bin/bash
DAY=$(date +%F)
OUT=/var/log/gpuscout/fe-$DAY.log

mkdir -p /var/log/gpuscout
echo "===== GPUscout fe_log - $DAY =====" > "$OUT"

echo "----- Apache access -----" >> "$OUT"
grep "$(date +%d/%b/%Y)" /var/log/apache2/access.log >> "$OUT"

echo "----- Apache errors -----" >> "$OUT"
grep "$(date +'%a %b %d')" /var/log/apache2/error.log >> "$OUT"

echo "----- Firewall (UFW) -----" >> "$OUT"
grep -e "$DAY" -e "$(date +'%b %e')" /var/log/ufw.log >> "$OUT" 2>/dev/null

chmod 640 "$OUT"
