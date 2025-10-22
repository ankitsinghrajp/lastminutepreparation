import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
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
    name: "Premium",
    price: "₹299",
    period: "per month",
    description: "Unlimited power for serious students",
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
    cta: "Upgrade to Premium",
    popular: true,
  },
];

export const Pricing = () => {
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
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                  asChild
                >
                  <Link to="/auth">{plan.cta}</Link>
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
