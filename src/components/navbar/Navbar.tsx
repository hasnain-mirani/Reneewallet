// AppNavbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Wallet, Menu, X, ArrowLeftRight, Send, ShoppingCart, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import ConnectWalletNav from "./ConnectWalletNav";
import { useTranslation } from "react-i18next";

const AppNavbar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");
  const isTradeActive = ["/convert", "/send", "/buy", "/receive"].some((p) => isActive(p));

  const pillBase = "px-4 py-2 rounded-2xl text-sm font-medium transition";
  const pillActive = "bg-foreground/15 text-foreground shadow-inner";
  const pillIdle = "text-foreground/80 hover:text-foreground hover:bg-foreground/10";

  const Tab = ({ to, label, badge }: { to: string; label: string; badge?: string }) => (
    <Link
      to={to}
      className={`${pillBase} ${isActive(to) ? pillActive : pillIdle}`}
      aria-current={isActive(to) ? "page" : undefined}
    >
      <span className="inline-flex items-center gap-2">
        {label}
        {badge && (
          <Badge className="h-5 px-2 text-[10px] leading-none bg-pink-500 text-white hover:bg-pink-500">
            {badge}
          </Badge>
        )}
      </span>
    </Link>
  );

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Renee Wallet Home">
            <div className="w-8 h-8 bg-gradient-neon rounded-lg grid place-items-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              Renee Wallet
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Tab to="/portfolio" label={t("nav.portfolio", { defaultValue: "Portfolio" })} />
            <Tab to="/Staking" label={t("nav.staking", { defaultValue: "Staking" })} />

            {/* Trade dropdown */}
            <Menubar className="bg-transparent border-0 p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger
                  className={`${pillBase} ${isTradeActive ? pillActive : pillIdle} data-[state=open]:${pillActive}`}
                >
                  {t("nav.trade", { defaultValue: "Trade" })}
                </MenubarTrigger>
                <MenubarContent align="start" className="min-w-[12rem]">
                  <MenubarItem asChild>
                    <Link to="/convert" className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      {t("nav.swap", { defaultValue: "Swap" })}
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/send" className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t("nav.send", { defaultValue: "Send" })}
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/buy" className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      {t("nav.buy", { defaultValue: "Buy" })}
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/receive" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {t("nav.deposit", { defaultValue: "Deposit" })}
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>

            <Tab to="/rewards" label={t("nav.rewards", { defaultValue: "Rewards" })} />
            <Tab
              to="/leap-fest"
              label={t("nav.reneeFest", { defaultValue: "Renee Wallet Fest" })}
              badge={t("nav.new", { defaultValue: "NEW" })}
            />

            {/* Right-side connect pill */}
            <div className="hidden md:flex items-center gap-2">
              <ConnectWalletNav />
            </div>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((s) => !s)}
            aria-label={open ? t("nav.closeMenu", { defaultValue: "Close menu" }) : t("nav.openMenu", { defaultValue: "Open menu" })}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border py-3">
            <div className="flex flex-col gap-1">
              <Tab to="/dashboard" label={t("nav.portfolio", { defaultValue: "Portfolio" })} />
              <Tab to="/Staking" label={t("nav.staking", { defaultValue: "Staking" })} />
              {/* Trade inline on mobile */}
              <div className={`${pillBase} ${isTradeActive ? pillActive : pillIdle}`}>
                {t("nav.trade", { defaultValue: "Trade" })}
              </div>
              <div className="ml-2 flex flex-col">
                <Link to="/convert" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>
                  {t("nav.swap", { defaultValue: "Swap" })}
                </Link>
                <Link to="/send" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>
                  {t("nav.send", { defaultValue: "Send" })}
                </Link>
                <Link to="/buy" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>
                  {t("nav.buy", { defaultValue: "Buy" })}
                </Link>
                <Link to="/receive" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>
                  {t("nav.deposit", { defaultValue: "Deposit" })}
                </Link>
              </div>
              <Tab to="/rewards" label={t("nav.rewards", { defaultValue: "Rewards" })} />
              <Tab
                to="/leap-fest"
                label={t("nav.reneeFest", { defaultValue: "Renee Wallet Fest" })}
                badge={t("nav.new", { defaultValue: "NEW" })}
              />
              <div className="mt-2">
                <ConnectWalletNav />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;
