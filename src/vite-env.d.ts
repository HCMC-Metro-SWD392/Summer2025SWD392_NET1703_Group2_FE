/// <reference types="vite/client" />


interface ImportMetaEnv {
    readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string;
    readonly VITE_OPENWEATHER_KEY: string;
    readonly VITE_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}