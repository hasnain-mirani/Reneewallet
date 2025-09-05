import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowRight, QrCode, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SendPage = () => {
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const networks = [
    { value: "tron", label: "TRON (TRX)", balance: "1,234.56 TRX", fee: "1 TRX" },
    { value: "solana", label: "Solana (SOL)", balance: "45.67 SOL", fee: "0.000005 SOL" },
    { value: "usdt-tron", label: "USDT (TRON)", balance: "8,456.78 USDT", fee: "1 TRX" },
    { value: "usdt-solana", label: "USDT (Solana)", balance: "2,000.00 USDT", fee: "0.000005 SOL" },
  ];

  const handleSend = () => {
    if (!selectedNetwork || !recipient || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Initiated",
      description: "Your transaction has been submitted to the network",
    });

    // Reset form
    setSelectedNetwork("");
    setRecipient("");
    setAmount("");
    setMemo("");
  };

  const selectedNetworkData = networks.find(n => n.value === selectedNetwork);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Send Crypto</h1>
          <p className="text-muted-foreground">Send your crypto to any wallet address</p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-primary" />
              <span>Send Transaction</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Network Selection */}
            <div className="space-y-2">
              <Label htmlFor="network">Select Network & Token</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger id="network">
                  <SelectValue placeholder="Choose network and token" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{network.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {network.balance}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedNetworkData && (
                <div className="text-sm text-muted-foreground">
                  Available: {selectedNetworkData.balance} • Network fee: {selectedNetworkData.fee}
                </div>
              )}
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="recipient"
                  placeholder="Enter wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="px-3">
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  Max
                </Button>
              </div>
              {amount && selectedNetworkData && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(amount) * 100).toFixed(2)} USD
                </div>
              )}
            </div>

            {/* Memo (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Input
                id="memo"
                placeholder="Add a note for this transaction"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Transaction Summary */}
            {selectedNetworkData && amount && (
              <Card className="bg-muted/50 border-border/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Transaction Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>{amount} {selectedNetworkData.label.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee:</span>
                      <span>{selectedNetworkData.fee}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Total:</span>
                      <span>{amount} {selectedNetworkData.label.split(' ')[0]} + {selectedNetworkData.fee}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              className="w-full bg-gradient-primary text-white shadow-neon hover:shadow-float"
              size="lg"
              disabled={!selectedNetwork || !recipient || !amount}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Transaction
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendPage;