import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/AppLayout";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
}

const Store = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Get started with learning',
      price: 0,
      priceId: '',
      features: [
        '2 hours learning time per day',
        'Access to core subjects',
        'Basic progress tracking',
        'Community support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For dedicated learners',
      price: 9.99,
      priceId: 'price_1SQxMILyIdgaowBrcCPXH5e8',
      features: [
        'Unlimited learning time',
        'All subjects unlocked',
        'AI-powered recommendations',
        'Advanced analytics',
        'Priority support',
        'Ad-free experience'
      ],
      popular: true
    }
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
    if (tier === 'free') return;
    
    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      if (error) {
        toast.error('Failed to create checkout session');
      } else if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening checkout...');
      }
    } catch (e) {
      toast.error('An error occurred');
    }
    setLoading(null);
  };

  return (
    <AppLayout title="Plans" subtitle="Choose the plan that works for you">
      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {subscriptionTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative border-border/40 ${
                tier.popular ? 'ring-1 ring-foreground/10' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-foreground/5 border-foreground/10 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    {tier.price === 0 ? 'Free' : `$${tier.price}`}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                
                <div className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full ${tier.popular ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id || currentTier === tier.id || checkingStatus || tier.id === 'free'}
                >
                  {loading === tier.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : currentTier === tier.id ? (
                    'Current Plan'
                  ) : tier.id === 'free' ? (
                    'Current Plan'
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="mt-8 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.' },
              { q: 'Is there a free trial?', a: 'Yes! Premium comes with a 7-day free trial so you can explore all features before committing.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards through our secure payment processor.' }
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <h4 className="font-medium">{item.q}</h4>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Store;
