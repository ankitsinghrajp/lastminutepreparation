import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import FeaturesSection from "@/components/Sections/FeaturesSection";
import { Helmet } from "react-helmet-async";
import SamplesSection from "@/components/Sections/SamplesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Title */}
        <title>
          LastMinutePreparation – CBSE Last Night Before Exam & Topper Style
          Answers
        </title>

        {/* Meta Description */}
        <meta
          name="description"
          content="LastMinutePreparation helps CBSE students revise in the last night before exam. Get topper-style answers, PYQs solved, one-night revision guide, and score up to 90% even with limited preparation time."
        />

        {/* Keywords (safe but powerful) */}
        <meta
          name="keywords"
          content="
          cbse exam preparation
          cbse board exam 2025
          cbse study app
          cbse topper notes
          cbse important questions
          cbse previous year questions
          cbse pyqs
          cbse exam revision
          cbse smart study
          cbse exam guide
          cbse last minute preparation,
          last night before exam cbse,
          cbse topper style answers,
          cbse pyqs solved,
          one night revision guide cbse,
          cbse exam preparation app,
          how to score 90 percent in cbse,
          cbse important questions,
          cbse board exam answers,
          ai cbse preparation,
          chat with pdf cbse,
          cbse smart revision
          lastminutepreparation
          last minute preparation
          last night before exam revision
          one day before exam study
          exam revision in one night
          how to score 90% in cbse
          cbse last minute preparation
          quick revision for cbse exams
          cbse exam emergency study
          study before exam night
          topper style answers cbse
          how to write answers in cbse exam
          cbse 10 marks answer format
          cbse board answer writing
          perfect answers for cbse exams
          cbse exam answer presentation
          cbse full marks answers
          cbse examiner friendly answers
          cbse pyqs class 10
          cbse pyqs class 12
          cbse previous year questions chapter wise
          cbse most important questions
          cbse predicted questions
          cbse expected questions 2025
          cbse board important questions
          cbse exam repeated questions
          cbse frequently asked questions
          "
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://lastminutepreparation.in" />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph (Facebook / WhatsApp / LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="CBSE Last Night Before Exam – Topper Style Answers | LMP"
        />
        <meta
          property="og:description"
          content="Revise CBSE syllabus in one night with topper-style answers, PYQs, and smart AI revision. Built to score more in less time."
        />
        <meta property="og:url" content="https://lastminutepreparation.in/" />
        <meta
          property="og:image"
          content="https://lastminutepreparation.in/og-image.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="CBSE Last-Minute Preparation App | LMP"
        />
        <meta
          name="twitter:description"
          content="Last night before exam? Get topper-style answers, PYQs, and smart CBSE revision to score high even in less time."
        />
        <meta
          name="twitter:image"
          content="https://lastminutepreparation.in/og-image.png"
        />
      </Helmet>
      <Navbar />
      <Hero />
      <SamplesSection/>
      <FeaturesSection />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
