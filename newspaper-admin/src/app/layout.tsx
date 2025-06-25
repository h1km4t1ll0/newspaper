// src/app/layout.tsx
import RefineApp from "./RefineApp";
import { cookies } from "next/headers";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Newspaper",
  description: "Newspaper layout editor and management system",
  icons: { icon: "/Снимок_экрана_2025_06_24_в_19,02,27_Picsart_BackgroundRemover.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = cookies().get("theme")?.value;
  const defaultMode = theme === "dark" ? "dark" : "light";

  return (
    <html lang="en">
    <body>
    {/* pass the default theme-mode into the client component */}
    <RefineApp defaultMode={defaultMode}>{children}</RefineApp>
    </body>
    </html>
  );
}
