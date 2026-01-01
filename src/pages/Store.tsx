import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Star, Check, Loader2, ArrowLeft, BookOpen, Sparkles, Building2, Settings2, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Checkbox } from "@/components/ui/checkbox";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

const Store = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for casual learners',
      price: 4.99,
      priceId: 'price_1SklyMLyIdgaowBry3BZE1yZ',
      features: [
        '5 hours learning time per day',
        'Basic AI recommendations',
        'Access to core subjects',
        'Progress tracking',
        'Email support'
      ],
      icon: <Zap className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Most popular for serious students',
      price: 9.99,
      priceId: 'price_1SQxMILyIdgaowBrcCPXH5e8',
      features: [
        'Unlimited learning time',
        'Priority AI recommendations',
        'All subjects unlocked',
        'Multiplayer modes access',
        'Advanced analytics',
        'Ad-free experience',
        'Priority support'
      ],
      icon: <Crown className="h-6 w-6" />,
      popular: true,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams and institutions',
      price: 19.99,
      priceId: 'price_1SklySLyIdgaowBr9aMSf9tf',
      features: [
        'Everything in Premium',
        'Team management dashboard',
        'Custom learning paths',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Bulk user licenses'
      ],
      icon: <Building2 className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const customizableFeatures = [
    { id: 'unlimited_time', name: 'Unlimited Learning Time', price: 2.99 },
    { id: 'ai_recommendations', name: 'AI Recommendations', price: 1.99 },
    { id: 'all_subjects', name: 'All Subjects Access', price: 3.99 },
    { id: 'multiplayer', name: 'Multiplayer Modes', price: 2.49 },
    { id: 'analytics', name: 'Advanced Analytics', price: 1.49 },
    { id: 'ad_free', name: 'Ad-Free Experience', price: 0.99 },
    { id: 'priority_support', name: 'Priority Support', price: 1.99 },
  ];

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data) {
        setCurrentTier(data.tier || 'free');
      }
    } catch (e) {
      console.error('Error checking subscription:', e);
    }
    setCheckingStatus(false);
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      if (error) {
        toast.error('Failed to create checkout session');
      } else if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening Stripe checkout...');
      }
    } catch (e) {
      toast.error('An error occurred');
    }
    setLoading(null);
  };

  const toggleCustomFeature = (featureId: string) => {
    setCustomFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const customTotal = customizableFeatures
    .filter(f => customFeatures.includes(f.id))
    .reduce((sum, f) => sum + f.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backTo')} Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">Unlock unlimited learning potential with the right plan for you</p>
          {currentTier !== 'free' && (
            <Badge variant="secondary" className="mt-2">
              Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            </Badge>
          )}
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {subscriptionTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative ${tier.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''} hover:shadow-lg transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-white mb-4`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id || currentTier === tier.id || checkingStatus}
                >
                  {loading === tier.id ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                  ) : currentTier === tier.id ? (
                    'Current Plan'
                  ) : (
                    'Start 7-Day Free Trial'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Plan Builder */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
                <Settings2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Build Your Custom Plan</CardTitle>
                <CardDescription>Select only the features you need</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {customizableFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    customFeatures.includes(feature.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleCustomFeature(feature.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={customFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleCustomFeature(feature.id)}
                      />
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">+${feature.price}/mo</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Your Custom Plan</p>
                <p className="text-sm text-muted-foreground">
                  {customFeatures.length} features selected
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${customTotal.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <Button 
                  className="mt-2" 
                  disabled={customFeatures.length === 0}
                  onClick={() => toast.info('Custom plans coming soon! Please choose a standard plan for now.')}
                >
                  Subscribe Custom
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>See what's included in each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold">Free</th>
                    <th className="text-center py-3 px-4 font-semibold">Starter</th>
                    <th className="text-center py-3 px-4 font-semibold text-primary">Premium</th>
                    <th className="text-center py-3 px-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { feature: 'Learning time per day', free: '2 hours', starter: '5 hours', premium: 'Unlimited', enterprise: 'Unlimited' },
                    { feature: 'Subjects', free: 'Basic', starter: 'Core', premium: 'All', enterprise: 'All + Custom' },
                    { feature: 'AI Recommendations', free: '❌', starter: 'Basic', premium: 'Priority', enterprise: 'Custom AI' },
                    { feature: 'Multiplayer modes', free: '❌', starter: '❌', premium: '✅', enterprise: '✅' },
                    { feature: 'Analytics', free: 'Basic', starter: 'Standard', premium: 'Advanced', enterprise: 'Enterprise' },
                    { feature: 'Support', free: 'Community', starter: 'Email', premium: 'Priority', enterprise: 'Dedicated' },
                    { feature: 'Team Management', free: '❌', starter: '❌', premium: '❌', enterprise: '✅' },
                    { feature: 'API Access', free: '❌', starter: '❌', premium: '❌', enterprise: '✅' },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{row.feature}</td>
                      <td className="text-center py-3 px-4 text-muted-foreground">{row.free}</td>
                      <td className="text-center py-3 px-4">{row.starter}</td>
                      <td className="text-center py-3 px-4 font-semibold text-primary">{row.premium}</td>
                      <td className="text-center py-3 px-4">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Store;