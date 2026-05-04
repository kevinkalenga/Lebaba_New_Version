import {createBrowserRouter} from "react-router-dom"
import App from '../App';
import Home from "../pages/home/Home";
import CategoryPage from "../pages/category/CategoryPage";
import Search from "../pages/search/Search";
import ShopPage from '../pages/shop/ShopPage';
import SingleProduct from '../pages/shop/productDetails/SingleProduct';
import Login from '../components/Login';
import Register from '../components/Register';
import PaymentSuccess from "../components/PaymentSuccess";
import PayPalSuccess from "../components/PayPalSuccess";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
import UserDMain from "../pages/dashboard/user/dashboard/UserDMain";
import UserOrders from "../pages/dashboard/user/UserOrders";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            { path: "/categories/:categoryName", element: <CategoryPage /> },
            { path: "/search", element: <Search /> },
            { path: "/shop", element: <ShopPage /> },
            { path: "/shop/:id", element: <SingleProduct /> },
            {
                path: "/success",
                element: <PaymentSuccess />
            },
            {
                path: "/paypal-success",
                element: <PayPalSuccess />
            }
           
        ]
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },

    {
      path: "/forgot-password",
      element: <ForgotPassword />
    },
    {
     path: "/reset-password/:token",
     element: <ResetPassword />
    },

     // dashboard routes 
    {
        path: "/dashboard",
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
        children: [
            // User Routes 
            {path: '', element: <UserDMain /> },
            {path: 'orders', element: <UserOrders/> },
            {path: 'payments', element: <div>User Payments</div>},
            {path: 'profile', element: <div>User Profile</div>},
            {path: 'reviews', element: <div>User Reviews</div>},

             // admin routes and include role field
             {
                path: 'admin', 
                element: <PrivateRoute role="admin"><div>Admin Main</div></PrivateRoute> 
             },
             {
                path: 'add-product', 
                element: <PrivateRoute role="admin"><div>New Post</div></PrivateRoute> 
             },
             {
                path: 'manage-products', 
                element: <PrivateRoute role="admin"><div>Manage Post</div></PrivateRoute> 
             },
             {
                path: 'update-product/:id', 
                element: <PrivateRoute role="admin"><div>Update Post</div></PrivateRoute> 
             },
             {
                path: 'users', 
                element: <PrivateRoute role="admin"><div>All Users</div></PrivateRoute> 
             },
             {
                path: 'manage-orders', 
                element: <PrivateRoute role="admin"><div>Manage Order</div></PrivateRoute>
             },
        ]
     }
])

export default router;