import { join } from "node:path";

export default {
  base: "./",
  root: join(import.meta.dirname, "src"),
  build: {
    outDir: join(import.meta.dirname, "build"),
  },
  publicDir: join(import.meta.dirname, "public"),
};

