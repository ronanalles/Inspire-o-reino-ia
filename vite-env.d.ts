// The reference to vite/client was causing a "Cannot find type definition file" error.
// Manually defining the types for import.meta.env to resolve the issue and unblock dependent files.

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
