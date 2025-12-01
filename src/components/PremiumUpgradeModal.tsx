import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Heart, BarChart3, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PremiumUpgradeModal = ({ open, onOpenChange }: PremiumUpgradeModalProps) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Unlimited Hearts",
      description: "Practice as much as you want without waiting for heart refills",
      highlight: true
    },
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
            Upgrade to SūdžiusAI Plus
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Unlock unlimited learning potential with premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 p-4 rounded-lg ${
                feature.highlight ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                feature.highlight ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-600">/month</span>
          </div>
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade Now
          </Button>
          <p className="text-xs text-center text-gray-500">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};