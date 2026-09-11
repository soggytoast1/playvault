#!/bin/bash
# Scrape og:image / twitter:image from game sites
declare -A GAMES=(
  ["krunker"]="https://krunker.io"
  ["shell-shockers"]="https://shellshock.io"
  ["zombs-royale"]="https://zombsroyale.io"
  ["buildroyale"]="https://buildroyale.io"
  ["voxiom"]="https://voxiom.io"
  ["deadshot"]="https://deadshot.io"
  ["kirka"]="https://kirka.io"
  ["repuls"]="https://repuls.io"
  ["rocket-bot-royale"]="https://rocketbotroyale.io"
  ["smash-karts"]="https://smashkarts.io"
  ["starblast"]="https://starblast.io"
  ["diep"]="https://diep.io"
  ["sploop"]="https://sploop.io"
  ["territorial"]="https://territorial.io"
  ["paper-io-2"]="https://paper-io.com"
  ["hole-io"]="https://hole-io.com"
  ["little-big-snake"]="https://littlebigsnake.io"
  ["wings"]="https://wings.io"
  ["defly"]="https://defly.io"
  ["superhex"]="https://superhex.io"
  ["taming"]="https://taming.io"
  ["eaglercraft"]="https://eaglercraft.com"
  ["bloxd"]="https://bloxd.io"
  ["polytrack"]="https://poly-track.io"
  ["moto-x3m"]="https://moto-x3m.io"
  ["slope"]="https://slopegame.io"
  ["eggy-car"]="https://eggy-car.io"
  ["retrobowl"]="https://retrobowl.me"
  ["cookie-clicker"]="https://orteil.dashnet.org/cookieclicker/"
  ["2048"]="https://gabrielecirulli.github.io/2048/"
  ["flappy-bird"]="https://nebez.github.io/floppybird/"
  ["wordle"]="https://hellowordl.net"
  ["tetris"]="https://chvin.github.io/react-tetris/"
  ["tower-game"]="https://iamkun.github.io/tower_game/"
  ["lichess"]="https://lichess.org"
)
for slug in "${!GAMES[@]}"; do
  url="${GAMES[$slug]}"
  img=$(curl -s -L --max-time 8 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126" "$url" 2>/dev/null | grep -o -E '<meta[^>]*(og:image|twitter:image)[^>]*>' | grep -o -E '(content|value)="[^"]*"' | head -1 | sed 's/^content="//; s/^value="//; s/"$//')
  if [ -z "$img" ]; then echo "$slug: null"; else echo "$slug: $img"; fi
done
