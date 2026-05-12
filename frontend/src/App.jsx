import React from 'react'
import {Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Diagnose from './pages/Diagnose';
import { Footer } from './components/Footer';
<<<<<<< HEAD
=======
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GameRouter from './pages/GameRouter';
import ExercisePage from './pages/ExercisePage';
>>>>>>> a8d0173 (added feture games)

const App = () => {
  return (
    <div className='bg-black min-h-screen overflow-x-hidden'>
        <Navbar/>

        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/diagnose' element={ <Diagnose/> }/>
<<<<<<< HEAD
        </Routes>

=======
          <Route path='/exercise' element={ <ExercisePage/> }/>
          <Route path="/exercise/:day" element={<GameRouter />} />

        </Routes>


        <ToastContainer />
>>>>>>> a8d0173 (added feture games)
        <Footer/>
    </div>
  )
}

export default App