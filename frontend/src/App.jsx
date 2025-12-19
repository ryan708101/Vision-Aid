import React from 'react'
import {Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Diagnose from './pages/Diagnose';
import { Footer } from './components/Footer';

const App = () => {
  return (
    <div className='bg-black min-h-screen overflow-x-hidden'>
        <Navbar/>

        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/diagnose' element={ <Diagnose/> }/>
        </Routes>

        <Footer/>
    </div>
  )
}

export default App