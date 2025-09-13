
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Coins, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

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


  const handlePurchase = (item: any, price: number) => {
    if (userCoins >= price) {
      setUserCoins(userCoins - price);
      console.log(`Purchased ${item.name} for ${price} coins`);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="flex items-center space-x-3">
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
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coin Shop
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Spend your hard-earned coins on power-ups to enhance your learning experience
          </p>
        </div>

        {/* Power-ups Section */}
        <div className="space-y-6">
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
