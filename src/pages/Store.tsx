import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield, Users, Star, BookOpen, Coins, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";

const Store = () => {
  const [userCoins, setUserCoins] = useState(1200);

  const coinPackages = [
    { id: 1, coins: 500, price: "$4.99", bonus: 0 },
    { id: 2, coins: 1200, price: "$9.99", bonus: 200 },
    { id: 3, coins: 2500, price: "$19.99", bonus: 500 },
    { id: 4, coins: 5500, price: "$39.99", bonus: 1500 }
  ];

  const handlePurchase = (coins: number, price: string) => {
    toast.success(`Purchased ${coins} coins for ${price}!`);
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
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-yellow-900">{userCoins}</span>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop & Store
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Purchase coins and unlock premium features
          </p>
        </div>

        {/* Premium Plans Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Premium Plans</h3>
          <div className="max-w-md mx-auto">
            <Card className="relative border-2 border-blue-500 scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">SūdžiusAI Plus</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-2">$6.99/month</div>
                <CardDescription className="mt-2">Everything you need to accelerate your learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Unlimited hearts - never lose progress</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">No ads - focus on learning</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Unlimited streak freezes</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Priority matchmaking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Detailed progress analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Custom study schedules</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Premium badge and profile customization</span>
                  </li>
                </ul>
                <Button className="w-full" size="lg">
                  <Crown className="h-4 w-4 mr-2" />
                  Start Free Trial
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  7-day free trial, then $6.99/month. Cancel anytime.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Unlimited Learning</h3>
                <p className="text-gray-600">Never run out of hearts or chances to learn</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Priority Access</h3>
                <p className="text-gray-600">Get matched faster in competitive modes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Streak Protection</h3>
                <p className="text-gray-600">Unlimited streak freezes to maintain your progress</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coin Packages Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Buy Coins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coinPackages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center items-center mb-2">
                    <Coins className="h-8 w-8 text-yellow-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-yellow-600">
                    {pkg.coins}
                    {pkg.bonus > 0 && (
                      <span className="text-sm text-green-600 ml-2">+{pkg.bonus}</span>
                    )}
                  </CardTitle>
                  <CardDescription>Coins</CardDescription>
                  {pkg.bonus > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      Bonus {pkg.bonus}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-900">{pkg.price}</div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchase(pkg.coins + pkg.bonus, pkg.price)}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Store;
