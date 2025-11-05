
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Coins, Zap, Shield, ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";

const Shop = () => {
  const [userCoins, setUserCoins] = useState(2450);

  const powerUps = [
    {
      id: "double_xp",
      name: "Double XP",
      description: "Double experience points for 1 hour",
      price: 150,
      icon: Zap,
      color: "text-yellow-500",
      duration: "1 hour"
    },
    {
      id: "streak_freeze",
      name: "Streak Freeze",
      description: "Protect your streak for one day",
      price: 100,
      icon: Shield,
      color: "text-blue-500",
      duration: "1 day"
    },
    {
      id: "bonus_coins",
      name: "Coin Boost",
      description: "50% more coins from lessons",
      price: 200,
      icon: Coins,
      color: "text-yellow-600",
      duration: "2 hours"
    }
  ];


  const subscriptions = [
    {
      id: "plus_monthly",
      name: "SūdžiusAI Plus",
      description: "Premium features with unlimited access",
      price: "$9.99/month",
      features: [
        "Unlimited lessons and practice",
        "Priority AI assistance",
        "Advanced analytics",
        "No ads",
        "Custom themes"
      ]
    }
  ];

  const handlePurchase = (item: any, price: number) => {
    if (userCoins >= price) {
      setUserCoins(userCoins - price);
      toast.success(`Purchased ${item.name} for ${price} coins`);
    } else {
      toast.error("You can't afford this", {
        style: {
          background: '#dc2626',
          color: 'white',
          borderRadius: '8px',
        }
      });
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">{userCoins.toLocaleString()}</span>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop & Store
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enhance your learning with premium features and power-ups
          </p>
        </div>

        {/* Premium Subscription */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Plans</h3>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {subscriptions.map((plan) => (
              <Card key={plan.id} className="border-blue-500 border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-lg">{plan.description}</CardDescription>
                    </div>
                    <Badge className="bg-blue-600 text-white text-lg px-4 py-2">{plan.price}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" size="lg">Start Free Trial</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Power-ups Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Power-ups</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {powerUps.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant="secondary">{item.duration}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="font-bold">{item.price}</span>
                    </div>
                    <Button 
                      size="sm"
                      disabled={userCoins < item.price}
                      onClick={() => handlePurchase(item, item.price)}
                    >
                      Buy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
