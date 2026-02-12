import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-foreground">KnowIt AI</h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">Find answers to common questions and get support</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search for help..." 
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is KnowIt AI?</AccordionTrigger>
                    <AccordionContent>
                      KnowIt AI is an AI-powered educational platform that helps students learn more effectively 
                      through personalized lessons, interactive exercises, and intelligent recommendations. 
                      We integrate with platforms like Tamo and ManoDienynas to sync your grades and provide 
                      targeted learning suggestions.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>How does the wellness check-in system work?</AccordionTrigger>
                    <AccordionContent>
                      All users can track their mental health and wellness through our check-in system. 
                      Regular check-ins help our AI provide better personalized recommendations for your learning journey.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I connect my Tamo or ManoDienynas account?</AccordionTrigger>
                    <AccordionContent>
                      Go to Settings → Account tab, then enter your Tamo or ManoDienynas credentials. 
                      Your login information is encrypted and securely stored. We only use it to fetch your 
                      grades and provide personalized recommendations.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>What's included in the Premium subscription?</AccordionTrigger>
                    <AccordionContent>
                      Premium subscribers get unlimited wellness check-ins, AI-powered insights on their progress, 
                      weekly email reports with personalized recommendations, and access to advanced features 
                      like detailed analytics and priority support. The subscription costs $9.99/month.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>Can I export my progress data?</AccordionTrigger>
                    <AccordionContent>
                      Yes! Go to your Profile or Progress page and look for the export button. You can 
                      download your lesson progress, exam results, and achievements as CSV or PDF files.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>How do multiplayer modes work?</AccordionTrigger>
                    <AccordionContent>
                      KnowIt AI offers several multiplayer learning modes: Duos (2 players), Team (3+ players), 
                      and Ranked mode. Create or join rooms using room codes, then compete with other students 
                      in real-time quizzes and challenges. The platform includes anti-cheat measures to ensure 
                      fair play.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>Is my data secure?</AccordionTrigger>
                    <AccordionContent>
                      Absolutely. We use industry-standard encryption for all data transmission and storage. 
                      Your credentials for third-party services are encrypted, and we follow strict data 
                      protection practices. Read our Privacy Policy for more details.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>How can I cancel my subscription?</AccordionTrigger>
                    <AccordionContent>
                      You can cancel your Premium subscription at any time from the Store page. Click on 
                      "Manage Subscription" to access your subscription settings. Your access will continue 
                      until the end of your current billing period.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger>What languages are supported?</AccordionTrigger>
                    <AccordionContent>
                      KnowIt AI currently supports English and Lithuanian, with more languages coming soon. 
                      You can change your language preference from any page using the language selector in 
                      the top navigation bar.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger>Still have questions?</AccordionTrigger>
                    <AccordionContent>
                      If you couldn't find the answer you're looking for, please <Link to="/contact" className="text-blue-600 hover:underline">contact our support team</Link>. 
                      We're here to help at support@sudzinas.pw.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;