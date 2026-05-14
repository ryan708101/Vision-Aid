import React from 'react'
import {Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Diagnose from './pages/Diagnose';
import { Footer } from './components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GameRouter from './pages/GameRouter';
import ExercisePage from './pages/ExercisePage';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import MyProfile from './pages/MyProfile';

const App = () => {
  return (
    <div className='bg-black min-h-screen overflow-x-hidden'>
        <Navbar/>

        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/diagnose' element={ <Diagnose/> }/>
          <Route path='/exercise' element={ <ExercisePage/> }/>
          <Route path="/exercise/:day" element={<GameRouter />} />
          <Route path='/about' element={ <About/> }/>
          <Route path='/contact' element={ <Contact/> } />
          <Route path='/login' element={ <Login/> } />
          <Route path='profile-page' element={ <MyProfile/> } />
        </Routes>


        <ToastContainer />
        <Footer/>
    </div>
  )
}

export default App