import { Button } from "@/components/ui/button";
import { userNotExists } from "@/redux/reducers/auth";
import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const {user} = useSelector((state)=>state.auth);
  const dispatch = useDispatch();
  const handleLogout = async ()=>{
        dispatch(userNotExists());
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
     
            <span className="text-md md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LastMinutePreparation
            </span>
          </Link>
          
          <div className="flex items-center space-x-3">
            { user?<Button variant={'destructive'} onClick={handleLogout}>
              <LogOut className="h-4 w-4"/>
            </Button>:
                <Button className="gradient-primary border-0" asChild>
                 <Link to="/auth">Start Free</Link>
               </Button>
            }
          </div>
        </div>
      </div>
    </nav>
  );
};
