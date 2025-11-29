import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(false)

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success) {
                setIsLoggedin(true)
                getUserData()
            }else {
                setIsLoggedin(false);
            }
        } catch (error) {
            setIsLoggedin(false);
        }
    }

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data')
            // if(data.success) {
            //     setUserData(data.userData)
            //     setIsLoggedin(true)
            // } else {
            //     setIsLoggedin(false)
            //     toast.error(data.message)
            // }
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    };
    // useEffect(() => {
    //     getUserData();
    // }, []);
    useEffect(() => {
      getAuthState()
    }, [])
    

    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}