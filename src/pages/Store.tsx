import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Zap, Shield, Star, Check } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Store = () => {
  const { user } = useAuth();
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCoins = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserCoins(data.coins);
      }
    };

    fetchCoins();
  }, [user]);

  const coinPackages = [
    { coins: 100, bonus: 0, price: "$0.99", priceValue: 0.99 },
    { coins: 500, bonus: 50, price: "$4.99", priceValue: 4.99, popular: true },
    { coins: 1000, bonus: 150, price: "$8.99", priceValue: 8.99 },
    { coins: 2500, bonus: 500, price: "$19.99", priceValue: 19.99 },
    { coins: 5000, bonus: 1500, price: "$34.99", priceValue: 34.99, bestValue: true },
    { coins: 10000, bonus: 3500, price: "$59.99", priceValue: 59.99 }
  ];

  const handlePurchase = async (coins: number, price: string) => {
    if (!user) return;

    try {
      // For demo purposes, just add the coins
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ coins: profile.coins + coins })
          .eq('id', user.id);

        setUserCoins(profile.coins + coins);
        toast.success(`Successfully purchased ${coins} coins!`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to complete purchase');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={true} showIcons={true} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Store</h2>
          <p className="text-muted-foreground">Purchase coins and unlock premium features</p>
        </div>

        {/* Premium Plans Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">Premium Plans</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">SūdžiusAI Plus</CardTitle>
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <CardDescription className="text-lg">
                  Unlock unlimited learning potential
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Unlimited lives - learn without interruption</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Priority AI recommendations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Exclusive premium lessons and content</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ad-free experience</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Monthly coin bonus</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Start Free Trial
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    7 days free, then $9.99/month. Cancel anytime.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Benefits</CardTitle>
                <CardDescription>Why go premium?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Learn Faster</h4>
                    <p className="text-sm text-muted-foreground">
                      No lives limit means you can practice as much as you want
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Premium Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Access exclusive lessons and advanced topics
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Get help faster with premium support
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coins Section */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Buy Coins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coinPackages.map((pkg, index) => (
              <Card
                key={index}
                className={`relative ${
                  pkg.popular
                    ? 'border-2 border-primary bg-primary/5'
                    : pkg.bestValue
                    ? 'border-2 border-green-500 bg-green-500/5'
                    : ''
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                {pkg.bestValue && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                    Best Value
                  </Badge>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="flex justify-center mb-2">
                    <Coins className="h-12 w-12 text-yellow-500" />
                  </div>
                  <CardTitle className="text-3xl">{pkg.coins.toLocaleString()}</CardTitle>
                  {pkg.bonus > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      +{pkg.bonus} Bonus Coins
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-2xl font-bold text-foreground">{pkg.price}</div>
                  <Button
                    onClick={() => handlePurchase(pkg.coins + pkg.bonus, pkg.price)}
                    className="w-full"
                    variant={pkg.popular || pkg.bestValue ? 'default' : 'outline'}
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
