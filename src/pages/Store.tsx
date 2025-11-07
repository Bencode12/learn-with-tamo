import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Star, Check } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

const Store = () => {
  const handleStartTrial = () => {
    toast.success("Premium trial started! Enjoy 7 days free.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={true} showIcons={true} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Premium</h2>
          <p className="text-muted-foreground">Unlock unlimited learning potential</p>
        </div>

        {/* Premium Plans Section */}
        <div className="mb-12">
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
                    <span>Access to multiplayer modes</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Advanced progress analytics</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleStartTrial}>
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
                <CardTitle className="text-2xl">Premium Benefits</CardTitle>
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

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>See what's included in Premium</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 font-semibold pb-2 border-b">
                <div>Feature</div>
                <div className="text-center">Free</div>
                <div className="text-center">Premium</div>
              </div>
              
              {[
                { feature: "Lives per day", free: "5", premium: "Unlimited" },
                { feature: "Lessons", free: "Limited", premium: "All lessons" },
                { feature: "Multiplayer modes", free: "❌", premium: "✅" },
                { feature: "AI recommendations", free: "Basic", premium: "Advanced" },
                { feature: "Progress analytics", free: "Basic", premium: "Detailed" },
                { feature: "Ads", free: "Yes", premium: "No" },
                { feature: "Priority support", free: "❌", premium: "✅" },
              ].map((row, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-medium">{row.feature}</div>
                  <div className="text-center text-muted-foreground">{row.free}</div>
                  <div className="text-center text-primary font-semibold">{row.premium}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Store;
