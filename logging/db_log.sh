#!/bin/bash
DAY=$(date +%F)
OUT=/var/log/gpuscout/db-$DAY.log

mkdir -p /var/log/gpuscout
echo "===== GPUscout db_log - $DAY =====" > "$OUT"
grep "$DAY" /var/log/mongodb/mongod.log >> "$OUT"
