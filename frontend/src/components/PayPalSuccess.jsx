import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from "../utils/baseURL";

const PayPalSuccess = () => {
    const { user, token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const query = new URLSearchParams(window.location.search);

        const orderId = query.get("orderId");
        const paypalId = query.get("paypalId");

        if (!orderId || !paypalId) {
            setError("Invalid PayPal payment.");
            setLoading(false);
            return;
        }

        const capturePayment = async () => {
            try {
                const response = await fetch(
                    `${getBaseUrl()}/api/orders/paypal/capture`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            orderId,
                            paypalId,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "PayPal capture failed");
                }

                window.history.replaceState({}, document.title, "/paypal-success");

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        capturePayment();
    }, [user, navigate, token]);

    if (loading) return <h2>Confirming PayPal payment...</h2>;

    if (error) return <h2 className="text-red-500">{error}</h2>;

    return (
        <div className="p-6">
            <h2 className="text-green-600 text-xl">
                PayPal Payment Successful 🎉
            </h2>
            <button onClick={() => navigate("/orders")}>
                View Orders
            </button>
        </div>
    );
};

export default PayPalSuccess;