import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "12th Grade Student",
    content: "StudyGenius helped me score 95% in my boards! The AI summaries and question predictions were spot-on. I saved hours of study time.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Engineering Student",
    content: "The diagram analysis feature is incredible. It converts complex circuit diagrams into easy-to-understand summaries. Game changer!",
    rating: 5,
  },
  {
    name: "Dr. Anita Desai",
    role: "Professor",
    content: "I recommend StudyGenius to all my students. The revision planner ensures they stay on track, and the AI-generated questions are excellent for exam prep.",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    role: "Medical Student",
    content: "Preparing for NEET was overwhelming until I found StudyGenius. The unlimited uploads and advanced summaries in premium are worth every rupee.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Thousands of Students
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what students and educators are saying about StudyGenius.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
