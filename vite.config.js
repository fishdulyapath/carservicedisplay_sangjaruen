import { fileURLToPath, URL } from "url";

import { defineConfig, splitVendorChunkPlugin } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";

import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [
    vue(),
    EnvironmentPlugin({
      // Uses 'development' if the NODE_ENV environment variable is not defined.
      NODE_ENV: "development",

      // Have in mind that variables coming from process.env are always strings.
      DEBUG: "false",

      // Required: will fail if the API_KEY environment variable is not provided.
      VUE_APP_API: undefined,

      VUE_APP_TITLE: undefined,

      // Optional: will not fail if the APP_VERSION environment variable is missing.
      APP_VERSION: null,
    }),
    splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  base: '/app/',
  title: 'Hello 7777'
});
