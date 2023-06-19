import { NextPage } from "next"
import { useEffect } from "react";

const Login: NextPage = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <button
            className="px-7 py-4 text-xl rounded-xl bg-yellow-300 animate-pulse"
            >
            Login using Metamask
            </button>            
        </div>
    )
}

export default Login