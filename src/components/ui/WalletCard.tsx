import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WalletCardProps {
  balance: string;
  usdValue: string;
  change24h: number;
  network: "TRON" | "Solana";
  className?: string;
}

const WalletCard = ({ balance, usdValue, change24h, network, className }: WalletCardProps) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const isPositive = change24h >= 0;

  const networkColors = {
    TRON: "bg-red-500",
    Solana: "bg-purple-500",
  };

  return (
    <Card className={`bg-gradient-card border-border/50 shadow-card hover:shadow-float transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${networkColors[network]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
              {network === "TRON" ? "T" : "S"}
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{network}</h3>
              <Badge variant="secondary" className="text-xs">
                {network === "TRON" ? "TRX" : "SOL"}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="h-8 w-8 p-0"
          >
            {isBalanceVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-bold text-card-foreground">
            {isBalanceVisible ? balance : "••••••"}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg text-muted-foreground">
              {isBalanceVisible ? usdValue : "••••••"}
            </span>
            <div className={`flex items-center space-x-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? "+" : ""}{change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;