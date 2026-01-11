import React, { useState, useEffect } from 'react';
import { Clock, Zap, CheckCircle, Star, ArrowRight, X, Sparkles, Target, BookOpen, Mail } from 'lucide-react';
import {server} from "../constants";
import { useDispatch } from 'react-redux';
import { userExists } from '@/redux/reducers/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from "../assets/logo.png";

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 12, minutes: 34 });
  const [showPopup, setShowPopup] = useState(false);
  const [liveUsers, setLiveUsers] = useState(40000);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { days: prev.days, hours: prev.hours - 1, minutes: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59 };
        return prev;
      });
    }, 60000);

    const popup = setTimeout(() => setShowPopup(true), 8000);
    const users = setInterval(() => setLiveUsers(prev => prev + Math.floor(Math.random() * 300) - 1), 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(popup);
      clearInterval(users);
    };
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${server}/api/v1/user/early-user-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        setTimeout(() => {
          setShowEmailPopup(false);
          setSubmitStatus(null);
        }, 2000);
       const data = await response.json();
        if(data.statusCode === 200){
              dispatch(userExists(data.data));
                  if (window.fbq) {
  window.fbq("track", "CompleteRegistration");
}
        }
         toast.success(data.message || "User Registration Successfull!");
        if(data) navigate('/');

      } else {
        const data = await response.json();
        toast.error("This email is already registered or invalid email" );
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEmailPopup = () => {
    setShowEmailPopup(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white font-sans">
      
      {/* Email Registration Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 relative border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20">
            <button
              onClick={() => setShowEmailPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <img className="w-32" src={logo} alt="" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-2">
                Start Your Free Trial
              </h3>
              <p className="text-gray-400 text-sm">
                Join 21,376+ students preparing for CBSE Boards
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Enter your email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Get Instant Access
                    <ArrowRight size={20} />
                  </span>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
                  <p className="text-green-400 font-semibold">✓ Successfully registered!</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-center">
                  <p className="text-red-400 font-semibold">Something went wrong. Please try again.</p>
                </div>
              )}

              <p className="text-xs text-center text-gray-500">
                ✓ No credit card required  ✓ Cancel anytime
              </p>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-900"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 border-2 border-slate-900"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-slate-900"></div>
                </div>
                <span>Join {liveUsers} students studying now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Urgency Bar */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-3 px-4 text-center font-bold animate-pulse">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Clock className="animate-spin" size={20} />
          <span>BOARD EXAMS IN {timeLeft.days} DAYS! </span>
          <span className="hidden sm:inline">⚡ Limited Spots: Only 47/100 Left Today!</span>
        </div>
      </div>

      {/* Hero Section - Mobile First */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-purple-600/30 border border-purple-500 px-4 py-2 rounded-full text-sm">
            <Sparkles size={16} className="text-yellow-400" />
            <span>AI-Powered CBSE Study Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight">
            Score <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">95%+</span> in CBSE Boards
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-medium">
            Make Your Parents Proud. Fullfill Your Dream.
          </p>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Even if you haven't studied all year, our AI-powered platform turns confusion into clarity in the <span className="text-orange-400 font-bold">final 30 days.</span>
          </p>

          {/* Key Features Highlight - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/50 rounded-xl p-5 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-orange-400" size={28} />
                <h3 className="text-lg font-bold">Extreme High Probability Questions</h3>
              </div>
              <p className="text-sm text-gray-300">AI analyzes <span className="text-orange-400 font-bold">Most repeated questions with answers</span> 95% chance of coming in the exam</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-5 text-left">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-blue-400" size={28} />
                <h3 className="text-lg font-bold">10 Years PYQs</h3>
              </div>
              <p className="text-sm text-gray-300">Complete <span className="text-blue-400 font-bold">2014-2025</span> Previous Year Questions with solutions</p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <div className="flex -space-x-3">
             
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold">
                  T
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold">
                  S
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold">
                  P 
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold">
                  R
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold">
                  A
                </div>
        
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#fbbf24" className="text-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-400">21,376+ students already preparing</p>
            </div>
          </div>

          {/* Live Counter */}
          <div className="flex items-center justify-center gap-2 text-green-400 animate-pulse">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="font-semibold">{liveUsers} students studying right now</span>
          </div>

          {/* Primary CTA - Prominent */}
          <div className="pt-6 pb-4">
            <button 
              onClick={openEmailPopup}
              className="group w-full sm:w-auto relative px-10 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-xl sm:text-2xl shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 hover:scale-105 transform transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Start Free Trial Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
            </button>
          </div>

          <p className="text-sm text-gray-500">
            ✓ No credit card required  ✓ Cancel anytime  ✓ 15-day money-back guarantee
          </p>

          {/* Urgency Box */}
          <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-red-500/50 rounded-2xl p-6 mt-8 animate-pulse">
            <p className="text-xl sm:text-2xl font-black mb-3">⚡ EXAM SEASON OFFER ENDS IN:</p>
            <div className="flex justify-center gap-3 mb-4">
              <div className="bg-slate-900 px-4 py-3 rounded-lg min-w-[70px]">
                <div className="text-3xl font-black text-orange-400"> 0</div>
                <div className="text-xs text-gray-400">DAYS</div>
              </div>
              <div className="bg-slate-900 px-4 py-3 rounded-lg min-w-[70px]">
                <div className="text-3xl font-black text-orange-400">4</div>
                <div className="text-xs text-gray-400">HOURS</div>
              </div>
              <div className="bg-slate-900 px-4 py-3 rounded-lg min-w-[70px]">
                <div className="text-3xl font-black text-orange-400">45</div>
                <div className="text-xs text-gray-400">MINS</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Problem-Agitation Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Do You Feel This <span className="text-red-400">Exam Panic?</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {[
              "😰 Syllabus incomplete, exam in 30 days",
              "📚 Too many chapters, no idea where to start",
              "😵 Diagrams are confusing, can't remember them",
              "🤯 Practiced questions don't appear in exam",
              "😔 Parents expecting 90%+, you're stressed",
              "⏰ Wasted entire year, now desperate"
            ].map((problem, i) => (
              <div key={i} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 hover:bg-red-900/30 transition-all">
                <p className="text-sm sm:text-base">{problem}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4">
              Why Students Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">LastMinutePreparation</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400">Trained on 20 Years of CBSE Board Exam Patterns</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
                {
                icon: <Clock className="text-orange-400" size={40} />,
                title: "Last Night Before Exam",
                desc: "Even if you didn't study, this 30-min revision can get you exam-ready. Promise.",
                badge: "💎 Super Trending"
              },
              {
                icon: <Target className="text-red-400" size={40} />,
                title: "Extreme High Probability Questions",
                desc: "AI analyzes 20 years of CBSE papers and predicts most repeated questions with 95% accuracy.",
                badge: "🔥 GAME CHANGER"
              },
              {
                icon: <BookOpen className="text-blue-400" size={40} />,
                title: "10 Years PYQs (2014-2025)",
                desc: "Complete previous year questions from last decade with step-by-step solutions.",
                badge: "📚 COMPLETE"
              },
              {
                icon: <Zap className="text-yellow-400" size={40} />,
                title: "Diagram & Image Analysis",
                desc: "Upload any diagram, get step-by-step explanation + memory tricks. No more confusion!",
                badge: "⚡ MOST LOVED"
              },
              
              {
                icon: <CheckCircle className="text-green-400" size={40} />,
                title: "Board-Format Answers",
                desc: "Learn how toppers write answers. Get step-by-step solutions in exam format.",
                badge: null
              },
              {
                icon: <Star className="text-purple-400" size={40} />,
                title: "Chat With Your PDFs",
                desc: "Turn your notes into a talking teacher. Ask anything, get instant answers.",
                badge: null
              }
            ].map((feature, i) => (
              <div key={i} className="relative group bg-gradient-to-br from-slate-800 to-slate-900 border border-gray-700 rounded-xl p-5 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                {feature.badge && (
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-pink-600 px-3 py-1 rounded-full text-xs font-bold">
                    {feature.badge}
                  </div>
                )}
                <div className="mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA After Features */}
          <div className="text-center mt-10">
            <button 
              onClick={openEmailPopup}
              className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-xl shadow-2xl hover:scale-105 transform transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                Start Learning Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-10">
          Real Students. Real Results. <span className="text-green-400">Real Happiness.</span>
        </h2>

       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: "Ananya S.",
              class: "Class 12 - CBSE",
              text: "I was struggling with my preparation in January. After using LastMinute consistently for revision, my confidence improved significantly. The structured approach really helped me focus on what mattered most.",
              color: "from-green-600 to-emerald-600",
              badge: "Verified Student"
            },
            {
              name: "Rohan P.",
              class: "Class 12 - Science",
              text: "The question predictions helped me identify important topics I might have missed. Several questions in my exam covered topics the platform highlighted, which gave me an edge in my preparation.",
              color: "from-blue-600 to-cyan-600",
              badge: "Verified Student"
            },
            {
              name: "Priya V.",
              class: "Class 10 - All Subjects",
              text: "Practicing with 10 years of previous papers helped me understand exam patterns better. The Last Night Before Exam feature gave me a clear revision strategy when I needed it most.",
              color: "from-purple-600 to-pink-600",
              badge: "Verified Student"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-slate-900 rounded-xl p-5 border border-gray-700 hover:border-purple-500 transition-all">
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(j => <Star key={j} size={14} fill="#fbbf24" className="text-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-300 mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.class}</p>
                </div>
                <div className={`bg-gradient-to-r ${testimonial.color} px-3 py-1 rounded-full text-xs font-semibold`}>
                  {testimonial.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-purple-900 to-pink-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-5">
            Your Parents Are Waiting.<br/>Make Them <span className="text-yellow-400">Proud</span>.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 max-w-2xl mx-auto">
            30 days is enough. Thousands did it. You can too. Start today.
          </p>
          <button 
            onClick={openEmailPopup}
            className="group w-full sm:w-auto px-10 py-5 sm:px-12 sm:py-6 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-black text-xl sm:text-2xl shadow-2xl hover:scale-105 transform transition-all mb-6"
          >
            <span className="flex items-center justify-center gap-3">
              Start Your Journey Now
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-300 mb-10">
            <span>✓ Join in 30 seconds</span>
            <span>✓ No credit card needed</span>
            <span>✓ Cancel anytime</span>
          </div>

          <div className="pt-6 border-t border-white/20">
            <p className="text-base sm:text-lg text-gray-300 mb-4">🎯 Limited Time: First 100 Students Get</p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur text-sm sm:text-base">
                <p className="text-yellow-400 font-bold">50% OFF Lifetime</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur text-sm sm:text-base">
                <p className="text-green-400 font-bold">Free Study Materials</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur text-sm sm:text-base">
                <p className="text-blue-400 font-bold">Priority Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="bg-slate-950 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-4 text-sm sm:text-base">Trusted by 50,000+ CBSE Students Across India</p>
          <div className="flex justify-center gap-4 sm:gap-8 flex-wrap text-xs sm:text-sm">
            <span>✓ 15-Day Money-Back Guarantee</span>
            <span>✓ Secure Payment</span>
            <span>✓ 24/7 Support</span>
          </div>
          <p className="mt-6 text-xs sm:text-sm">© 2025 LastMinutePreparation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}