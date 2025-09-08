// Fix: Removed reference to 'vite/client' which was causing a resolution error.
// Added declaration for process.env.API_KEY to support the API key access method
// required by @google/genai guidelines and fix TypeScript errors.
declare var process: {
  env: {
    API_KEY: string;
  }
};
