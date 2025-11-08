import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>Last updated: October 21, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using StampScan ("the Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                StampScan provides a digital platform for tracking and managing travel history through passport
                stamp scanning and validation. The Service allows users to upload passport images, extract travel
                information, and maintain a digital record of their international travels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to notify us immediately of any unauthorized
                use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Privacy and Data Usage</h2>
              <p className="text-muted-foreground">
                Your use of the Service is also governed by our Privacy Policy. We collect and process passport
                images and travel data to provide the Service. All data is handled in accordance with applicable
                data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
              <p className="text-muted-foreground">
                You retain ownership of any passport images and data you upload. By uploading content, you grant
                StampScan a license to process, store, and display this content solely for the purpose of providing
                the Service to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Prohibited Uses</h2>
              <p className="text-muted-foreground">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Upload fraudulent or falsified documents</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                StampScan is provided "as is" without warranties of any kind. We do not guarantee the accuracy
                of travel data extracted from passport images. Users are responsible for verifying all information
                before relying on it for official purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend your account at any time, with or without notice,
                for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material
                changes via email or through the Service. Your continued use of the Service after such modifications
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at support@stampscan.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

