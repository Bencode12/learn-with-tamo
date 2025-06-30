
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Crown, Star, Zap, Shield, Rocket, Gift, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Store = () => {
  const [selectedTab, setSelectedTab] = useState("ranks");

  const rankPackages = [
    {
      id: "premium",
      name: "Premium",
      price: 9.99,
      icon: Zap,
      color: "bg-blue-500",
      features: [
        "Priority support",
        "Advanced analytics",
        "Custom themes",
        "Ad-free experience",
        "Premium badge"
      ],
      popular: false
    },
    {
      id: "vip",
      name: "VIP",
      price: 19.99,
      icon: Star,
      color: "bg-yellow-500",
      features: [
        "Everything in Premium",
        "VIP-only content",
        "Early access to features",
        "Monthly exclusive events",
        "VIP badge with special effects"
      ],
      popular: true
    },
    {
      id: "developer",
      name: "Developer",
      price: 49.99,
      icon: Crown,
      color: "bg-purple-500",
      features: [
        "Everything in VIP",
        "Direct developer contact",
        "Influence feature development",
        "Beta testing privileges",
        "Legendary developer crown"
      ],
      popular: false
    }
  ];

  const powerUps = [
    {
      id: "priority",
      name: "Priority Queue",
      price: 4.99,
      description: "Skip the line and get instant access to AI tutoring",
      icon: Rocket,
      duration: "7 days"
    },
    {
      id: "shield",
      name: "Streak Shield",
      price: 2.99,
      description: "Protect your learning streak from being broken",
      icon: Shield,
      duration: "3 uses"
    },
    {
      id: "boost",
      name: "XP Boost",
      price: 3.99,
      description: "Double XP gain for all completed lessons",
      icon: TrendingUp,
      duration: "24 hours"
    }
  ];

  const cosmetics = [
    {
      id: "avatar_frame_gold",
      name: "Golden Frame",
      price: 7.99,
      description: "Luxury golden avatar frame",
      preview: "🟨"
    },
    {
      id: "avatar_frame_diamond",
      name: "Diamond Frame",
      price: 12.99,
      description: "Sparkling diamond avatar frame",
      preview: "💎"
    },
    {
      id: "profile_theme_dark",
      name: "Dark Theme",
      price: 5.99,
      description: "Sleek dark profile theme",
      preview: "🌙"
    },
    {
      id: "profile_theme_neon",
      name: "Neon Theme",
      price: 8.99,
      description: "Vibrant neon profile theme",
      preview: "⚡"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">LearnAI Store</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/profile">
                <Button variant="ghost" size="sm">Profile</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Enhance Your Learning Experience
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock premium features, show off your style, and boost your learning with our exclusive store items
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={selectedTab === "ranks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab("ranks")}
              className="mx-1"
            >
              <Crown className="h-4 w-4 mr-2" />
              Ranks
            </Button>
            <Button
              variant={selectedTab === "powerups" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab("powerups")}
              className="mx-1"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Power-ups
            </Button>
            <Button
              variant={selectedTab === "cosmetics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab("cosmetics")}
              className="mx-1"
            >
              <Gift className="h-4 w-4 mr-2" />
              Cosmetics
            </Button>
          </div>
        </div>

        {/* Ranks Section */}
        {selectedTab === "ranks" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rankPackages.map((rank) => (
              <Card key={rank.id} className={`relative ${rank.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {rank.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${rank.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <rank.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{rank.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">${rank.price}</span>
                    <span className="text-gray-500">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {rank.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={rank.popular ? "default" : "outline"}>
                    Upgrade to {rank.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Power-ups Section */}
        {selectedTab === "powerups" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {powerUps.map((powerup) => (
              <Card key={powerup.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <powerup.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{powerup.name}</CardTitle>
                      <Badge variant="secondary">{powerup.duration}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{powerup.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${powerup.price}</span>
                    <Button>Purchase</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cosmetics Section */}
        {selectedTab === "cosmetics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cosmetics.map((cosmetic) => (
              <Card key={cosmetic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{cosmetic.preview}</div>
                  <CardTitle className="text-lg">{cosmetic.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">{cosmetic.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">${cosmetic.price}</span>
                    <Button size="sm">Buy</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>All purchases are final. Subscriptions can be cancelled anytime.</p>
        </div>
      </main>
    </div>
  );
};

export default Store;
