#!/bin/bash
set -e

cd /vercel/share/v0-project

git config user.email "v0[bot]@users.noreply.github.com"
git config user.name "v0[bot]"

git add -A

git diff --cached --quiet && echo "Nothing to commit, working tree clean" && exit 0

git commit -m "feat: remove password from registration, add theme/language switcher

- Remove password field from User model (Prisma schema + migration)
- Remove bcryptjs from server register handler and package.json
- Update register page UI: only name + email required
- Add ThemeProvider (light/dark toggle, persisted to localStorage)
- Add LanguageProvider (EN/RU switcher, persisted to localStorage)
- Add BottomControls widget fixed to bottom-left corner
- Add dev fallback for JWT_SECRET when NODE_ENV != production
- Pin @prisma/client to exact 5.22.0 to suppress upgrade banner

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"

git push origin user-registration-changes

echo "Done! Changes pushed to user-registration-changes."
