#!/bin/bash


DAY=$(date +%F) #todays date


OUT=/var/log/gpuscout/be-$DAY.log #log file


mkdir -p /var/log/gpuscout #folder creation in case 
echo "===== GPUscout be_log - $DAY =====" > "$OUT"

echo "----- API output -----" >> "$OUT"
journalctl -u graphic-scouts-api --since today --no-pager >> "$OUT" 2>&1 #reads from service

echo "----- Firewall (UFW) -----" >> "$OUT" #searches UFW for entries and adds to output 
grep -e "$DAY" -e "$(date +'%b %e')" /var/log/ufw.log >> "$OUT" 2>/dev/null 

chmod 640 "$OUT"
