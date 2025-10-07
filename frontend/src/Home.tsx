import React from 'react';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import ContactSection from './components/ContactSection';

// This page is not being used. We are using Astro for our landing page.
// This example remains here in case you want to leverage
// React purely instead of astro. Although, we recommend using astro
// for better performance and SEO for your marketing landing page/blog.
const Home = () => {
  return (
    <div className="min-h-screen bg-base-100 overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <ContactSection />
    </div>
  );
};

export default Home;