import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import { clearCart } from '../../redux/features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { getBaseUrl } from '../../utils/baseURL';

const OrderSummary = () => {
     const dispatch = useDispatch();
     const navigate = useNavigate();
     const auth = useSelector(state => state.auth);
     const user = auth?.user;
     const token = auth?.token;
  const products = useSelector((store) => store.cart.products)
 
    const { selectedItems, totalPrice, tax, taxRate, grandTotal } = useSelector((store) => store.cart);
    
    const handleClearCart = () => {
        dispatch(clearCart())
    }


    const makePayment = async (e) => {
           e.stopPropagation();
           if (!user) {
             alert("Please log in to proceed to checkout");
             navigate("/login");
             return;
           }

            try {
             const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PK);

             const body = {
               products: products,
               userId: user._id
             };

             const headers = {
               "Content-Type": "application/json",
               "Authorization":  `Bearer ${token}`// Ajout de token 
             };
             console.log("USER:", user);
             console.log("TOKEN:", token);
             const response = await fetch(`${getBaseUrl()}/api/orders/create-checkout-session`, {
               method: "POST",
               headers,
               body: JSON.stringify(body)
             });

            

              const session = await response.json();

                if (!session.url) {
                  console.error("No session URL:", session);
                  return;
                }

                window.location.href = session.url;

              if (result.error) {
                console.error("Error redirecting to Stripe:", result.error);
              }
            } catch (error) {
              console.error("Payment error:", error);
            }
    }
 
   
     if (!user || !token) {
        return (
          <div className="bg-primary-light mt-5 rounded text-base p-6">
            <p className="text-red-500 font-semibold">
              Please login to continue checkout
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-4 bg-green-600 px-4 py-2 text-white rounded"
            >
              Go to Login
            </button>
          </div>
        );
      }
   
   
    return (
    <div className='bg-primary-light mt-5 rounded text-base'>
            <div className='px-6 py-4 space-y-5'>
                <h2 className='text-xl text-text-dark'>Order Summary</h2>
                <p className='text-text-dark mt-2'>SelectedItems: {selectedItems}</p>
                <p>Total Price: ${totalPrice.toFixed(2)}</p>
                <p>Tax ({taxRate * 100}%): ${tax.toFixed(2)}</p>
                <h3 className='font-bold'>GrandTotal: ${grandTotal.toFixed(2)}</h3>
                <div className='px-4 mb-6'>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleClearCart(); }}
                        className='bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center mb-4'>
                        <span className='mr-2'>Clear cart</span>
                        <i className="ri-delete-bin-7-line"></i>
                    </button>

                    <button
                        onClick={makePayment}
                        className='bg-green-600 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center'>
                        <span className='mr-2'>Proceed Checkout</span>
                        <i className="ri-bank-card-line"></i>
                    </button>
                </div>
            </div>
        </div>
  )
}

export default OrderSummary