import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inscrições TOP",
    short_name: "iTOP",
    description: "Sistema de Inscrições e ADM de Participantes e Legendários",
    start_url: "/",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#1A1A1A",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/app-desktop.png",
        sizes: "1280x720",
        type: "image/png",
      },
      {
        src: "/screenshots/app.png",
        sizes: "1080x1920",
        type: "image/png",
      },
    ],
  };
}
