import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
const testimonials = [
  {
    role: "Early beta user",
    content: "Chat with PDF helped me understand long notes without reading every page.",
    rating: 5,
  },
  {
    role: "CBSE student",
    content: "Last Night Before Exam feature is perfect when you start studying very late.",
    rating: 5,
  },
  {
    role: "Class 12 student",
    content: "PYQs are explained in a way that actually matches board exam answers.",
    rating: 5,
  },
  {
    role: "Early user",
    content: "Asking questions directly from my PDF saved a lot of revision time.",
    rating: 5,
  },
  {
    role: "Science stream student",
    content: "The predicted questions section feels very accurate for exams.",
    rating: 5,
  },
  {
    role: "Early tester",
    content: "Diagrams and images are explained clearly, which helps in last-minute revision.",
    rating: 5,
  },
  {
    role: "Beta user",
    content: "Chat with PDF is useful for quickly finding answers from study material.",
    rating: 5,
  },
  {
    role: "CBSE aspirant",
    content: "Last Night Before Exam organizes everything so I don't feel confused.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-bold">
            Early{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              User Feedback
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real experiences from students who tried LastMinutePreparation during early access.
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
                  <p className="text-sm text-muted-foreground">— {testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};