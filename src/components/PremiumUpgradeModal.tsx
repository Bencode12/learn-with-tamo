import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, BarChart3, Mail, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PremiumUpgradeModal = ({ open, onOpenChange }: PremiumUpgradeModalProps) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "AI-Powered Insights",
      description: "Get detailed analysis of your progress and personalized recommendations",
      highlight: true
    },
    {
      icon: Mail,
      title: "Weekly Reports",
      description: "Receive AI-generated reports with insights on where to improve",
      highlight: false
    },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Show off your premium status in multiplayer and leaderboards",
      highlight: false
    },
    {
      icon: Heart,
      title: "Unlimited Wellness Check-ins",
      description: "Track your mental health and wellness without limits",
      highlight: false
    }
  ];

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/store');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Upgrade to KnowIt AI Plus
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Unlock unlimited learning potential with premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    feature.highlight ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 dark:from-blue-900/30 dark:to-purple-900/30 dark:border-blue-800/50' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${feature.highlight ? 'text-blue-600' : 'text-green-600'}`}>
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">$9.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade Now
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};