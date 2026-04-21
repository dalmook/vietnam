import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/vietnam/",
  plugins: [react()],
  define: {
    "import.meta.env.VITE_BUILD_TIMESTAMP": JSON.stringify(new Date().toISOString()),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify("0.1.0")
  }
});
