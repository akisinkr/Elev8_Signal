export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "#0A0A0A" }}>
      {children}
    </div>
  );
}
