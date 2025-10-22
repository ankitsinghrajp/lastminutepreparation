import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Shield, Lock, Eye, Database, UserCheck, FileText, Mail, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 sm:py-24 max-w-4xl">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold px-4">
            Privacy{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Your privacy is important to us. Learn how we protect your information.
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
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Introduction</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Welcome to our AI-powered study platform. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational services.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Information We Collect</h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                    <p className="leading-relaxed mb-2">
                      When you register, we collect:
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Name and email address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Educational details (class, subjects, school)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Profile preferences and settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Authentication credentials</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-border/50">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Usage Information</h3>
                    <p className="leading-relaxed mb-2">
                      We automatically collect:
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Study patterns and learning progress</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Questions asked to AI chat assistant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>PDFs uploaded (temporarily stored)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Device and browser information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>IP address and location data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                        <span>Usage statistics and patterns</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">How We Use Your Information</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    We use collected information for:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Provide Services:</strong> Deliver AI tutoring and study materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Personalization:</strong> Customize learning experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Improve Platform:</strong> Enhance AI models and features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Communication:</strong> Send updates and content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Security:</strong> Protect against unauthorized access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Analytics:</strong> Understand usage patterns</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Data Security & Storage</h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    We implement industry-standard security measures:
                  </p>
                  <div className="grid gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Lock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        Encryption
                      </h4>
                      <p className="text-xs sm:text-sm">All data is encrypted using SSL/TLS protocols</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Database className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        Secure Storage
                      </h4>
                      <p className="text-xs sm:text-sm">Data stored on secure servers with regular backups</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Shield className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        Access Control
                      </h4>
                      <p className="text-xs sm:text-sm">Only authorized personnel access personal information</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <FileText className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        PDF Processing
                      </h4>
                      <p className="text-xs sm:text-sm">Uploaded PDFs deleted after analysis completes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Rights</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    You have the following rights:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Access:</strong> Request your personal information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Correction:</strong> Fix inaccurate information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Deletion:</strong> Request data removal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Data Portability:</strong> Export your data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Cookies & Tracking</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    We use cookies to enhance your experience:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Essential Cookies:</strong> Required for functionality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Analytics Cookies:</strong> Understand usage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Preference Cookies:</strong> Remember settings</span>
                    </li>
                  </ul>
                  <p className="leading-relaxed pt-1 sm:pt-2">
                    Control cookies through browser settings.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Children's Privacy</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Our platform is designed for students of all ages. For users under 18, we require parental consent. We take special care to protect younger users and comply with child privacy laws. Parents can review or request deletion of their child's information anytime.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Third-Party Services</h2>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    We may use third-party services:
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">AI Services:</strong> OpenAI for AI features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Analytics:</strong> Usage tracking tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Cloud Storage:</strong> Secure data storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Payment Processors:</strong> Subscription handling</span>
                    </li>
                  </ul>
                  <p className="leading-relaxed pt-1 sm:pt-2">
                    These services have their own privacy policies.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 md:p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Changes to This Policy</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the new policy and updating the "Last Updated" date. Please review this policy periodically.
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
                  Questions or concerns about this Privacy Policy? Contact us:
                </p>
                <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <p className="flex items-start sm:items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span className="break-all">Email: <a href="mailto:founder@lastminutepreparation.com" className="text-emerald-400 hover:text-emerald-300 underline">founder@lastminutepreparation.com</a></span>
                  </p>
                  <p className="flex items-start sm:items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span>Data Protection Officer: Available upon request</span>
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong className="text-foreground">Response Time:</strong> We respond to privacy inquiries within 48 hours. For urgent matters, mark your email as "URGENT - Privacy Request"
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center pt-6 sm:pt-8 pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              By using our platform, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}