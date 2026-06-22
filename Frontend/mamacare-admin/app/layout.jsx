import "./globals.css";
import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = {
  title: "MamaCare Admin",
  description: "MamaCare administration dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
