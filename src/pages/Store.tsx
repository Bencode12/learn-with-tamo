
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield, Users, Star, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Store = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            SūdžiusAI Plus
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock premium features and enhance your learning experience
          </p>
        </div>

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
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </main>
    </div>
  );
};

export default Store;
