/// <reference types="node" />


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/lyncup",
  // tells Vite what base URL the app will be served from after it’s built. This affects all the paths Vite generates in the final HTML and JS, especially for:
  // <script src=...>
  // image paths
  // asset URLs
  //Vite needs to know the final URL path so it can generate correct links in the built files.
  //like saying “When building the final production files, put /lyncup in front of every link or asset path unless VITE_BASE_PATH is defined in the environment.”
})
