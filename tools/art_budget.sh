#!/bin/bash
# 경지 0~6 마다 무공 보정값을 다시 잰다 (약 25분). 끝나면 data/artbal.json 과 dist 가 새로 쓰인다.
set -e;cd "$(dirname "$0")/..";export PWPATH=${PWPATH:-$(npm root -g)/playwright} REP=${REP:-6} PM=${PM:-80};T=${TMPDIR:-/tmp}/artk;mkdir -p $T
python3 build.py >/dev/null
for r in ${RS:-0 1 2 3 4 5 6};do
  R=$r node tests/sim_arts.js $T/raw$r.json --raw >/dev/null;python3 tools/art_budget.py $T/raw$r.json $r;python3 build.py >/dev/null
  for i in 1 2;do R=$r node tests/sim_arts.js $T/fix$r.json >/dev/null;python3 tools/art_budget.py $T/fix$r.json $r --iter;python3 build.py >/dev/null;done
  R=$r node tests/sim_arts.js $T/done$r.json >/dev/null
done
