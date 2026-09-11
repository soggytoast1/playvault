#!/bin/bash
# Verify ubg365 games: open each page, check for game canvas or game iframe
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126"
for g in "$@"; do
  agent-browser open "https://ubg365.github.io/$g/" >/dev/null 2>&1
  sleep 6
  result=$(agent-browser eval "JSON.stringify({c: document.querySelectorAll('canvas').length, f: Array.from(document.querySelectorAll('iframe')).map(x=>x.src||'').filter(s=>s && !s.includes('adforgames')).map(s=>s.slice(0,60)).join(','), t: document.title.slice(0,45), nf: document.body.innerText.includes('404') || document.body.innerText.includes('not found')})" 2>/dev/null | head -c 200)
  echo "[$g] $result"
done
