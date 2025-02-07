import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Cortex - AI-Driven Research Assistant",
  description:
    "Organize your research with AI-powered note-taking and knowledge management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-dark-bg">
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
