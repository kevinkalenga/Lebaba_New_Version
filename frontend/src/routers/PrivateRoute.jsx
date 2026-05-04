import { useSelector } from "react-redux"
import { useLocation, Navigate } from "react-router-dom"


const PrivateRoute = ({children, role}) => {
    const {user} = useSelector((state) => state.auth);
    const location = useLocation();
    if(!user) {
        
        return <Navigate to='/login' state={{from: location}} replace/>
    }

    if(role && user.role !== role) {
       
        return <Navigate to='/' state={{from: location}} replace/>
    }
    
    return children;
}

export default PrivateRoute