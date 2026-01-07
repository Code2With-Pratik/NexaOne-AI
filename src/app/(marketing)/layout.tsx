import { DynamicNavbar } from "@/components/landing/DynamicNavbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Changed bg-black to bg-transparent (or just removed it)
    <div className="relative min-h-screen bg-transparent text-white selection:bg-indigo-500/30">
      <DynamicNavbar />
      <main>{children}</main>
    </div>
  );
}