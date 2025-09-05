import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConvertPage = () => {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("usdt");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const tokens = [
    { value: "usd", label: "USD (Fiat)", balance: "Available via card", rate: 1 },
    { value: "tron", label: "TRON (TRX)", balance: "1,234.56 TRX", rate: 0.068 },
    { value: "solana", label: "Solana (SOL)", balance: "45.67 SOL", rate: 87.65 },
    { value: "usdt", label: "USDT", balance: "8,456.78 USDT", rate: 1 },
  ];

  const handleAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && fromToken && toToken) {
      const fromRate = tokens.find(t => t.value === fromToken)?.rate || 1;
      const toRate = tokens.find(t => t.value === toToken)?.rate || 1;
      const converted = (parseFloat(value) * fromRate / toRate).toFixed(6);
      setToAmount(converted);
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
    setToAmount("");
  };

  const handleConvert = () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (fromToken === "usd") {
      toast({
        title: "Fiat Purchase Initiated",
        description: "Redirecting to payment provider...",
      });
    } else {
      toast({
        title: "Conversion Successful",
        description: `Converted ${fromAmount} ${fromToken.toUpperCase()} to ${toAmount} ${toToken.toUpperCase()}`,
      });
    }

    // Reset form
    setFromAmount("");
    setToAmount("");
  };

  const fromTokenData = tokens.find(t => t.value === fromToken);
  const toTokenData = tokens.find(t => t.value === toToken);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Convert & Buy</h1>
          <p className="text-muted-foreground">Convert between tokens or buy crypto with fiat</p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              <span>Token Conversion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Token */}
            <div className="space-y-2">
              <Label htmlFor="from-token">From</Label>
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger id="from-token">
                  <SelectValue placeholder="Select token to convert from" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.value} value={token.value} disabled={token.value === toToken}>
                      <div className="flex items-center justify-between w-full">
                        <span>{token.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {token.balance}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                type="number"
              />
              {fromTokenData && fromAmount && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(fromAmount) * fromTokenData.rate).toFixed(2)} USD
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapTokens}
                className="rounded-full p-2 hover:bg-accent"
                disabled={!fromToken || !toToken}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label htmlFor="to-token">To</Label>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger id="to-token">
                  <SelectValue placeholder="Select token to convert to" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.value} value={token.value} disabled={token.value === fromToken}>
                      <div className="flex items-center justify-between w-full">
                        <span>{token.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {token.balance}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="bg-muted"
              />
              {toTokenData && toAmount && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(toAmount) * toTokenData.rate).toFixed(2)} USD
                </div>
              )}
            </div>

            {/* Exchange Rate */}
            {fromTokenData && toTokenData && (
              <Card className="bg-muted/50 border-border/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Exchange Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange Rate:</span>
                      <span>1 {fromTokenData.label.split(' ')[0]} = {(fromTokenData.rate / toTokenData.rate).toFixed(6)} {toTokenData.label.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee:</span>
                      <span>~$0.50</span>
                    </div>
                    {fromToken === "usd" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Fee:</span>
                        <span>2.5%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Convert Button */}
            <Button
              onClick={handleConvert}
              className="w-full bg-gradient-primary text-white shadow-neon hover:shadow-float"
              size="lg"
              disabled={!fromToken || !toToken || !fromAmount}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {fromToken === "usd" ? "Buy with Card" : "Convert Tokens"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {fromToken === "usd" && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Powered by secure payment processors • 256-bit SSL encryption
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConvertPage;