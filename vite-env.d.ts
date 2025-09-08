// Fix: Replaced vite/client types with a declaration for process.env.API_KEY.
// This resolves a type definition error and aligns with the Gemini API guidelines
// for accessing the API key.
declare var process: {
    env: {
        readonly API_KEY: string;
    }
};
