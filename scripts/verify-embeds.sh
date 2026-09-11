#!/bin/bash
# Verify all catalog URLs for iframe embeddability with proper Sec-Fetch headers
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

check() {
  local slug="$1"; local url="$2"
  # Get final headers after redirects, with iframe fetch headers
  local headers
  headers=$(curl -s -D - -o /dev/null -L --max-time 12 -A "$UA" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -H "Sec-Fetch-Dest: iframe" -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Site: cross-site" \
    -H "Upgrade-Insecure-Requests: 1" "$url" 2>/dev/null)
  local code=$(echo "$headers" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  local final_url=$(echo "$headers" | grep -i "^location" | tail -1 | tr -d '\r' | awk '{print $2}')
  local blocked=""
  if echo "$headers" | grep -qi "x-frame-options: *\(DENY\|SAMEORIGIN\|deny\|sameorigin\)"; then blocked="XFO"; fi
  if echo "$headers" | grep -qi "frame-ancestors.*\(none\|self\)" | grep -v "frame-ancestors \*"; then
    if echo "$headers" | grep -qi "frame-ancestors[^;]*\(^\|[^*]\)'\?none\|frame-ancestors[^;]*'\?self"; then blocked="$blocked CSP-FA"; fi
  fi
  if [ "$code" != "200" ] && [ "$code" != "301" ] && [ "$code" != "302" ] && [ "$code" != "" ]; then blocked="$blocked HTTP-$code"; fi
  if [ -z "$blocked" ]; then
    echo "OK        $slug"
  else
    echo "BLOCKED   $slug  [$blocked] ${final_url:+redirect->$final_url}"
  fi
}

# Tier 1 direct sites
check "krunker" "https://krunker.io"
check "shell-shockers" "https://shellshock.io"
check "zombs-royale" "https://zombsroyale.io"
check "buildroyale" "https://buildroyale.io"
check "voxiom" "https://voxiom.io"
check "deadshot" "https://deadshot.io"
check "kirka" "https://kirka.io"
check "repuls" "https://repuls.io"
check "rocket-bot-royale" "https://rocketbotroyale.io"
check "smash-karts" "https://smashkarts.io"
check "starblast" "https://starblast.io"
check "diep" "https://diep.io"
check "sploop" "https://sploop.io"
check "territorial" "https://territorial.io"
check "paper-io-2" "https://paper-io.com"
check "hole-io" "https://hole-io.com"
check "little-big-snake" "https://littlebigsnake.io"
check "wings" "https://wings.io"
check "defly" "https://defly.io"
check "superhex" "https://superhex.io"
check "taming" "https://taming.io"
check "bloxd" "https://bloxd.io"
check "eaglercraft-play" "https://eaglercraft.com/play"
check "eaglercraft-play-v1188" "https://eaglercraft.com/play?version=1.8.8"
check "polytrack" "https://poly-track.io"
check "moto-x3m" "https://moto-x3m.io"
check "slope" "https://slopegame.io"
check "eggy-car" "https://eggy-car.io"
check "retrobowl" "https://retrobowl.me"
check "cookie-clicker" "https://orteil.dashnet.org/cookieclicker/"
check "2048-github" "https://gabrielecirulli.github.io/2048/"
check "flappy-bird" "https://nebez.github.io/floppybird/"
check "wordle" "https://hellowordl.net"
check "tetris-react" "https://chvin.github.io/react-tetris/"
check "tower-game" "https://iamkun.github.io/tower_game/"
check "lichess" "https://lichess.org"
check "pacman-doodle" "https://www.google.com/logos/2010/pacman10-i.html"

# CrazyGames embeds
for slug in rooftop-snipers getaway-shootout ovo basketball-stars smash-karts paper-io-2 tiny-fishing big-tower-tiny-square basket-random soccer-random papas-pizzeria run-3 age-of-war learn-to-fly burrito-bison bloxorz buildnow-gg; do
  check "cg:$slug" "https://www.crazygames.com/embed/$slug"
done

# CrazyGames direct files
for slug in drift-hunters doodle-jump tank-trouble vex-5 idle-breakout bob-the-robber; do
  check "cgf:$slug" "https://games.crazygames.com/en_US/$slug/index.html"
done
