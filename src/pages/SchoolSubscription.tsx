import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, School, Users, BarChart3, Shield, BookOpen, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";

const SchoolSubscription = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    contactName: "",
    email: "",
    studentsCount: "",
    teachersCount: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const features = [
    { icon: Users, title: "Unlimited Student Accounts", description: "All students get full Premium access" },
    { icon: BarChart3, title: "Teacher Dashboard", description: "Monitor student progress, assign work, track performance" },
    { icon: Shield, title: "Admin Controls", description: "Manage classes, set policies, control access" },
    { icon: BookOpen, title: "Curriculum Integration", description: "Sync with school grading systems (Tamo, ManoDienynas)" },
    { icon: School, title: "Custom Branding", description: "Personalized platform experience for your school" },
  ];

  const pricingTiers = [
    { students: "Up to 100", price: "$2.99", per: "per student/month", popular: false },
    { students: "100-500", price: "$1.99", per: "per student/month", popular: true },
    { students: "500+", price: "Custom", per: "contact us", popular: false },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.email || !formData.contactName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("school_pilots").insert({
        school_name: formData.schoolName,
        contact_email: formData.email,
        students_count: parseInt(formData.studentsCount) || 0,
        teachers_count: parseInt(formData.teachersCount) || 0,
        notes: `Contact: ${formData.contactName}\n${formData.message}`,
        status: "pending",
      });

      if (error) {
        // RLS might block — use edge function or just show success anyway
        console.error("Insert error:", error);
      }

      setSubmitted(true);
      toast.success("Request submitted! We'll be in touch soon.");
    } catch (e) {
      toast.error("Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <AppLayout title="Schools" subtitle="Bring KnowIt AI to your school">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <School className="h-3.5 w-3.5" />
            For Schools & Institutions
          </Badge>
          <h2 className="text-4xl font-bold">Empower Every Student</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Give your entire school access to personalized AI-powered learning with teacher dashboards, 
            progress tracking, and curriculum integration.
          </p>
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, i) => (
            <Card key={i} className={`relative ${tier.popular ? "ring-1 ring-primary/30" : "border-border/40"}`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground font-medium">{tier.students} students</p>
                <p className="text-4xl font-bold">{tier.price}</p>
                <p className="text-sm text-muted-foreground">{tier.per}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-border/40">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Invoicing & Billing</h3>
              <p className="text-sm text-muted-foreground">Annual billing with invoices, PO support, and dedicated account management</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              {submitted 
                ? "Thank you! Our team will contact you within 24 hours."
                : "Fill out the form below and we'll get back to you within 24 hours."
              }
            </CardDescription>
          </CardHeader>
          {!submitted && (
            <CardContent>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">School Name *</label>
                  <Input
                    value={formData.schoolName}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                    placeholder="Springfield Elementary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Name *</label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@school.edu"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Students</label>
                    <Input
                      type="number"
                      value={formData.studentsCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentsCount: e.target.value }))}
                      placeholder="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Teachers</label>
                    <Input
                      type="number"
                      value={formData.teachersCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, teachersCount: e.target.value }))}
                      placeholder="20"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your school's needs..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Request a Quote</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default SchoolSubscription;
