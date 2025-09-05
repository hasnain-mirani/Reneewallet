import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/ui/WalletCard";
import ActionButton from "@/components/ui/ActionButton";
import { Send, Download, ArrowUpDown, Plus, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalBalance] = useState("$12,456.78");

  const walletData = [
    {
      balance: "1,234.56 TRX",
      usdValue: "$8,456.78",
      change24h: 2.34,
      network: "TRON" as const,
    },
    {
      balance: "45.67 SOL",
      usdValue: "$4,000.00",
      change24h: -1.23,
      network: "Solana" as const,
    },
  ];

  const recentTransactions = [
    { type: "Send", amount: "-123.45 USDT", time: "2 hours ago", status: "Completed" },
    { type: "Receive", amount: "+500.00 TRX", time: "1 day ago", status: "Completed" },
    { type: "Convert", amount: "SOL → USDT", time: "2 days ago", status: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">BALANCE</h1>
            <div className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
              {totalBalance}
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+5.67% (24h)</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ActionButton
              icon={Send}
              label="Send"
              onClick={() => navigate("/send")}
              variant="primary"
            />
            <ActionButton
              icon={Download}
              label="Receive"
              onClick={() => navigate("/receive")}
            />
            <ActionButton
              icon={ArrowUpDown}
              label="Convert"
              onClick={() => navigate("/convert")}
            />
            <ActionButton
              icon={Plus}
              label="Buy Crypto"
              onClick={() => navigate("/buy")}
            />
          </div>
        </div>

        {/* Wallet Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {walletData.map((wallet, index) => (
            <WalletCard
              key={index}
              balance={wallet.balance}
              usdValue={wallet.usdValue}
              change24h={wallet.change24h}
              network={wallet.network}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "Send" ? "bg-red-100 text-red-600" :
                      tx.type === "Receive" ? "bg-green-100 text-green-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {tx.type === "Send" && <Send className="w-4 h-4" />}
                      {tx.type === "Receive" && <Download className="w-4 h-4" />}
                      {tx.type === "Convert" && <ArrowUpDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">{tx.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      tx.amount.startsWith("+") ? "text-green-600" :
                      tx.amount.startsWith("-") ? "text-red-600" :
                      "text-card-foreground"
                    }`}>
                      {tx.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;