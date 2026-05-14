import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='pt-24 px-6'>

        <div className='text-center text-2xl pt-10 text-gray-500'>
          <p>Contact <span className='text-gray-300 font-medium'>US</span></p>
        </div>

        <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
          <img className='w-full md:max-w-[360px]' src={assets.Contact_Image} alt="" />

          <div className='flex flex-col gap-6 justify-center items-start max-md:items-center text-white'>
            <p className='font-semibold text-lg text-gray-400'>OUR OFFICE</p>
            <p>1234 Chamundi Hill Road
            2nd Floor, Heritage Plaza,<br/>
            Lakshmipuram, Mysore, Karnataka, 570004, India.</p>
            <p>Tel: 0821-9876543<br/>
            Email: VisionAid@gmail.com</p>
            <p className='font-semibold text-lg text-gray-400'>CAREERS AT VISIONAID</p>
            <p>Learn more about our teams and job openings.</p>
            <button className='border border-white px-8 py-4 text-sm hover:text-black hover:bg-white transition-all duration-300'>Explore Jobs</button>
          </div>
        </div>

    </div>
  )
}

export default Contact