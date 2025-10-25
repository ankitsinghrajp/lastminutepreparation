import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { FileText, User, CreditCard, Copyright, Upload, AlertTriangle, XCircle, RefreshCw, Mail, Shield } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 sm:py-24 max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold px-4">
            Terms of{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Please read these terms carefully before using our platform.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Last Updated: October 22, 2025</span>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Acceptance of Terms</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Welcome to <strong className="text-foreground">LastMinutePreparation</strong>. By accessing or using our platform, you agree to comply with these Terms of Service and our Privacy Policy. Please read them carefully. If you do not agree with these terms, please do not use our services.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Use of Services</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    By using our platform, you agree to:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Be at least 13 years old to use our services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Use the platform for lawful and educational purposes only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Not misuse, copy, distribute, or reverse-engineer our services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Not engage in any activity that disrupts or interferes with the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Comply with all applicable local, state, national, and international laws</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Accounts</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    Account registration and management:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Users may need to create an account to access certain features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>You are responsible for maintaining the confidentiality of your account credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Keep your account information secure and accurate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Notify us immediately of any unauthorized account activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>You are responsible for all activities under your account</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Payments and Subscriptions</h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    If you subscribe to premium services:
                  </p>
                  <div className="grid gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <CreditCard className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Payment Terms
                      </h4>
                      <p className="text-xs sm:text-sm">You agree to pay all applicable fees for the services you select</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <XCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Refund Policy
                      </h4>
                      <p className="text-xs sm:text-sm">Payments are non-refundable unless otherwise stated in our refund policy</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <RefreshCw className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Pricing Changes
                      </h4>
                      <p className="text-xs sm:text-sm">We reserve the right to modify pricing at any time with notice to users</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <RefreshCw className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Auto-Renewal
                      </h4>
                      <p className="text-xs sm:text-sm">Subscriptions auto-renew unless cancelled before the renewal date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <Copyright className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Intellectual Property</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    All content, features, and technology on LastMinutePreparation are protected:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>All content is owned by us or our licensors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Protected by copyright, trademark, and intellectual property laws</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>You may not reproduce or distribute content without written permission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>The LastMinutePreparation name and logo are our trademarks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">User Content</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    Regarding content you upload to our platform:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>Content must not violate any laws or third-party rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>No hateful, offensive, or inappropriate content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>By uploading, you grant us a license to use it for service functionality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>You retain ownership of your content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span>You are responsible for any content you upload</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Limitation of Liability</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                  LastMinutePreparation is provided "as is" without warranties of any kind. To the maximum extent permitted by law:
                </p>
                <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>We are not liable for any direct, indirect, incidental, or consequential damages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>We do not guarantee uninterrupted or error-free service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Educational content is for informational purposes only</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Termination</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                  We reserve the right to suspend or terminate your account or access under the following circumstances:
                </p>
                <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Violation of these Terms of Service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Fraudulent or harmful activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Extended period of inactivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>At our sole discretion for any reason</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Changes to Terms</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We may update these Terms of Service at any time to reflect changes in our practices or legal requirements. Users will be notified of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated terms. Please review these terms periodically.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Contact Us</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                  If you have questions or concerns regarding these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <p className="flex items-start sm:items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span className="break-all">Email: <a href="mailto:support@lastminutepreparation.com" className="text-emerald-400 hover:text-emerald-300 underline">support@lastminutepreparation.com</a></span>
                  </p>
                  <p className="flex items-start sm:items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span>Legal Team: Available for terms inquiries</span>
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong className="text-foreground">Response Time:</strong> We respond to terms-related inquiries within 72 hours. For urgent legal matters, mark your email as "URGENT - Legal Inquiry"
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center pt-6 sm:pt-8 pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              By using our platform, you acknowledge that you have read, understood, and agreed to these Terms of Service.
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}