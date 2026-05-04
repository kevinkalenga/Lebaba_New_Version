import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../redux/features/auth/authApi";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await resetPassword({ token, password }).unwrap();

      toast.success(res.message || "Password updated");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleReset} className="space-y-4 border p-6 shadow">

        <h2 className="text-xl font-bold">Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="border p-2 w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 w-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;