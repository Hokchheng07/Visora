import Hero from "../Hero/Hero";
import PopularTemplates from "../Templates/PopularTemplates";
import WhyChooseVisora from "../Features/WhyChooseVisora";

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
    </>
  );
};

export default Home;
