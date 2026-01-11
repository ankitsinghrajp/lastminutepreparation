import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import { Copy, Check, Sparkles, ArrowRight, LogOut, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from "../assets/logo.png";
import { useState } from 'react';
import { useAsyncMutation } from "@/hooks/hook";
import { useLogoutMutation } from "@/redux/api/api";
import { userNotExists } from "@/redux/reducers/auth";
import { useDispatch } from "react-redux";

const PaymentSuccess = () => {
  const searchQuery = useSearchParams()[0];
  const reference = searchQuery.get("reference");
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [logout, isLogoutLoading] = useAsyncMutation(useLogoutMutation);
  const dispatch = useDispatch();

  const handleLogoutAndContinue = async () => {
    await logout();
    dispatch(userNotExists());
    navigate("/");
  };

  const handleCopy = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="relative max-w-2xl w-full p-8 md:p-12 bg-card/50 border-primary/20 backdrop-blur-sm shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Logo and Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img className='h-10 w-10 rounded-lg shadow-md' src={logo} alt="Logo"/>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LastMinutePreparation
          </h2>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your premium subscription is now active. Get ready to supercharge your studies!
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-2">
                Important: Logout & Login Required!
              </h3>
              <p className="text-base leading-relaxed">
                To access your premium features, please <strong>logout and login again</strong>. This will activate your subscription and unlock all premium content.
              </p>
            </div>
          </div>
        </div>

        {/* Reference ID */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Transaction Reference</p>
              <p className="text-lg font-mono font-semibold truncate">
                {reference || "N/A"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0 border-primary/30 hover:bg-primary/10"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>


        {/* CTA Button */}
        <Button
          onClick={handleLogoutAndContinue}
          disabled={isLogoutLoading}
          className="w-full h-12 gradient-primary border-0 text-lg font-semibold group"
        >
          {isLogoutLoading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-5 w-5" />
              Logout & Continue
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

      </Card>
    </div>
  );
};

export default PaymentSuccess;