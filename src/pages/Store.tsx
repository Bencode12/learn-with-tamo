
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield, Users, Star, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Store = () => {
  const premiumTiers = [
    {
      id: "basic",
      name: "Basic Premium",
      price: "$4.99/month",
      features: [
        "Priority queue in matchmaking",
        "Enhanced progress tracking",
        "Custom profile themes",
        "Ad-free experience"
      ],
      color: "border-blue-500",
      popular: false
    },
    {
      id: "pro",
      name: "Pro Premium",
      price: "$9.99/month",
      features: [
        "All Basic features",
        "Developer badge",
        "Early access to new features",
        "Priority customer support",
        "Advanced analytics",
        "Custom study schedules"
      ],
      color: "border-purple-500",
      popular: true
    },
    {
      id: "elite",
      name: "Elite Premium",
      price: "$19.99/month",
      features: [
        "All Pro features",
        "Elite badge",
        "Personal AI tutor sessions",
        "Exclusive tournaments",
        "Direct developer feedback",
        "Beta testing access"
      ],
      color: "border-yellow-500",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI Store</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/shop">
                <Button variant="outline" size="sm">Coin Shop</Button>
              </Link>
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
            Premium Subscriptions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock exclusive features and enhance your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {premiumTiers.map((tier) => (
            <Card key={tier.id} className={`relative ${tier.color} border-2 ${tier.popular ? 'scale-105' : ''}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-2">{tier.price}</div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="lg">
                  <Crown className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Priority Access</h3>
              <p className="text-gray-600">Skip the queue and get instant access to all features</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Exclusive Community</p>
              <p className="text-gray-600">Join premium-only tournaments and events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enhanced Support</h3>
              <p className="text-gray-600">Get priority customer support and feedback</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Store;
