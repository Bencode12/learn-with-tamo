import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Create an account and use our services</li>
                <li>Complete lessons, exams, and interactive exercises</li>
                <li>Connect third-party services like Tamo.lt or ManoDienynas.lt</li>
                <li>Upload content such as images for OCR processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide, maintain, and improve our educational services</li>
                <li>Personalize your learning experience with AI recommendations</li>
                <li>Sync your grades from connected platforms</li>
                <li>Send you notifications about your progress and achievements</li>
                <li>Analyze usage patterns to enhance our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. 
                Your Tamo.lt and ManoDienynas.lt credentials are encrypted and stored securely. We use 
                secure connections (HTTPS) for all data transmission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Third-Party Services</h2>
              <p>
                KnowIt AI integrates with third-party services including Stripe for payments, 
                Google and Microsoft for authentication, and educational platforms like Tamo.lt and ManoDienynas.lt. 
                These services have their own privacy policies governing their use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access and export your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:support@sudzinas.pw" className="text-blue-600 hover:underline">
                  support@sudzinas.pw
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;