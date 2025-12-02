import "./globals.css";

export const metadata = {
  title: "Kinote - Lihat Waktumu, Rasakan Perubahan",
  description: "Kelola waktu dan produktivitasmu dengan mudah bersama Kinote.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-white text-black">
        {/* Header dihapus dari layout */}
        <main>{children}</main>
      </body>
    </html>
  );
}
