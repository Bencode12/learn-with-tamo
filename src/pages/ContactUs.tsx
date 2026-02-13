import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, ArrowLeft, Mail, MessageSquare, Phone, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const ContactUs = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this about?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more..." 
                    rows={6}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground">Email Support</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      For general inquiries, send us an email and we'll respond within 24 hours.
                    </p>
                    <a href="mailto:support@sudzinas.pw" className="text-sm text-primary hover:underline">
                      support@sudzinas.pw
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground">Emergency Support</h3>
                    <p className="text-sm text-muted-foreground">
                      For urgent matters, call our support hotline (available 9AM-5PM EST).
                    </p>
                    <p className="text-sm font-medium text-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MessageSquare className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground">Community Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Join our Discord community for real-time help from other users and staff.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-sm text-primary">
                      Join Discord Community
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <HelpCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground">Help Center</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse our extensive knowledge base for answers to common questions.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-sm text-primary">
                      Visit Help Center
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold">How do I sync my grades?</h4>
                  <p className="text-sm text-gray-600">
                    Go to Settings → Account and enter your Tamo, ManoDienynas, or Švietimo Centras credentials.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">What payment methods do you accept?</h4>
                  <p className="text-sm text-gray-600">
                    We accept all major credit cards through Stripe.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Can I cancel my subscription?</h4>
                  <p className="text-sm text-gray-600">
                    Yes, you can cancel anytime from the Store page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;