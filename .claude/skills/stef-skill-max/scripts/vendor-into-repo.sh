#!/usr/bin/env bash
# Vendor stef-skill-max into a repo so anyone who opens it — any Claude account, any
# agent that reads .claude/skills — gets the skill and knows what "run Stef skill max"
# means, without installing anything from this machine.
#
#   ./vendor-into-repo.sh /path/to/repo            pointer (default)
#   ./vendor-into-repo.sh --full /path/to/repo     self-contained copy
#
# Two modes, and the choice matters:
#
#   --link (default)  Writes a ~60-line stub plus a bootstrap script that fetches the
#                     canonical pipeline from the GitHub source in SOURCE. The repo carries a
#                     pointer, so every run picks up the current version. Durable and always
#                     current, needs network on first run per TTL.
#
#   --full            Writes a self-contained copy. No network ever, reproducible forever, and
#                     stale the moment the canonical version moves. Correct for air-gapped work,
#                     for a repo that must build from its own checkout, or for pinning by
#                     freezing rather than by ref.
#
# Writes:
#   <repo>/.claude/skills/stef-skill-max/     the stub, or the full skill
#   <repo>/CLAUDE.md                          an appended trigger block (created if absent)
# Touches nothing else. Re-running replaces the skill directory and leaves CLAUDE.md alone if
# the block is already there.
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE=link
while [ $# -gt 0 ]; do
  case "$1" in
    --full) MODE=full ;;
    --link) MODE=link ;;
    -*) echo "unknown flag: $1" >&2; exit 2 ;;
    *) TARGET="$1" ;;
  esac
  shift
done
TARGET="${TARGET:?usage: vendor-into-repo.sh [--link|--full] /path/to/repo}"
[ -d "$TARGET" ] || { echo "no such directory: $TARGET" >&2; exit 1; }

DEST="$TARGET/.claude/skills/stef-skill-max"
rm -rf "$DEST"; mkdir -p "$DEST"

if [ "$MODE" = full ]; then
  # No .cache, no .shots, no ledgers or target-specific docs from a previous run.
  rsync -a --delete \
    --exclude '.git' --exclude 'node_modules' --exclude '*.output' \
    --exclude '.cache' --exclude 'templates' \
    "$SRC"/ "$DEST"/
  echo "full copy -> $DEST"
else
  rsync -a "$SRC/templates/stub"/ "$DEST"/
  # shellcheck disable=SC1091
  ( . "$DEST/SOURCE"; echo "pointer   -> $DEST  (tracks $OWNER/$REPO@$REF)" )
  echo "            edit $DEST/SOURCE to change owner, repo or ref"
fi
chmod +x "$DEST"/scripts/*.sh

# The project-scope skill is the load-bearing trigger: .claude/skills is auto-discovered,
# and the skill's own description matches "run Stef skill max". The CLAUDE.md block below is
# belt-and-braces — it tells an agent what NOT to do instead. But plenty of repos gitignore
# CLAUDE.md, in which case the block never reaches anyone who clones. Say so rather than
# leaving a silent hole.
if git -C "$TARGET" rev-parse --git-dir >/dev/null 2>&1; then
  if git -C "$TARGET" check-ignore -q .claude/skills 2>/dev/null; then
    echo
    echo "WARNING: $TARGET/.gitignore ignores .claude/skills — the vendored skill will NOT be"
    echo "         committed, so nobody who clones this repo gets it. Un-ignore that path or"
    echo "         vendoring here buys you nothing beyond this machine."
  fi
  if git -C "$TARGET" check-ignore -q CLAUDE.md 2>/dev/null; then
    IGNORED_CM=1
  fi
fi

MARK="<!-- stef-skill-max -->"
CM="$TARGET/CLAUDE.md"
if [ -f "$CM" ] && grep -qF "$MARK" "$CM"; then
  echo "CLAUDE.md already carries the trigger block — left alone"
else
  [ -f "$CM" ] && printf '\n' >> "$CM"
  cat >> "$CM" <<'BLOCKEOF'
<!-- stef-skill-max -->
## "Run Stef skill max"

When the user asks to **run Stef skill max** — or says this artifact looks clunky, ugly,
or has overlapping content, or asks for a full design pass or to run all the design and
animation skills — invoke the `stef-skill-max` skill in `.claude/skills/stef-skill-max/`.

Do not improvise a design pass instead. The skill is a 14-stage sequential pipeline whose
whole value is the order and the measured gate between stages; running the same skills ad
hoc produces fleet thrash and unmeasured taste, which is the failure it exists to prevent.

First action of any run is `.claude/skills/stef-skill-max/scripts/preflight.sh`, which
reports which of the 29 fleet skills are present on this machine. Missing skills are a
planning input, not a blocker — stages without their skill are marked SKIPPED in PLAN.md
with that as the stated reason. Never silently substitute your own judgement for an absent
specialist and report the stage as done.
<!-- /stef-skill-max -->
BLOCKEOF
  echo "trigger -> $CM"
fi

if [ "${IGNORED_CM:-0}" = "1" ]; then
  echo
  echo "NOTE: CLAUDE.md is gitignored in this repo, so the trigger block stays local to this"
  echo "      machine. The skill itself still travels — .claude/skills/stef-skill-max is"
  echo "      tracked, and the skill's own description matches \"run Stef skill max\", which is"
  echo "      what actually fires it. To give collaborators the extra guardrail too, drop the"
  echo "      CLAUDE.md line from .gitignore."
fi

echo
if [ "$MODE" = full ]; then
  echo "next: cd $TARGET && .claude/skills/stef-skill-max/scripts/preflight.sh"
else
  echo "next: cd $TARGET && .claude/skills/stef-skill-max/scripts/bootstrap.sh"
  echo "      (then run preflight.sh from the path it prints)"
fi
