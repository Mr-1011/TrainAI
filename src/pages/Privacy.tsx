import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/register">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>Last updated: October 21, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                StampScan ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2 mt-4">Personal Information</h3>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Email address and account credentials</li>
                <li>Name and contact information</li>
                <li>Passport images and travel documents</li>
                <li>Travel history and destination data</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Automatically Collected Information</h3>
              <p className="text-muted-foreground">
                When you use our Service, we automatically collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
                <li>Usage data and interaction patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process and extract travel data from passport images</li>
                <li>Create and manage your account</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Detect, prevent, and address security issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-2">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>With your explicit consent</li>
                <li>With service providers who assist in operating our Service</li>
                <li>To comply with legal obligations or valid legal requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, sale, or business transfer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to provide the Service and fulfill the
                purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize
                your personal information, unless we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
              <p className="text-muted-foreground mb-2">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and
                assist in our marketing efforts. You can control cookies through your browser settings, but
                disabling cookies may affect your ability to use certain features of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of
                residence. We ensure appropriate safeguards are in place to protect your information in accordance
                with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If we learn we have collected such information,
                we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of
                the Service after such modifications constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@stampscan.com<br />
                Address: StampScan Privacy Team
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;

