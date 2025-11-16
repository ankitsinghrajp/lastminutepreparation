import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const plans = [
  {
    name: "FREE",
    price: "₹0",
    period: "forever",
    description: "Perfect for trying out LastMinutePreparation",
    features: [
      "3 uploads per day",
      "Basic AI summaries",
      "5 questions per topic",
      "7-day revision planner",
      "5MB file size limit",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "BASIC",
    price: "₹199",
    period: "per month",
    description: "Great for regular students",
    features: [
      "Unlimited uploads",
      "Advanced AI summaries",
      "Unlimited questions",
      "Personalized revision plans",
      "50MB file size limit",
      "Diagram analysis",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Upgrade to Basic",
    popular: true,
  },
  {
    name: "PRO",
    price: "₹299",
    period: "per month",
    description: "Unlimited power for serious students",
    features: [
      "Everything in Basic",
      "Unlimited image uploads",
      "Unlimited PDF uploads",
      "100MB file size limit",
      "Advanced diagram analysis",
      "Custom revision schedules",
      "24/7 premium support",
      "Beta features access",
    ],
    cta: "Upgrade to Premium",
    popular: false,
  },
];

export const Pricing = () => {
  const {user} = useSelector((state)=>state.auth);
  
  const navigate = useNavigate();

  const checkoutHandler = async (amount,planType)=>{

    const {data:{data:{key}}} = await axios.get("http://localhost:3000/api/v1/payment/get-key");
    if(!user) navigate("/auth");
    const numeric = Number(amount.replace("₹", "").trim());
    
     const {data:{data:{order}}} = await axios.post("http://localhost:3000/api/v1/payment/checkout",{
      amount:numeric,
      planType,
      userId:user._id
     })
    
     const options = {
      key, 
      amount: order.amount, 
      currency: order.currency,
      name: "LastMinutePreparation Premium",
      description: "AI-powered study assistant with unlimited uploads, advanced summaries, diagram analysis, and priority support.",
      image: "https://res.cloudinary.com/dove6tipv/image/upload/v1763279909/logo_wjvuqb.png",
      order_id: order.id, 
      callback_url: "http://localhost:3000/api/v1/payment/verify",
      prefill: {
        name: user.name,
        email: user.email,
       },
      theme: {
        color: "#6626d0"
      }
  };
    
   const razor = new window.Razorpay(options);
   razor.open();

  }

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more power.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 bg-card/50 border-border/50 backdrop-blur-sm relative ${
                plan.popular 
                  ? "border-primary shadow-[0_0_50px_rgba(168,85,247,0.3)]" 
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="gradient-primary px-4 py-1 rounded-full text-sm font-medium text-white">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                
                <Button 
                  className={`w-full h-12 ${
                    plan.popular 
                      ? "gradient-primary border-0 glow-primary" 
                      : "border-primary/30"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={()=>checkoutHandler(plan.price, plan.name)}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3 pt-6 border-t border-border">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
