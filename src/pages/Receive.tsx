import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode, Share2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReceivePage = () => {
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState("tron");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);

  const walletAddresses = {
    tron: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    solana: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "usdt-tron": "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    "usdt-solana": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  };

  const networks = [
    { value: "tron", label: "TRON (TRX)", color: "bg-red-500" },
    { value: "solana", label: "Solana (SOL)", color: "bg-purple-500" },
    { value: "usdt-tron", label: "USDT (TRON)", color: "bg-green-500" },
    { value: "usdt-solana", label: "USDT (Solana)", color: "bg-green-500" },
  ];

  const currentAddress = walletAddresses[selectedNetwork as keyof typeof walletAddresses];

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(currentAddress);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "InventWallet Address",
          text: `Send crypto to this address: ${currentAddress}`,
        });
      } catch (err) {
        // User cancelled share or error occurred
      }
    } else {
      handleCopyAddress();
    }
  };

  const generateQRCode = () => {
    toast({
      title: "QR Code",
      description: "QR code generation feature coming soon",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Receive Crypto</h1>
          <p className="text-muted-foreground">Share your wallet address to receive payments</p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-primary" />
              <span>Receive Address</span>
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
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 ${network.color} rounded-full`}></div>
                        <span>{network.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* QR Code Section */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-48 h-48 bg-white border-2 border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code to get the wallet address
                </p>
                <Button variant="outline" onClick={generateQRCode} className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Address Display */}
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentAddress}
                  readOnly
                  className="bg-muted font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyAddress}
                  className="px-3 flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="px-3 flex-shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Only send {networks.find(n => n.value === selectedNetwork)?.label} to this address
              </p>
            </div>

            {/* Optional Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Expected Amount (Optional)</Label>
              <Input
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Specify an amount to help the sender know how much to send
              </p>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo/Note (Optional)</Label>
              <Input
                id="memo"
                placeholder="Add a note for this transaction"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Network Info */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Important Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <Badge variant="secondary">
                      {networks.find(n => n.value === selectedNetwork)?.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span>{selectedNetwork.includes("tron") ? "1" : "2"} required</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated time:</span>
                    <span>{selectedNetwork.includes("tron") ? "~3 seconds" : "~400ms"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Important:</p>
                  <p className="text-yellow-700">
                    Only send {networks.find(n => n.value === selectedNetwork)?.label.split(' ')[0]} tokens to this address. 
                    Sending other tokens may result in permanent loss.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceivePage;