import React from "react";
import Nav from "../components/layout/Nav";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import Testimonials from "../components/landing/Testimonials";
import Articles from "../components/landing/Articles";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-blue selection:text-white">
      <Nav />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Workflow />
        <Testimonials />
        <Articles />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
