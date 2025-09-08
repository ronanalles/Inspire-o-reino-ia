// FIX: Removed reference to "vite/client" to resolve "Cannot find type definition file" error.
// FIX: Removed unused VITE_API_KEY definition as the application now uses process.env.API_KEY.
interface ImportMetaEnv {
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
