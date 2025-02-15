import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Cortex - AI-Driven Research Assistant",
  description:
    "Organize your research with AI-powered note-taking and knowledge management",
  icons: {
    icon: { url: "/favicon.ico", type: "image/x-icon" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full bg-dark-bg"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
    >
      <body
        className="h-full"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
