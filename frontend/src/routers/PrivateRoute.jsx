import { useSelector } from "react-redux"
import { useLocation, Navigate } from "react-router-dom"
import {toast} from 'react-toastify'

const PrivateRoute = ({children, role}) => {
    const {user} = useSelector((state) => state.auth);
    const location = useLocation();
    if(!user) {
        // Not logged in
        toast.error("You must be logged in!")
        return <Navigate to='/login' state={{from: location}} replace/>
    }

    if(role && user.role !== role) {
        toast.error("You are not authorized to access this page!")
        return <Navigate to='/' state={{from: location}} replace/>
    }
    
    return children;
}

export default PrivateRoute