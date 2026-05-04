import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../redux/features/auth/authApi";
import { toast } from "react-toastify";



export default function ForgotPassword(){

 const [email,setEmail] = useState("");
 const [forgotPassword,{isLoading}] = useForgotPasswordMutation();

 
  const handleSubmit = async (e) => {
        e.preventDefault();

        try {
          const res = await forgotPassword({ email }).unwrap();

          toast.success(res.message || "Reset link sent to your email");
         

          setEmail(""); 

          

        } catch (err) {
          toast.error(err?.data?.message || "Unable to send email");
        }
  };

 return(
      <section className="h-screen flex items-center justify-center">
      <div className="max-w-sm border shadow bg-white mx-auto p-8 w-full">

      <h2 className="text-2xl font-semibold pt-5">
      Forgot Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 pt-8">

      <input
      type="email"
      placeholder="Email Address"
      required
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      className="w-full bg-gray-100 px-5 py-3"
      />

      <button
      className="w-full bg-primary text-white py-3 rounded-md"
      >
      {isLoading ? "Sending..." : "Send Reset Link"}
      </button>

      </form>

      <p className="mt-5 text-sm text-center">
      <Link to="/login" className="underline">
      Back to login
      </Link>
      </p>

      </div>
      </section>
 )
}