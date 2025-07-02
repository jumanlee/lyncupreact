interface ImportMetaEnv {
  readonly VITE_DJANGO_URL: string;
  // add more vars as needed
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
