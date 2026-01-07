import { DynamicNavbar } from "@/components/landing/DynamicNavbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <DynamicNavbar />
      <main>{children}</main>
    </div>
  );
}