import React from 'react'
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className='max-w-[1280px] mx-auto pt-24 overflow-x-hidden px-6'>

      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-300 font-medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12 justify-center max-w-[1000px] mx-auto '>
        <img className='w-full md:max-w-[400px] self-center' src={assets.About} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-400'>
          <p>
            Welcome to <strong>VisionAid</strong> — a purpose-built platform that combines
            state-of-the-art convolutional neural networks (CNNs) with scientifically designed
            visual-cognitive games to detect and support common eye disorders. Our system first
            analyses simple, non-invasive inputs using CNN models to classify conditions such as
            Diabetic Retinopathy, Cataract, and Glaucoma. After detection, VisionAid prescribes
            targeted, evidence-informed games that train the specific visual skills affected by
            each condition.
          </p>

          <b>Our Vision</b>
          <p>
            At VisionAid we believe early detection and consistent, guided practice can greatly
            improve patients' visual function and quality of life. Our mission is to make
            screening and low-cost, home-based visual therapy accessible to everyone. By
            combining reliable AI-based detection with adaptive, engaging exercises, we empower
            users and clinicians with actionable insights and measurable progress—week by week.
          </p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>Why <span>Choose Us</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20 max-w-[1200px] mx-auto text-white'>
            <div className='flex-1 border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary-green hover:text-black transition-all duration-300'>
                <b>EFFICIENCY:</b>
                <p>Fast, CNN-powered screening to identify potential retinal and optical issues and get you started.</p>
            </div>
            <div className='flex-1 border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary-green hover:text-black transition-all duration-300'>
                <b>CONVENIENCE:</b>
                <p>Daily science-backed visual exercises and progress tracking available anytime — designed for clinician review.</p>
            </div>
            <div className='flex-1 border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary-green hover:text-black transition-all duration-300'>
                <b>CUSTOMIZATION:</b>
                <p>After detection, VisionAid assigns disease-specific game sets that adapt in difficulty across weeks.</p>
            </div>
      </div>


    </div>
  )
}

export default About;
