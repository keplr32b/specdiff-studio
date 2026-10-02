import { defineConfig } from "vite";

const base = "./";
const port = 5000;

export default defineConfig({
  base,
  server: {
    host: "0.0.0.0",
    port,
  },
  preview: {
    host: "0.0.0.0",
    port,
  },
});