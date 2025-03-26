import { join } from "node:path";

export default {
  base: "./",
  root: import.meta.dirname,
  build: {
    outDir: join(import.meta.dirname, "build"),
  },
  publicDir: join(import.meta.dirname, "public"),
};

