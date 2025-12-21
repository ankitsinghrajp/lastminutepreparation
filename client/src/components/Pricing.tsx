import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {server} from "../constants";

const plans = [
  {
    name: "FREE",
    price: "₹0",
    period: "per month",
    description: "Best for exploring LastMinutePreparation",
    features: [
      "20 AI requests per month",
      "Limited access to Last Night Before Exam",
      "Limited AI summaries & questions",
      "Limited PYQs access",
      "Basic response speed",
      "Community support",
      "❌ Diagram & Image Analysis",
      "❌ Chat with PDF",
      "❌ Unlimited AI requests",
      "❌ Custom revision schedules",
      "❌ Priority support",
      "❌ Beta feature access",
      "❌ 24/7 premium support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "BASIC",
    price: "₹299",
    period: "per month",
    description: "Ideal for regular CBSE exam preparation",
    features: [
      "400 AI requests per month",
      "Last Night Before Exam (limited)",
      "AI Topic Summarizer (limited)",
      "Predicted Important Questions (limited)",
      "Quiz, Fill Ups & True/False (limited)",
      "PYQs access (limited)",
      "Diagram & Image Analysis (limited)",
      "Faster response speed",
      "Priority support",
      "❌ Chat with PDF",
      "❌ Unlimited AI requests",
      "❌ Beta feature access",
      "❌ 24/7 premium support",
    ],
    cta: "Upgrade to Basic",
    popular: false,
  },
  {
    name: "PRO",
    price: "₹599",
    period: "per month",
    description: "Unlimited power for serious toppers",
    features: [
      "1000 AI requests",
      "Last Night Before Exam (unlimited)",
      "AI Topic Summarizer (unlimited)",
      "Predicted Important Questions (unlimited)",
      "Quiz, Fill Ups & True/False (unlimited)",
      "PYQs (2014–2025) unlimited access",
      "Diagram & Image Analysis (unlimited)",
      "Chat with PDF (100+ PDFs per month)",
      "Unlimited image uploads",
      "Fastest response speed",
      "Custom revision schedules",
      "Beta feature access",
      "24/7 premium support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
];



export const Pricing = () => {
  const {user} = useSelector((state)=>state.auth);
  
  const navigate = useNavigate();

  const checkoutHandler = async (amount,planType)=>{
    if(!user) navigate("/auth");
    const {data:{data:{key}}} = await axios.get(`${server}/api/v1/payment/get-key`);
    
    const numeric = Number(amount.replace("₹", "").trim());
    
     const {data:{data:{order}}} = await axios.post(`${server}/api/v1/payment/checkout`,{
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
      callback_url: `${server}/api/v1/payment/verify`,
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
