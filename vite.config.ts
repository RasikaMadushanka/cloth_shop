import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Add this
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(), // Add this here
    tsconfigPaths(),
  ],
});