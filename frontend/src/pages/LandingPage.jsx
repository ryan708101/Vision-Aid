import React from 'react'
import SnowEffect from '../components/SnowEffect';
import Hero from '../components/Hero';
import { LampContainer } from '@/components/ui/lamp';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';

const LandingPage = () => {
  return (
    <div className='min-h-screen pt-[200px] relative z-10 bg-black' >
        
        <Hero/>
        <LampContainer className='absolute z-0 left-[50%] translate-x-[-50%] '/>
        <Features/>
        <Testimonials/>

        <SnowEffect/>
    </div>
  )
}

export default LandingPage