import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

export const metadata = {
  title: "MamaCare Admin",
  description: "MamaCare administration dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* This wrapper decides whether to show AdminLayout or not */}
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
