import { useContext, useEffect } from "react";
import { createContext } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { useState } from "react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const Appcontext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [token,setToken] = useState(null)
    const [user,setUser] = useState(null)
    const [isOwner,setIsOwner] = useState(false)
    const [showLogin,setShowLogin] = useState(false)
    const [pickupDate,setPickupDate] = useState(new Date().toISOString().split('T')[0])
    const [returnDate,setReturnDate] = useState(new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0])

    const [cars,setCars] = useState([])

    //function to check if user is logged in
    const fetchUser = async()=>{
        try {
          const {data} = await axios.get('/api/user/data')
          if(data.success){
            setUser(data.user)
            setIsOwner(data.user.role === 'owner')
          }else{
            navigate('/')
          }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Function to fetch all cars from server
    const fetchCars = async() =>{
      try {
        const {data} = await axios.get('/api/user/cars')
        if (data.success) {
          setCars(data.cars)
          console.log('Cars loaded:', data.cars.length, 'cars')
          if (data.cars.length > 0) {
            console.log('First car sample:', data.cars[0])
          }
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    // Function to logout the user 
    const logout = () => {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      setIsOwner(false)
      axios.defaults.headers.common['Authorization']=''
      toast.success('You have been logged out')
    }   

    // useEffect to retrieve the token from LocalStorage 
    useEffect(()=>{
        const token = localStorage.getItem('token')
        console.log('AppContext initialized, fetching cars...')
        setToken(token)
        fetchCars()
    },[])

    // useEffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
          axios.defaults.headers.common['Authorization'] = `${token}`
          fetchUser()
        }
    },[token])
    const value = {
        navigate,currency,axios,user,setUser,token,setToken,isOwner,setIsOwner,fetchUser,showLogin,setShowLogin,logout,fetchCars,cars,setCars,pickupDate,setPickupDate,returnDate,setReturnDate
    }

    return (<Appcontext.Provider value={value}>
        { children }
    </Appcontext.Provider>)
}

export const useAppContext = () => {
    return useContext(Appcontext)
}