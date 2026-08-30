#!/usr/bin/env bash
# Fetch the canonical stef-skill-max from GitHub into .cache/skill, so this repo carries a
# pointer rather than a frozen copy and every run picks up the current pipeline.
#
#   ./bootstrap.sh              fetch if the cache is stale, then print the skill path
#   ./bootstrap.sh --force      always re-fetch
#   ./bootstrap.sh --offline    use the cache, never touch the network
#   ./bootstrap.sh --ref v1.2   fetch a specific tag, branch or commit, ignoring SOURCE
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="$HERE/.cache/skill"
STAMP="$HERE/.cache/fetched-at"
RESOLVED="$HERE/.cache/resolved-ref"

# shellcheck disable=SC1091
. "$HERE/SOURCE"
FORCE=0; OFFLINE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --force) FORCE=1 ;;
    --offline) OFFLINE=1 ;;
    --ref) shift; REF="${1:?--ref needs a value}" ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

fresh() {
  [ "$FORCE" = 1 ] && return 1
  [ -f "$CACHE/SKILL.md" ] || return 1
  [ "${TTL_HOURS:-24}" = "0" ] && return 1
  [ -f "$STAMP" ] || return 1
  local age_min
  age_min=$(( ( $(date +%s) - $(cat "$STAMP" 2>/dev/null || echo 0) ) / 60 ))
  [ "$age_min" -lt $(( ${TTL_HOURS} * 60 )) ]
}

use_cache() {
  echo "$CACHE"
  echo "stef-skill-max: using cached copy, ref $(cat "$RESOLVED" 2>/dev/null || echo unknown)" >&2
}

if fresh; then use_cache; exit 0; fi

if [ "$OFFLINE" = 1 ]; then
  if [ -f "$CACHE/SKILL.md" ]; then
    echo "WARNING: --offline and the cache may be stale." >&2
    use_cache; exit 0
  fi
  echo "stef-skill-max: --offline but nothing cached. Cannot proceed." >&2; exit 1
fi

URL="https://codeload.github.com/$OWNER/$REPO/tar.gz/$REF"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
# macOS ships bash 3.2, where "${ARR[@]}" on an empty array trips `set -u`. The
# ${ARR[@]+...} guard is the portable idiom; do not "simplify" it.
AUTH=()
[ -n "${GH_TOKEN:-}" ] && AUTH=(-H "Authorization: Bearer $GH_TOKEN")

if curl -fsSL --retry 2 --max-time 120 ${AUTH[@]+"${AUTH[@]}"} "$URL" -o "$TMP/src.tgz" 2>/dev/null \
   && tar -xzf "$TMP/src.tgz" -C "$TMP" 2>/dev/null; then
  ROOT="$(find "$TMP" -maxdepth 1 -type d -name "$REPO-*" | head -1)"
  SRC="$ROOT/$SUBDIR"
  if [ -f "$SRC/SKILL.md" ]; then
    # Only replace a working cache once the new copy is known good.
    mkdir -p "$HERE/.cache"
    rm -rf "$CACHE.new" && cp -R "$SRC" "$CACHE.new"
    rm -rf "$CACHE" && mv "$CACHE.new" "$CACHE"
    chmod +x "$CACHE"/scripts/*.sh 2>/dev/null || true
    date +%s > "$STAMP"; echo "$REF" > "$RESOLVED"
    echo "$CACHE"
    echo "stef-skill-max: fetched $OWNER/$REPO@$REF" >&2
    exit 0
  fi
  echo "stef-skill-max: fetched $URL but found no SKILL.md at $SUBDIR — is SOURCE correct?" >&2
else
  echo "stef-skill-max: could not fetch $URL" >&2
fi

# Fetch failed. A stale cache beats nothing, but say which it is.
if [ -f "$CACHE/SKILL.md" ]; then
  echo "WARNING: falling back to the cached copy, which may be out of date." >&2
  use_cache; exit 0
fi

cat >&2 <<FAILEOF
stef-skill-max: no local copy and the fetch failed. Options, in order of preference:
  1. Check network access to codeload.github.com, then re-run.
  2. If $OWNER/$REPO is private, export GH_TOKEN and re-run.
  3. If $OWNER/$REPO does not exist yet, SOURCE is pointing at nothing — fix it.
  4. Install the skill directly:  npx skills add $OWNER/$REPO
  5. Ask whoever vendored this to re-run vendor-into-repo.sh with --full, which
     commits a self-contained copy instead of a pointer.
Do not improvise the pipeline from the stub. Report this and stop.
FAILEOF
exit 1
