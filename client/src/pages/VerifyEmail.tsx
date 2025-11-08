import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Mail, Loader2, Home } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useVerifyEmailQuery } from "@/redux/api/api";
import { useErrors } from "@/hooks/hook";
import { useDispatch } from "react-redux";
import { userExists } from "@/redux/reducers/auth";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const dispatch = useDispatch();
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  // Check if parameters are invalid before making the query
  const shouldSkip = !id || !token;

  const { isLoading, isError, error, data } = useVerifyEmailQuery(
    { token: token || "", id: id || "" },
    { skip: shouldSkip }
  );

  useErrors([{ isError, error }]);
 
  useEffect(()=>{
     if(!isLoading){
    dispatch(userExists(data?.data?.user));
  }
  },[data ,dispatch,isLoading])

useErrors([{ isError, error }]);

  useEffect(() => {
    if (shouldSkip) {
      setMessage("Invalid Verification Link!");
      setStatus("error");
      return;
    }

    if (isLoading) {
      setMessage("Verifying your email...");
      setStatus("loading");
    } else if (isError) {
      setMessage("Verification failed. The link may be expired or invalid.");
      setStatus("error");
    } else if (data) {
      // Handle API response format with success and message
      if (data.success) {
        setMessage(data.message || "Email verified successfully! You can now log in.");
        setStatus("success");
      } else {
        setMessage(data.message || "Verification failed. Please try again.");
        setStatus("error");
      }
    }
  }, [shouldSkip, isLoading, isError, data]);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full gradient-primary mx-auto animate-pulse">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-spin" />
          </div>
        );
      case "success":
        return (
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mx-auto">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
        );
      case "error":
        return (
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 mx-auto">
            <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl">
        <Card className="p-6 sm:p-8 md:p-12 bg-card/50 border-border/50 backdrop-blur-sm text-center">
          <div className="space-y-4 sm:space-y-6">
            {getIcon()}

            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
                {status === "loading" && "Email Verification"}
                {status === "success" && "Verification Successful!"}
                {status === "error" && "Verification Failed"}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg px-2">{message}</p>
            </div>

            {status === "loading" && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground px-2">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-center">Please wait while we verify your email address...</span>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                <div className="p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                    Your account is now active. Start exploring AI-powered learning tools!
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <Button className="gradient-primary border-0 glow-primary w-full h-11 text-base" asChild>
                    <Link to="/auth">Go to Login</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-11 text-base" asChild>
                    <Link to="/">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                    The verification link may have expired or is invalid. Please request a new verification email.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <Button variant="outline" className="w-full h-11 text-base" asChild>
                    <Link to="/">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {status === "success" && (
          <div className="mt-4 sm:mt-6 text-center px-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Thank you for verifying your email. We're excited to have you on board!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;