import React from 'react'
import { ShineBorder } from './magicui/shine-border'
import { assets } from '@/assets/assets'
import '../index.css'
import Hero_Profiles from './Hero_Profiles'



const Hero = () => {
  return (
	<div className="hero relative z-10 w-fit p-3 max-w-[1280px] overflow-hidden rounded-xl mx-auto bg-gradient-hero-bg ">

		<img
			className="absolute top-2 w-full rounded-3xl h-[98%] opacity-20"
			src={assets.HeroBGOverlay}
			alt=""
		/>
		<ShineBorder shineColor={["#009f4d", "#62e9a3", "#f1ff82"]} borderWidth={5}/>
		

		<div className="z-10 relative px-4 py-2 min-w-full flex flex-col max-900px:items-center">
                <span
                    className="text-[68px] font-extrabold max-900px:text-[40px] max-900px:text-center max-600px:leading-10"
                    style={{
                        backgroundImage: 'linear-gradient(-17deg, #00C851 0%, #5BDF7A 55%, #D9FF8F 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Empowering Vision,
                </span>

                <div className="flex max-900px:flex-col max-900px:gap-11">
                    <div className="flex-1 flex flex-col items-start max-900px:items-center">
                        <h2
                            className="font-extrabold text-4xl min-h-[45px] relative -translate-y-5 max-600px:translate-y-0 max-600px:text-center"
                            style={{
                                backgroundImage: 'linear-gradient(180deg, #FFFFFF 55%, #747474 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            Transforming Lives!
                        </h2>
                        <Hero_Profiles className='relative z-10' />
                        <div className="flex justify-start gap-4 w-full pr-8 max-900px:justify-center max-900px:pr-0">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 text-xl bg-primary-green text-black px-4 py-2 border-2 rounded-full hover:scale-105 transition-all duration-1000 group"
                            >
                                Login
                                <img
                                    src={assets.rightArrow}
                                    className="w-0 group-hover:w-7 transition-all duration-500"
                                />
                            </button>
                            <button
                                onClick={() => navigate('/diagnose')}
                                className="flex items-center gap-2 text-xl bg-primary-green text-black px-4 py-2 border-2 rounded-full hover:scale-105 transition-all duration-500 group"
                            >
                                Diagnose
                                <img
                                    src={assets.rightArrow}
                                    className="w-0 group-hover:w-7 transition-all duration-500"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center">


                        {/** Video Component */}
                        <video
                            autoPlay
                            loop
                            muted
                            src={assets.HeroVid}
                            className={`rounded-xl border-4 max-w-[500px] max-900px:w-[90%] transition-opacity duration-500 block`}
                            
                        ></video>
                    </div>
                </div>
            </div>

	</div>
  )
}

export default Hero