import React from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import googleLogo from '../assets/googleLogo.png'

const GoogleLoginButton = () => {

    const { backendUrl } = useContext(AppContext)
    const url = backendUrl + "/api/auth/google";

  return (
    <a
      href={url}
      className="w-full inline-flex items-center justify-center py-2.5 rounded-full border hover:bg-gray-100 transition"
    >
      <img src={googleLogo} alt="Google" className="w-6 h-6 mr-3" />
      Continue with Google
    </a>
  )
}

export default GoogleLoginButton