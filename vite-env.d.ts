// Fix: The reference to vite/client was causing an error because the type definition file could not be found.
// This has been replaced with a manual declaration for `process.env` to align with the @google/genai guidelines,
// which mandate using `process.env.API_KEY`. This declaration prevents TypeScript errors.
declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};
