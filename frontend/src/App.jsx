import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";



function App() {
  

    return (
        <>
            <ToastContainer />
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
}

export default App;