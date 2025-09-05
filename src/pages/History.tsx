import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { History, Send, Download, ArrowUpDown, Search, Filter, ExternalLink } from "lucide-react";

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterNetwork, setFilterNetwork] = useState("all");

  const transactions = [
    {
      id: "tx_001",
      type: "Send",
      amount: "-123.45 USDT",
      to: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
      network: "TRON",
      time: "2024-01-15 14:30:22",
      status: "Completed",
      fee: "1 TRX",
      hash: "0x1234...5678"
    },
    {
      id: "tx_002",
      type: "Receive",
      amount: "+500.00 TRX",
      from: "TPswDDCAWhJAZGdHPidFg5nEf7fQjUdTgNs",
      network: "TRON",
      time: "2024-01-14 09:15:45",
      status: "Completed",
      fee: "0 TRX",
      hash: "0x2345...6789"
    },
    {
      id: "tx_003",
      type: "Convert",
      amount: "SOL → USDT",
      details: "10.5 SOL → 920.25 USDT",
      network: "Solana",
      time: "2024-01-13 16:45:12",
      status: "Completed",
      fee: "0.000005 SOL",
      hash: "0x3456...7890"
    },
    {
      id: "tx_004",
      type: "Buy",
      amount: "+1,000.00 USDT",
      details: "Purchased with Visa ****1234",
      network: "TRON",
      time: "2024-01-12 11:20:33",
      status: "Completed",
      fee: "$25.00",
      hash: "0x4567...8901"
    },
    {
      id: "tx_005",
      type: "Send",
      amount: "-5.25 SOL",
      to: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      network: "Solana",
      time: "2024-01-11 20:10:15",
      status: "Pending",
      fee: "0.000005 SOL",
      hash: "0x5678...9012"
    },
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tx.from && tx.from.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || tx.type.toLowerCase() === filterType;
    const matchesNetwork = filterNetwork === "all" || tx.network.toLowerCase() === filterNetwork;
    
    return matchesSearch && matchesType && matchesNetwork;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Send":
        return <Send className="w-4 h-4" />;
      case "Receive":
        return <Download className="w-4 h-4" />;
      case "Convert":
      case "Buy":
        return <ArrowUpDown className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Send":
        return "bg-red-100 text-red-600";
      case "Receive":
        return "bg-green-100 text-green-600";
      case "Convert":
      case "Buy":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="send">Send</SelectItem>
                  <SelectItem value="receive">Receive</SelectItem>
                  <SelectItem value="convert">Convert</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterNetwork} onValueChange={setFilterNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="tron">TRON</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5 text-primary" />
              <span>Recent Transactions</span>
              <Badge variant="secondary">{filteredTransactions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                        {getTypeIcon(tx.type)}
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
                      <Badge className={getStatusColor(tx.status)} variant="secondary">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {tx.to && (
                      <div>
                        <span className="font-medium">To:</span> {tx.to.slice(0, 10)}...{tx.to.slice(-6)}
                      </div>
                    )}
                    {tx.from && (
                      <div>
                        <span className="font-medium">From:</span> {tx.from.slice(0, 10)}...{tx.from.slice(-6)}
                      </div>
                    )}
                    {tx.details && (
                      <div>
                        <span className="font-medium">Details:</span> {tx.details}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Network:</span> {tx.network}
                    </div>
                    <div>
                      <span className="font-medium">Fee:</span> {tx.fee}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Hash:</span>
                      <span>{tx.hash}</span>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No transactions found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;