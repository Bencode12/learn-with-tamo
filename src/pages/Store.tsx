import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Star, Check, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSelector from "@/components/LanguageSelector";

const Store = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    setCheckingStatus(true);
    const { data, error } = await supabase.functions.invoke('check-subscription');
    if (!error && data) setIsPremium(data.subscribed);
    setCheckingStatus(false);
  };

  const handleStartTrial = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-checkout');
    if (error) {
      toast.error('Failed to create checkout session');
    } else if (data?.url) {
      window.open(data.url, '_blank');
      toast.success('Opening Stripe checkout...');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
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
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Premium</h2>
          <p className="text-muted-foreground">Unlock unlimited learning potential</p>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">SūdžiusAI Plus</CardTitle>
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <CardDescription className="text-lg">Unlock unlimited learning potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {[
                    "Unlimited learning time - learn without interruption",
                    "Priority AI recommendations",
                    "All subjects and lessons unlocked",
                    "Ad-free experience",
                    "Access to multiplayer modes",
                    "Advanced progress analytics"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleStartTrial} disabled={loading || isPremium}>
                    {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>) : isPremium ? 'Already Premium' : 'Start Free Trial'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">7 days free, then $9.99/month. Cancel anytime.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Premium Benefits</CardTitle>
                <CardDescription>Why go premium?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Zap, color: "blue", title: "Learn Faster", desc: "No time limit means you can practice as much as you want" },
                  { icon: Star, color: "purple", title: "Premium Content", desc: "Access exclusive lessons and advanced topics" },
                  { icon: Shield, color: "green", title: "Priority Support", desc: "Get help faster with premium support" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className={`bg-${item.color}-500/10 p-3 rounded-lg`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

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
                { feature: "Learning time per day", free: "2 hours", premium: "Unlimited" },
                { feature: "Subjects", free: "Basic only", premium: "All subjects" },
                { feature: "Lessons", free: "Limited", premium: "All lessons" },
                { feature: "Multiplayer modes", free: "❌", premium: "✅" },
                { feature: "AI recommendations", free: "Basic", premium: "Advanced" },
                { feature: "Progress analytics", free: "Basic", premium: "Detailed" },
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
