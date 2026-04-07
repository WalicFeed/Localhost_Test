const { execSync } = require("child_process");

const run = (cmd) => {
  console.log(`> ${cmd}`);
  const out = execSync(cmd, { cwd: "/vercel/share/v0-project", encoding: "utf8" });
  if (out) console.log(out);
  return out;
};

run('git config user.email "v0[bot]@users.noreply.github.com"');
run('git config user.name "v0[bot]"');

run("git add -A");

const diff = execSync("git diff --cached --name-only", {
  cwd: "/vercel/share/v0-project",
  encoding: "utf8",
});

if (!diff.trim()) {
  console.log("Nothing to commit, working tree clean.");
  process.exit(0);
}

console.log("Files to commit:\n" + diff);

const lines = [
  "feat: remove password from registration, add theme/language switcher",
  "",
  "- Remove password field from User model (Prisma schema + migration)",
  "- Remove bcryptjs from server register handler and package.json",
  "- Update register page UI: only name + email required",
  "- Add ThemeProvider (light/dark toggle, persisted to localStorage)",
  "- Add LanguageProvider (EN/RU switcher, persisted to localStorage)",
  "- Add BottomControls widget fixed to bottom-left corner",
  "- Add dev fallback for JWT_SECRET when NODE_ENV != production",
  "- Pin @prisma/client to exact 5.22.0 to suppress upgrade banner",
  "",
  "Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>",
];

run(`git commit -m "${lines[0]}" --message="${lines.slice(1).join("\n").replace(/"/g, '\\"')}"`);
run("git push origin user-registration-changes");

console.log("Done! Changes pushed to user-registration-changes.");
