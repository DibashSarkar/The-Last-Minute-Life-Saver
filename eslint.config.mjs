import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // ── TypeScript ──────────────────────────────────────────────────────
      // Allow `any` in catch blocks and API boundaries — too noisy to avoid everywhere
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars: warn only, not error
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // ── React / Next ─────────────────────────────────────────────────────
      // Unescaped entities: warn instead of error (cosmetic, doesn't break anything)
      "react/no-unescaped-entities": "warn",

      // ── react-hooks plugin (very strict, too many false positives) ───────
      // setState in effect body is a pattern warning — not a real bug in our case
      "react-hooks/set-state-in-effect": "off",
      // Immutability (state mutation) — we handle this correctly via saveTask()
      "react-hooks/immutability": "off",
      // Purity (Math.random / Date.now in event handlers, not render) — false positives
      "react-hooks/purity": "off",

      // ── General ─────────────────────────────────────────────────────────
      "prefer-const": "error",
    },
  },
]);

export default eslintConfig;
