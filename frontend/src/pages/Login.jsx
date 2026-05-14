import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios';
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { registerUser, loginUser } from "../redux/userSlice.js";

const Login = () => {

  const [state, setState] = useState('Log in');
  const [email, setEmail] = useState('testuser@gmail.com');
  const [password, setPassword] = useState('qwerty123');
  const [disable, setDisable] = useState(false)
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setDisable(true)

    try {
      if(state === 'Sign Up'){
          dispatch(registerUser({fullName: name, email, password}))
      } else{
            dispatch(loginUser({email, password}))
        }   
    } catch (error) {
      toast.error(error.message);
    } finally{
      setDisable(false)
    }
  }

  useEffect(()=>{
      if(token){
        navigate('/')
      }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center pt-36 pb-8'>
      
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96  border rounded-xl text-zinc-400 text-sm shadow-lg'>
          <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
          <p>Join us today - {state === 'Sign Up' ? 'Sign Up' : 'Login'} now!</p>

          {
            state === 'Sign Up' && 
            <div className='w-full'>
              <p>Full Name</p>
              <input className='border border-zinc-300 rounded w-full p-2 mt-1 text-black' type="text" onChange={(e) => setName(e.target.value)} value={name}  required/>
            </div>
          }

          <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1 text-black' type="email" onChange={(e) => setEmail(e.target.value)} value={email}  required/>
          </div>

          <div className='w-full'>
            <p>Password</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1 text-black' type="password" onChange={(e) => setPassword(e.target.value)} value={password}  required/>
          </div>

          <button type='submit' disabled={disable} className={`bg-primary-green text-black w-full py-2 rounded-md text-base ${disable && 'opacity-50'}`}>{state === 'Sign Up' ? 'Create Account' : 'Login'}</button>
          {
            state === 'Sign Up'
            ? <p>Already have an account? <span onClick={()=>setState('Login')} className='text-primary-green underline cursor-pointer'>Login here</span></p>
            : <p>Create a new account? <span onClick={()=>{setState('Sign Up'); setEmail(''); setPassword('')}} className='text-primary-green underline cursor-pointer'>Click here</span></p>
          }

      </div>
      
    </form>
  )
}

export default Login