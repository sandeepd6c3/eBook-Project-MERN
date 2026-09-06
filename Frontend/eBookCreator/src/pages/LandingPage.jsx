import React from "react";
import Nav from "../components/layout/Nav";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import ProductShowcase from "../components/landing/ProductShowcase";
import UseCases from "../components/landing/UseCases";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans transition-colors duration-250 selection:bg-brand-purple selection:text-white">
      <Nav />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Workflow />
        <ProductShowcase />
        <UseCases />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
