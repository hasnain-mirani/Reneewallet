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
import ConnectWalletButton from "../wallet/ConnectWalletButton";

const AppNavbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");
  const isTradeActive =
    ["/convert", "/send", "/buy", "/receive"].some((p) => isActive(p));

  const pillBase =
    "px-4 py-2 rounded-2xl text-sm font-medium transition";
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
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-neon rounded-lg grid place-items-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              InventWallet
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Tab to="/dashboard" label="Portfolio" />
            <Tab to="/Staking" label="Staking" />

            {/* Trade dropdown (Menubar) */}
            <Menubar className="bg-transparent border-0 p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger
                  className={`${pillBase} ${
                    isTradeActive ? pillActive : pillIdle
                  } data-[state=open]:${pillActive}`}
                >
                  Trade
                </MenubarTrigger>
                <MenubarContent align="start" className="min-w-[12rem]">
                  <MenubarItem asChild>
                    <Link to="/convert" className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      Swap
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/send" className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/buy" className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/receive" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Deposit
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>

            <Tab to="/rewards" label="Rewards" />
            <Tab to="/leap-fest" label="Leap Fest" badge="NEW" />

            {/* Right-side connect pill */}
         <ConnectWalletButton className="ml-3 rounded-full bg-white text-black hover:bg-white/90 border border-white/20 h-9 px-4" />
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-top border-border py-3">
            <div className="flex flex-col gap-1">
              <Tab to="/dashboard" label="Portfolio" />
              <Tab to="/Staking" label="Staking" />
              {/* Trade inline on mobile */}
              <div className={`${pillBase} ${isTradeActive ? pillActive : pillIdle}`}>
                Trade
              </div>
              <div className="ml-2 flex flex-col">
                <Link to="/convert" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>Swap</Link>
                <Link to="/send" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>Send</Link>
                <Link to="/buy" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>Buy</Link>
                <Link to="/receive" onClick={() => setOpen(false)} className={`${pillBase} ${pillIdle}`}>Deposit</Link>
              </div>
              <Tab to="/rewards" label="Rewards" />
              <Tab to="/leap-fest" label="Leap Fest" badge="NEW" />
             <ConnectWalletButton className="ml-3 rounded-full bg-white text-black hover:bg-white/90 border border-white/20 h-9 px-4" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;
