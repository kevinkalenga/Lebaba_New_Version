import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from "../utils/baseURL";
import TimelineStep from "./TimelineStep";

const PaymentSuccess = () => {
    const { user, token } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get("session_id");

        if (!sessionId) {
            setError("Invalid payment session.");
            setLoading(false);
            return;
        }

        const confirmPayment = async () => {
            try {
                const response = await fetch(
                    `${getBaseUrl()}/api/orders/confirm-payment`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            session_id: sessionId,
                        }),
                    }
                );

                const data = await response.json();
                console.log(response.status);
                console.log(data);

                if (!response.ok) {
                    throw new Error(data.error || "Payment confirmation failed.");
                }

                setOrder(data.order);

                // retire session_id de l'URL après succès
                window.history.replaceState({}, document.title, "/success");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        confirmPayment();
    }, [user, navigate]);

    const statuses = ["pending", "processing", "shipped", "completed"];


    const isCompleted = (stepStatus) => {
       const currentIndex = statuses.indexOf(order?.status);
       const stepIndex = statuses.indexOf(stepStatus);

       return currentIndex > stepIndex;
    };

    const isCurrent = (stepStatus) => {
        return order?.status === stepStatus;
    };

    // const isCompleted = (status) => {
    //     return statuses.indexOf(order?.status) > statuses.indexOf(status);
    // };

    // const isCurrent = (status) => {
    //     return order?.status === status;
    // };

    const steps = [
        {
            status: "pending",
            label: "Pending",
            description:
                "Your order has been created and is awaiting processing.",
            icon: {
                iconName: "time-line",
                bgColor: "bg-red-500",
                textColor: "text-white",
            },
        },
        {
            status: "processing",
            label: "Processing",
            description: "Your order is currently being processed.",
            icon: {
                iconName: "loader-line",
                bgColor: "bg-yellow-500",
                textColor: "text-white",
            },
        },
        {
            status: "shipped",
            label: "Shipped",
            description: "Your order has been shipped.",
            icon: {
                iconName: "truck-line",
                bgColor: "bg-blue-500",
                textColor: "text-white",
            },
        },
        {
            status: "completed",
            label: "Completed",
            description: "Your order has been successfully completed.",
            icon: {
                iconName: "check-line",
                bgColor: "bg-green-500",
                textColor: "text-white",
            },
        },
    ];

    if (loading) {
        return (
            <section className="section__container p-6 text-center">
                <h2 className="text-xl font-semibold">
                    Confirming payment...
                </h2>
            </section>
        );
    }

    if (error) {
        return (
            <section className="section__container p-6 text-center">
                <h2 className="text-xl font-semibold text-red-500 mb-4">
                    Error
                </h2>
                <p>{error}</p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-6 px-4 py-2 bg-black text-white rounded"
                >
                    Back Home
                </button>
            </section>
        );
    }

    return (
        <section className="section__container rounded p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
                Payment {order?.status === "pending" ? "Pending" : "Successful"}
            </h2>

            <p className="mb-2">
                <strong>Order ID:</strong> {order?._id}
            </p>

            <p className="mb-8 capitalize">
                <strong>Status:</strong> {order?.status}
            </p>

            <ol className="sm:flex items-center relative">
                {steps.map((step, index) => (
                    <TimelineStep
                        key={step.status}
                        step={step}
                        order={order}
                        isCompleted={isCompleted(step.status)}
                        isCurrent={isCurrent(step.status)}
                        isLastStep={index === steps.length - 1}
                        icon={step.icon}
                        description={step.description}
                    />
                ))}
            </ol>

            <div className="mt-10">
                <button
                    onClick={() => navigate("/orders")}
                    className="px-5 py-2 bg-black text-white rounded"
                >
                    View My Orders
                </button>
            </div>
        </section>
    );
};

export default PaymentSuccess;