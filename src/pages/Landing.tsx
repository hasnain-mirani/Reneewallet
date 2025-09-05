import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Send, 
  ArrowUpDown, 
  Shield, 
  Smartphone, 
  Download, 
  Github,
  MessageCircle,
  CheckCircle,
  Lock,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Send,
      title: "Send & Receive",
      description: "Seamlessly transfer crypto across TRON & Solana networks with low fees"
    },
    {
      icon: ArrowUpDown,
      title: "Fiat to Crypto",
      description: "Convert fiat directly to USDT with secure payment processing"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Non-custodial wallet with advanced encryption and biometric protection"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Responsive design that works perfectly on all devices"
    }
  ];

  const networks = [
    { name: "TRON", symbol: "TRX", color: "bg-red-500" },
    { name: "Solana", symbol: "SOL", color: "bg-purple-500" },
    { name: "USDT", symbol: "USDT", color: "bg-green-500" },
  ];

  const stats = [
    { value: "2", label: "Supported Networks" },
    { value: "10K+", label: "Active Users" },
    { value: "$1M+", label: "Volume Processed" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue-light/20 via-background to-background"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-6">
              <Badge className="bg-gradient-primary text-white px-4 py-2 text-sm animate-pulse-neon">
                Now Supporting TRON & Solana
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">swap, transfer, buy.</span>
              <br />
              <span className="text-foreground">your </span>
              <span className="bg-gradient-neon bg-clip-text text-transparent animate-glow">
                favourite
              </span>
              <br />
              <span className="text-foreground">multichain wallet</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The most advanced wallet for TRON & Solana ecosystems. Send, receive, and convert your crypto with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary text-white shadow-neon hover:shadow-float px-8 py-4 text-lg animate-float"
                onClick={() => navigate("/dashboard")}
              >
                <Download className="w-5 h-5 mr-2" />
                Launch InventWallet
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Github className="w-5 h-5 mr-2" />
                View more
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Go all in, <span className="bg-gradient-neon bg-clip-text text-transparent">your way</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your TRON and Solana assets in one beautiful interface
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-card hover:shadow-float transition-all duration-300 animate-fade-in group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-neon">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Network Support */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Multichain by <span className="bg-gradient-neon bg-clip-text text-transparent">design</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for the future of DeFi with native support for leading blockchain networks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {networks.map((network, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 shadow-card hover:shadow-float transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 ${network.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:animate-pulse`}>
                    {network.symbol}
                  </div>
                  <h3 className="text-xl font-bold">{network.name}</h3>
                  <p className="text-muted-foreground mt-2">
                    {network.name === "TRON" && "Fast, low-cost transactions"}
                    {network.name === "Solana" && "High-speed, scalable network"}
                    {network.name === "USDT" && "Stable digital currency"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ecosystem Partners */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-8">Trusted by the ecosystem</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["TRON Foundation", "Solana Foundation", "Tether", "JustSwap", "Raydium", "Serum"].map((partner, index) => (
                <div key={index} className="text-lg font-medium hover:opacity-100 transition-opacity">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-neon bg-clip-text text-transparent">Safety</span>, guaranteed
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Stay in control, without worrying about security
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Non-custodial</h3>
                    <p className="text-muted-foreground">Your assets are always controlled by you</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Audited & Secure</h3>
                    <p className="text-muted-foreground">Audited by leading blockchain security experts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Open Source</h3>
                    <p className="text-muted-foreground">Verify, then trust. Our code is open to scrutiny</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-gradient-card border-border/50 shadow-float p-8">
                <div className="text-center mb-6">
                  <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Your keys, your crypto</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Biometric unlock</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Hardware wallet support</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Advanced encryption</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="bg-gradient-neon bg-clip-text text-transparent">get started</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users managing their crypto with InventWallet
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-white shadow-neon hover:shadow-float px-8 py-4 text-lg"
              onClick={() => navigate("/dashboard")}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Launch Wallet
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Join Community
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
