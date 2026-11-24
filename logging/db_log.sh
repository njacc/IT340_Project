#!/bin/bash
DAY=$(date +%F)
OUT=/var/log/gpuscout/db-$DAY.log

mkdir -p /var/log/gpuscout
echo "===== GPUscout DB log - $DAY =====" > "$OUT"
grep "$DAY" /var/log/mongodb/mongod.log >> "$OUT"
