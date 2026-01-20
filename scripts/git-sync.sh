#!/usr/bin/env bash

set -euo pipefail

branch="${1:-$(git branch --show-current)}"

if [ -z "$branch" ]; then
  echo "No branch detected. Pass a branch name as the first argument." >&2
  exit 1
fi

git push origin "$branch"
git fetch origin "$branch"
