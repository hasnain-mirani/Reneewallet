import { Outlet, useLocation } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function RootLayout() {
  const { pathname } = useLocation();
  // Hide on landing pages if you want (adjust routes as needed)
  const hideSwitcher = pathname === "/" || pathname === "/landing";

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4">
        <div className="text-lg font-bold">Renee</div>
        {!hideSwitcher && <LanguageSwitcher />}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
