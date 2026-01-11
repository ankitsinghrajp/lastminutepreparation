import { GoogleLogin } from '@react-oauth/google';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, MoreVertical, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch } from "react-redux";
import { userExists } from "@/redux/reducers/auth";
import { useRegisterMutation } from "@/redux/api/api";
import { useAsyncMutation } from "@/hooks/hook";
import { useForm, SubmitHandler } from 'react-hook-form';
import LoginForm from '@/components/specifics/LoginForm';
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";

export default function Auth() {

  const [isRegister, isRegisterLoading] = useAsyncMutation(useRegisterMutation);
  const [isInstagram, setIsInstagram] = useState(false);
 
  type RegisterInputs = {
      name:string,
      email:string,
      password:string
  }

   const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>()

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isInstagramBrowser = userAgent.includes('Instagram');
    setIsInstagram(isInstagramBrowser);
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegisterSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    
     const res = await isRegister("Setting up your account securely...",{name:data.name, email:data.email, password:data.password});
      console.log("This is from register user: ",res);
      if(res?.data){
        dispatch(userExists(res?.data?.data));
      }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    const res = await fetch("http://localhost:3000/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials :"include",
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if(data) navigate('/');
    dispatch(userExists(data.user));
    if (window.fbq) {
  window.fbq("track", "CompleteRegistration");
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4 mt-4">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                <img className='w-20' src={logo} alt="" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LastMinutePreparation
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your learning journey</p>
          </div>

          {/* Instagram Browser Alert */}
          {isInstagram && (
            <div className="mb-6 rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/10 backdrop-blur-sm p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-orange-100 text-sm">For better sign-in experience</h3>
                  <div className="text-xs text-orange-200/90 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium">1.</span> Tap the <MoreVertical className="h-3 w-3 inline mx-0.5" /> menu icon (top right)
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium">2.</span> Select <span className="font-semibold text-orange-100">"Open in Chrome"</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-medium">3.</span> Sign in with Google seamlessly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Card className="p-8 bg-card/50 border-border/50 backdrop-blur-sm">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
              <LoginForm/>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="your name"
                      {...register("name",{required:{value:true, message:"Full Name is required!"}})}
                      className="bg-background/50"
                    />
                    {errors?.name && <span className='py-4 px-1 text-xs text-red-500'>*{errors?.name?.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email",{required:{value:true,message:"Email is required!"}})}
                      className="bg-background/50"
                    />
                    {errors?.email && <span className='py-4 px-1 text-xs text-red-500'>*{errors?.email?.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password",{required:{value:true, message:"Password is required!"}})}
                      className="bg-background/50"
                    />
                    {errors?.password && <span className='py-4 px-1 text-xs text-red-500'>*{errors?.password?.message}</span>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary border-0 glow-primary"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

           <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 relative">
              
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg">
                  Recommended ⭐
                </div>
                <div className="hidden">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log("Login Failed")}
                    useOneTap={false}
                  />
                </div>
                <Button
                  onClick={() => {
                    const googleButton = document.querySelector('[role="button"][aria-labelledby]');
                    if (googleButton) {
                      googleButton.click();
                    }
                  }}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 h-11 text-gray-700 font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}