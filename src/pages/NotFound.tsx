// src/pages/NotFound.tsx
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          {t("notFound.message", { defaultValue: "Oops! Page not found" })}
        </p>
        <Link to="/">
          <Button>
            {t("notFound.backHome", { defaultValue: "Return to Home" })}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
