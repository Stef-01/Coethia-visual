#!/usr/bin/env bash
# stef-skill-max preflight — report which fleet skills are present, and optionally install
# the missing ones. Idempotent: safe to run on every invocation of the skill.
#
#   ./preflight.sh            report only
#   ./preflight.sh --install  install what is missing (serially — the CLI races on itself)
#   ./preflight.sh --json     machine-readable report
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$HERE/../fleet.tsv"
OPTIONAL="$HERE/../fleet-optional.tsv"
NPMDEPS="$HERE/../fleet-npm.tsv"

# A skill is "present" if any agent directory has it. Project scope wins, so check it first.
SEARCH=("./.claude/skills" "$HOME/.claude/skills" "./.agent/skills" "$HOME/.codex/skills")

present() {
  local s="$1" d
  for d in "${SEARCH[@]}"; do [ -f "$d/$s/SKILL.md" ] && return 0; done
  return 1
}

MISSING=(); MISSING_SRC=(); FOUND=0; TOTAL=0
while IFS=$'\t' read -r stage skill source role; do
  case "$stage" in ''|\#*) continue ;; esac
  [ -z "${skill:-}" ] && continue
  TOTAL=$((TOTAL+1))
  if present "$skill"; then FOUND=$((FOUND+1)); else MISSING+=("$skill"); MISSING_SRC+=("$source"); fi
done < "$MANIFEST"

if [ "${1:-}" = "--json" ]; then
  printf '{"total":%d,"present":%d,"missing":[' "$TOTAL" "$FOUND"
  for i in "${!MISSING[@]}"; do
    [ "$i" -gt 0 ] && printf ','
    printf '{"skill":"%s","source":"%s"}' "${MISSING[$i]}" "${MISSING_SRC[$i]}"
  done
  printf ']}\n'; exit 0
fi

echo "stef-skill-max fleet: $FOUND/$TOTAL required skills present"

if [ "${#MISSING[@]}" -eq 0 ]; then
  echo "  all required skills present"
else
  echo "  missing ${#MISSING[@]}:"
  for i in "${!MISSING[@]}"; do printf '    %-38s %s\n' "${MISSING[$i]}" "${MISSING_SRC[$i]}"; done
fi

# Optional skills: report, never install, never block.
echo
echo "optional (absence is fine — stages fall back):"
while IFS=$'\t' read -r stage skill source fallback; do
  case "$stage" in ''|\#*) continue ;; esac
  [ -z "${skill:-}" ] && continue
  if present "$skill"; then printf '    present  %-24s\n' "$skill"
  else printf '    absent   %-24s fallback: %s\n' "$skill" "$fallback"; fi
done < "$OPTIONAL"

# Repo-level npm deps: report only. Installing into someone else's repo is their call.
echo
echo "repo dependencies (install into the target repo when its stage runs):"
while IFS=$'\t' read -r stage pkg role caveat; do
  case "$stage" in ''|\#*) continue ;; esac
  [ -z "${pkg:-}" ] && continue
  if [ -f package.json ] && grep -q "\"$pkg\"" package.json 2>/dev/null; then st="present"; else st="absent "; fi
  printf '    %s  stage %-4s %-16s %s\n' "$st" "$stage" "$pkg" "$role"
done < "$NPMDEPS"

if [ "${1:-}" != "--install" ] || [ "${#MISSING[@]}" -eq 0 ]; then
  [ "${#MISSING[@]}" -gt 0 ] && { echo; echo "run with --install to add the missing skills"; }
  exit 0
fi

# Serial by necessity: concurrent `skills add` runs race on the same directories,
# and each invocation re-clones its source repo, so this is slow. Expect minutes.
echo
echo "installing ${#MISSING[@]} skills serially (each re-clones its source; this takes a while)"
FAILED=()
for i in "${!MISSING[@]}"; do
  s="${MISSING[$i]}"; src="${MISSING_SRC[$i]}"
  case "$src" in *"("*) echo "  skip   $s — not installable via the skills CLI ($src)"; continue ;; esac
  printf '  ...    %s\n' "$s"
  if timeout 300 npx -y skills add "$src" -g -a claude-code -y --skill "$s" >/dev/null 2>&1 && present "$s"; then
    echo "  ok     $s"
  else
    echo "  FAILED $s  ($src)"; FAILED+=("$s")
  fi
done

echo
if [ "${#FAILED[@]}" -eq 0 ]; then
  echo "fleet complete"
else
  echo "${#FAILED[@]} failed: ${FAILED[*]}"
  echo "Stages depending on these must be marked SKIPPED in PLAN.md with this as the reason."
  echo "Do not silently proceed as though the fleet were complete."
  exit 1
fi
