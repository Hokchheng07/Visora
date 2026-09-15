import Hero from "../Hero/Hero";
import PopularTemplates from "../LandingPageComponents/Templates/PopularTemplates";
import WhyChooseVisora from "../LandingPageComponents/Features/WhyChooseVisora";
import CreateWithoutLimits from "../LandingPageComponents/Features/CreateWithoutLimits";
import HowItWorks from "../LandingPageComponents/Features/HowItWorks";
import KhmerDesignShowcase from "../LandingPageComponents/Features/KhmerDesignShowcase";
import ExploreByEvents from "../LandingPageComponents/Features/ExploreByEvents";

// Home page composition: each section of the landing page gets its own
// folder under Components (Hero, and later Features/Templates/etc.),
// same pattern as Nav and Footer. Home just stacks them in order —
// Navbar and Footer stay in App.jsx as the persistent page chrome.
const Home = () => {
  return (
    <>
      <Hero />
      <PopularTemplates />
      <WhyChooseVisora />
      <CreateWithoutLimits />
      <KhmerDesignShowcase />
      <HowItWorks />
      <ExploreByEvents />
    </>
  );
};

export default Home;
