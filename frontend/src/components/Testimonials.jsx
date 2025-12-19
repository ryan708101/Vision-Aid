import React, { useEffect } from 'react'
import { InfiniteMovingCards } from './ui/infinte-moving-cards.jsx'
import { assets } from '@/assets/assets.js';

const testimonials = [
  {
    desc: "This platform analyzes retinal images using advanced CNN models, providing early eye disease detection with impressive accuracy that helps me monitor my vision reliably.",
    name: "John Doe",
    image: assets.person1
  },
  {
    desc: "The AI system detected early retinal changes using deep learning, giving me confidence in managing my eye health through timely and accurate automated analysis reports.",
    name: "Jane Smith",
    image: assets.person2
  },
  {
    desc: "I appreciate how precisely the CNN model examines my scans, offering early disease indicators and clear explanations that support better decisions for my eye care.",
    name: "Emily Johnson",
    image: assets.person3
  },
  {
    desc: "This tool helps detect retinal abnormalities early using deep learning, giving my family reliable insights while making complex medical predictions simple and easy to understand.",
    name: "Michael Brown",
    image: assets.person4
  },
  {
    desc: "The platform’s AI-driven eye screening uses CNN models to identify risks early, providing accurate reports and continuous monitoring that significantly improves long-term vision care.",
    name: "Sophia Wilson",
    image: assets.person5
  }
];

  

const Testimonials = () => {

  useEffect(() => {
    // Initialize ScrollReveal
    ScrollReveal().reveal('.testimonials-title', {
      duration: 1000,       // Animation duration in milliseconds
      distance: '50px',     // Distance to move element
      origin: 'bottom',     // Animation starts from bottom
      opacity: 0,           // Initial opacity
      easing: 'ease-in-out', // Animation easing
      reset: true
    });
  
    ScrollReveal().reveal('.testimonials-subtitle', {
      duration: 1000,
      delay: 200,           // Add delay to start after the title animation
      distance: '30px',
      origin: 'bottom',
      opacity: 0,
      easing: 'ease-in-out',
      reset: true
    });
  
  }, []);

  return (
    <div className=' relative max-w-[1280px] mx-auto mt-28 text-white pt-8  flex flex-col gap-8 items-center z-10 mb-24 max-600px:mt-0 max-600px:pt-0'>
        <div className="flex flex-col items-center">
            <h2 className="font-extrabold text-[64px]  testimonials-title max-600px:text-[36px]"
            style={{
                textShadow: '2px 2px 5px black'
            }}>TESTIMONIALS</h2>
            <h3 className="font-medium text-[32px] relative top-[-10px] testimonials-subtitle max-600px:text-[20px]"
            style={{
                textShadow: '2px 2px 5px black'
            }}>Hear Our Success Stories!</h3>
        </div>

        <div>
            <InfiniteMovingCards
                items={testimonials}
                direction="right"
                speed="slow"
            />
        </div>
        
    </div>
  )
}

export default Testimonials



