export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This centers the Clerk box on the screen with a dark glass background
    <div className="min-h-screen w-full flex items-center justify-center bg-black/50 backdrop-blur-xl">
      {children}
    </div>
  );
}