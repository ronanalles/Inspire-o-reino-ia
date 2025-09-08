// FIX: Removed reference to "vite/client" which was causing a 'Cannot find type definition file' error.
// Added a declaration for process.env.API_KEY to support the change in geminiService.ts.
declare var process: {
  env: {
    API_KEY: string;
  }
};
