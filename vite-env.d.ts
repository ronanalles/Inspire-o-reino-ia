/// <reference types="vite/client" />

// Fix: Add explicit type definitions for Vite's `import.meta.env` to solve TypeScript errors.
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
