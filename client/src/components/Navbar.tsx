import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAsyncMutation } from "@/hooks/hook";
import { useLazyResendEmailQuery, useLogoutMutation } from "@/redux/api/api";
import { userNotExists } from "@/redux/reducers/auth";
import { Loader, LogOut, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Navbar = () => {
  const {user} = useSelector((state)=>state.auth);
  const [logout, isLogoutLoading] = useAsyncMutation(useLogoutMutation);
  const dispatch = useDispatch();
  const [trigger, {isLoading}] = useLazyResendEmailQuery();

  const handleLogout = async ()=>{
    await logout();
    dispatch(userNotExists());
  }

  const handleResendEmail = async ()=>{
    const result = await trigger("");
    if(result.data.success){
      toast.success(`Verification link sent to ${user?.email}. Check your email!`);
    }
    else{
      toast.error("Error in sending email! Try login with google.");
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navbar */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-md md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LastMinutePreparation
              </span>
            </Link>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={'destructive'} disabled={isLogoutLoading}>
                      <LogOut className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be logged out of your account and redirected to the home page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleLogout} disabled={isLogoutLoading}>
                        {isLogoutLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader className="animate-spin h-4 w-4"/> Logging out...
                          </span>
                        ) : (
                          "Logout"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button className="gradient-primary border-0" asChild>
                  <Link to="/auth">Start Free</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Banner - Compact Single Line */}
      {user && !user.isVerified && (
        <div className="border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-blue-500/10 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="flex h-10 items-center justify-between gap-2 text-xs sm:text-sm">
              {/* Left: Icon + Message */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-blue-100 truncate">
                  <span className="hidden sm:inline">Email verification pending - </span>
                  <span className="sm:hidden">Verify email - </span>
                  <span className="text-blue-200/80">check your inbox</span>
                </span>
              </div>

              {/* Right: Resend Button */}
              <button 
                onClick={handleResendEmail}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 hover:border-blue-500/50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader className="animate-spin h-3 w-3"/> 
                    <span className="hidden sm:inline">Sending...</span>
                  </span>
                ) : (
                  <span className="whitespace-nowrap">Resend</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};