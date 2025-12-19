import { assets } from "@/assets/assets";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import { useEffect } from "react";
import '../index.css'

const content = [
    {
    title: "AI-Based Eye Disease Detection:",
    description:
        "Leveraging advanced CNN and deep learning models, this system analyzes retinal images with exceptional accuracy to detect early signs of eye diseases such as diabetic retinopathy, glaucoma, and macular degeneration. It provides fast, reliable insights to support timely diagnosis and effective clinical intervention.",
    content: (
        <div className="h-full w-full  flex items-center justify-center text-white border-[4px] rounded-3xl overflow-hidden">
        <img
            src={assets.Pronunciation_Analysis}
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="linear board demo" 
        />
        </div>
    ),
    },
  {
    title: "Personalized Lesson Plans:",
    description:
      "Tailored to individual needs, the platform creates dynamic lesson plans that adapt to the user’s progress and goals. These plans ensure a focused approach, addressing specific speech therapy challenges while keeping sessions engaging and effective.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white border-[4px] rounded-3xl overflow-hidden">
        <img
          src={assets.Lesson_Plans}
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
  
           />
      </div>
    ),
  },
  {
    title: "Progress Tracking:",
    description:
      "A comprehensive dashboard tracks user performance over time, offering insights into milestones achieved and areas for growth. This feature empowers users and therapists with data-driven feedback to adjust plans and celebrate improvements.",
    content: (
		<div className="h-full w-full  flex items-center justify-center text-white border-[4px] rounded-3xl overflow-hidden">
			<img
			src={assets.Progress_Tracking}
			width={300}
			height={300}
			className="h-full w-full object-cover"
			alt="linear board demo"
       />
		</div>
    ),
  },
  {
    title: "Gamified Challenges:",
    description:
      "Interactive games and daily challenges transform practice into an enjoyable experience, fostering motivation and consistent engagement. These gamified elements enhance learning retention while making therapy fun and rewarding for users of all ages.",
    content: (
		<div className="h-full w-full  flex items-center justify-center text-white border-[4px] rounded-3xl overflow-hidden">
			<img
			src={assets.Gamified_Challenges}
			width={300}
			height={300}
			className="h-full w-full object-cover"
			alt="linear board demo" 
      />
		</div>
    ),
  },
];


const Features = () => {

  useEffect(() => {
    // Initialize ScrollReveal
    ScrollReveal().reveal('.features-title', {
      duration: 1000,       // Animation duration in milliseconds
      distance: '50px',     // Distance to move element
      origin: 'bottom',     // Animation starts from bottom
      opacity: 0,           // Initial opacity
      easing: 'ease-in-out', // Animation easing
      reset: true
    });
  
    ScrollReveal().reveal('.features-subtitle', {
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
    <div className=' relative mx-auto mt-28 text-white pt-8  flex flex-col items-center z-10 w-full'>
		<div className="flex flex-col items-center">
			<h2 className="font-extrabold text-[64px] features-title"
			style={{
				textShadow: '2px 2px 5px black'
			}}>FEATURES</h2>
			<h3 className="font-medium text-[32px] features-subtitle"
			style={{
				textShadow: '2px 2px 5px black'
			}}>Why Choose Us?</h3>
		</div>
		
		<div className="p-10 w-full">
			<StickyScroll content={content} />
		</div>
    </div>
  )
}

export default Features