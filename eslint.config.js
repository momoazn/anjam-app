import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const DESIGN_TOKEN_IGNORE = "design-token-ignore";

const disallowedTokenClasses = [
  "rounded-2xl",
  "rounded-3xl",
  "size-14",
  "size-16",
  "p-6",
  "h-12",
  "h-14",
];

const designSystemPlugin = {
  rules: {
    "no-hardcoded-tokens": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          hardcoded:
            "Hardcoded design token '{{token}}' is not allowed here. Use a recipe component or a `var(--ds-...)` token (or add `// design-token-ignore: reason`).",
        },
      },
      create(context) {
        const filename = context.getFilename();
        if (
          filename.includes("/src/design/") ||
          filename.includes("/src/components/recipes/")
        ) {
          return {};
        }

        const sourceCode = context.getSourceCode();
        const hasIgnore = sourceCode
          .getAllComments()
          .some((c) => c.value.includes(DESIGN_TOKEN_IGNORE));
        if (hasIgnore) {
          return {};
        }

        const checkText = (text, node) => {
          for (const token of disallowedTokenClasses) {
            const re = new RegExp(`(^|\\s)${token}(\\s|$)`);
            if (re.test(text)) {
              context.report({
                node,
                messageId: "hardcoded",
                data: { token },
              });
            }
          }
        };

        const readLiteralString = (node) => {
          if (!node) return null;
          if (node.type === "Literal" && typeof node.value === "string")
            return node.value;
          if (node.type === "TemplateLiteral") {
            if (node.expressions.length) return null;
            return node.quasis.map((q) => q.value.cooked ?? "").join("");
          }
          return null;
        };

        const checkClassLikeExpression = (expr) => {
          const text = readLiteralString(expr);
          if (typeof text === "string") {
            checkText(text, expr);
            return;
          }

          if (expr?.type === "CallExpression") {
            for (const arg of expr.arguments) {
              if (arg?.type === "SpreadElement") continue;
              const argText = readLiteralString(arg);
              if (typeof argText === "string") {
                checkText(argText, arg);
              }
            }
          }
        };

        return {
          JSXAttribute(node) {
            if (node.name?.type !== "JSXIdentifier") return;
            if (node.name.name !== "className") return;

            if (node.value?.type === "Literal") {
              checkText(String(node.value.value ?? ""), node.value);
              return;
            }

            if (node.value?.type === "JSXExpressionContainer") {
              checkClassLikeExpression(node.value.expression);
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  { ignores: ["dist", "src/lib/pocketbase-types.ts", ".worktrees"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "design-system": designSystemPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "design-system/no-hardcoded-tokens": "error",
    },
  },
);
