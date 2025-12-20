
import { GoogleLogin } from '@react-oauth/google';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch } from "react-redux";
import { userExists } from "@/redux/reducers/auth";
import { useRegisterMutation } from "@/redux/api/api";
import { useAsyncMutation } from "@/hooks/hook";
import { useForm, SubmitHandler } from 'react-hook-form';
import LoginForm from '@/components/specifics/LoginForm';
import logo from "../assets/logo.png";

export default function Auth() {

  const [isRegister, isRegisterLoading] = useAsyncMutation(useRegisterMutation);
 
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



  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegisterSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    
     const res = await isRegister("Setting up your account securely...",{name:data.name, email:data.email, password:data.password});
      console.log("This is from register user: ",res?.data?.data);
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
                <div className="[&>div]:w-full [&_button]:w-full [&_button]:gradient-primary [&_button]:border-0 [&_button]:glow-primary [&_button]:h-11 [&_button]:text-white [&_button]:font-medium [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:shadow-lg">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log("Login Failed")}
                    text="continue_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
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
