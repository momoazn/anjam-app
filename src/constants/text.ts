// Backward-compatibility shim.
//
// New code should import from `@/constants` (src/constants/index.ts).
// This file re-exports the modular constants to avoid breaking legacy imports.

export { fa, text } from "./index";
