import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets.js';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const Navbar = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showModal, setShowModal] = useState(false)
  const [token, setToken] = useState(true);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const navbarClasses = `fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-transform duration-300 ${
    isVisible ? 'translate-y-0' : '-translate-y-full'
  }`;



    return (
        <div
        className={`${navbarClasses} flex justify-between items-center w-[90%] px-4 text-white max-w-[1280px] border border-t-0 p-4 rounded-xl backdrop-blur-[10px] bg-black/50 max-md:p-2`}
        >
        <div
            onClick={() => navigate('/')}
            className="rounded-full overflow-hidden inline-block border-white border"
        >
            <img onClick={()=>navigate('/')} src={assets.Logo} className="h-[80px] w-[80px] object-cover scale-75 inline max-900px:h-[50px] max-md:h-[30px]" />
        </div>

        <div className="flex gap-4 border border-white px-4 py-3 rounded-full text-xl max-900px:text-lg max-md:hidden">
            <NavLink
            className={({ isActive }) =>
                `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                isActive ? 'border-white border' : ''
                }`
            }
            to="/"
            >
            Home
            </NavLink>
            <NavLink
            className={({ isActive }) =>
                `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                isActive ? 'border-white border' : ''
                }`
            }
            to="/diagnose"
            >
            Diagnose
            </NavLink>
            <NavLink
            className={({ isActive }) =>
                `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                isActive ? 'border-white border' : ''
                }`
            }
            to="/exercise"
            >
            Lessons
            </NavLink>
            <NavLink
            className={({ isActive }) =>
                `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                isActive ? 'border-white border' : ''
                }`
            }
            to="/about"
            >
            About
            </NavLink>
            <NavLink
            className={({ isActive }) =>
                `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                isActive ? 'border-white border' : ''
                }`
            }
            to="/contact"
            >
            Contact
            </NavLink>
        </div>

        {
            token ?
            <div>
            <img src={user.photo} onClick={()=>navigate('/profile-page')} className='h-20 w-20 object-cover rounded-full max-900px:h-14 max-900px:w-14 max-md:hidden' />
            </div>:
            <NavLink to="/login" className="text-xl bg-primary-green px-4 py-2 border-2 rounded-full hover:scale-105 transition-all text-black duration-500 max-md:hidden">
            Login
            </NavLink>
        }
        
        <img src={assets.hamburger} onClick={()=>setShowModal(true)} className='md:hidden w-8' />

        {
            showModal &&
            <div className={`md:hidden bg-black fixed left-0 h-min py-10 w-full flex flex-col gap-4 items-center border-white border ${showModal ? 'top-0' : 'top-[-10]'}`}>
            {token && <img src={user.photo} className='w-14 object-cover rounded-full h-14' onClick={()=>{navigate('/profile-page'); setShowModal(false)}} />}
            {!token && <div onClick={()=>{navigate('/login'); setShowModal(false)}} className='bg-primary-green text-white px-4 py-2 rounded-full'>Login</div>}
            <div className="flex flex-col items-center">
                <NavLink onClick={()=>setShowModal(false)}
                className={({ isActive }) =>
                    `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                    isActive ? 'border-white border' : ''
                    }`
                }
                to="/"
                >
                Home
                </NavLink>
                <NavLink onClick={()=>setShowModal(false)}
                className={({ isActive }) =>
                    `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                    isActive ? 'border-white border' : ''
                    }`
                }
                to="/diagnose"
                >
                Diagnose
                </NavLink>
                <NavLink onClick={()=>setShowModal(false)}
                className={({ isActive }) =>
                    `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                    isActive ? 'border-white border' : ''
                    }`
                }
                to="/exercise"
                >
                Lessons
                </NavLink>
                <NavLink onClick={()=>setShowModal(false)}
                className={({ isActive }) =>
                    `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                    isActive ? 'border-white border' : ''
                    }`
                }
                to="/about"
                >
                About
                </NavLink>
                <NavLink onClick={()=>setShowModal(false)}
                className={({ isActive }) =>
                    `py-1 px-2 rounded-full hover:text-primary-green transition-all ${
                    isActive ? 'border-white border' : ''
                    }`
                }
                to="/contact"
                >
                Contact
                </NavLink>
            </div>

            <img src={assets.closeIcon} onClick={()=>setShowModal(false)} className='absolute top-2 right-2 w-10' />
            </div>
        }
        
        </div>
    );


};

export default Navbar;