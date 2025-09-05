// components/layout/Footer.tsx
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand + Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              InventWallet
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              The multichain wallet for <span className="font-medium">TRON</span> &{" "}
              <span className="font-medium">Solana</span> ecosystems.
            </p>
          </div>

          {/* Chain chips (optional) */}
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-foreground/10 text-foreground">
              TRON
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-foreground/10 text-foreground">
              Solana
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/send" className="text-muted-foreground hover:text-foreground">
                  Send &amp; Receive
                </Link>
              </li>
              <li>
                <Link to="/convert" className="text-muted-foreground hover:text-foreground">
                  Convert
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-muted-foreground hover:text-foreground">
                  History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  rel="noreferrer"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  rel="noreferrer"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  rel="noreferrer"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  rel="noreferrer"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Twitter"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Discord"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Telegram"
                  >
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Built with 💙 by InventWallet. Your keys, your crypto.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">© {year} InventWallet</span>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
