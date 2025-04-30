import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import PaypalButton from './PaypalButton';
import CouponInput from './CouponInput';
import { createCheckout } from '../../redux/slices/checkoutSlice'; // Assuming action exists
import { resetCart } from '../../redux/slices/cartSlice';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get state from Redux
    const {
        cart: cartData,
        itemsPrice,
        totalPrice, // Final total calculated in Redux
        coupon,
        loading: cartLoading,
        error: cartError
    } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const [checkoutId, setCheckoutId] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({
        firstName: user?.name?.split(' ')[0] || "",
        lastName: user?.name?.split(' ').slice(1).join(' ') || "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (!cartLoading && (!cartData || !cartData.products || cartData.products.length === 0)) {
            toast.error("Your cart is empty.");
            navigate("/");
        }
    }, [cartData, cartLoading, navigate]);

    // Create checkout session
    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        if (cartData && cartData.products.length > 0) {
            setIsProcessing(true);
            try {
                const checkoutPayload = {
                    checkoutItems: cartData.products.map(p => ({
                        productId: p.productId || p.product,
                        name: p.name,
                        quantity: p.quantity || p.qty,
                        image: p.image,
                        price: p.price,
                        size: p.size,
                        color: p.color,
                    })),
                    shippingAddress,
                    paymentMethod: "Paypal",
                    totalPrice: totalPrice // Send final calculated price
                };
                // Log payload before sending
                console.log("--- Sending Checkout Payload ---");
                console.log(JSON.stringify(checkoutPayload, null, 2));

                const res = await dispatch(createCheckout(checkoutPayload)).unwrap();
                if (res && res._id) {
                    setCheckoutId(res._id);
                    toast.success("Checkout session created, please proceed with Paypal payment.");
                } else {
                    toast.error("Could not create checkout session.");
                }
            } catch (error) {
                toast.error(error?.message || "Error creating checkout session.");
                console.error("Create checkout error:", error);
                if (error.errors) { // Log Mongoose validation errors if available
                    console.error("Validation Errors:", error.errors);
                }
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Handle successful Paypal payment
    const handlePaymentSuccess = async (details) => {
        if (!checkoutId) {
            toast.error("Missing checkout session information.");
            return;
        }
        setIsProcessing(true);
        try {
            // 1. Mark checkout as paid
            const payResponse = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
                { paymentStatus: "paid", paymentDetails: details },
                { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
            );

            // 2. If paid successfully, finalize the order
            if (payResponse.status === 200) {
                toast.success("Payment successful!");
                await handleFinalizeCheckout(checkoutId);
            } else {
                toast.error("Could not update payment status.");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Payment processing error:", error);
            toast.error(error.response?.data?.message || "Payment processing failed.");
            setIsProcessing(false);
        }
    };

    // Handle finalizing checkout (creates order)
    const handleFinalizeCheckout = async (id) => {
        // Lấy các state cần thiết từ Redux để truyền đi
        // Đảm bảo bạn đã import useSelector và lấy state cart đúng cách
        const { code: appliedCouponCode, discountAmount: appliedDiscountAmount } = coupon || {};
        console.log("Finalizing checkout with coupon:", appliedCouponCode);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${id}/finalize`,
                { appliedCouponCode: appliedCouponCode || undefined },
                { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
            );

            const finalOrder = response.data; // Đơn hàng cuối cùng từ backend
            console.log("Finalized Order:", finalOrder);
            const orderConfirmationData = {
                orderId: finalOrder?._id,           // ID đơn hàng thực tế
                createdAt: finalOrder?.createdAt,   // Ngày tạo đơn hàng thực tế
                itemsPrice: itemsPrice,             // Giá gốc từ state cart
                discountAmount: appliedDiscountAmount, // Giảm giá từ state cart
                couponCode: appliedCouponCode,       // Mã coupon từ state cart
                totalPrice: totalPrice,             // Tổng cuối cùng từ state cart
                shippingAddress: finalOrder?.shippingAddress // Địa chỉ từ đơn hàng thực tế             
            };
            // dispatch(resetCart());
            console.log("Navigating to /order-confirmation with state:", orderConfirmationData);
            navigate('/order-confirmation', { state: orderConfirmationData });

        } catch (error) {
            console.error("Finalize checkout error:", error);
            toast.error(error.response?.data?.message || "Could not finalize order.");
            setIsProcessing(false);
        }
    };

    // Render Loading/Error/Empty
    if (cartLoading) return <div className="container mx-auto px-4 py-8 text-center">Loading cart...</div>;
    if (cartError) return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {cartError.message || cartError}</div>;
    if (!cartData || !cartData.products || cartData.products.length === 0) {
        return <div className="container mx-auto px-4 py-8 text-center">Your cart is empty.</div>;
    }

    // Render Component JSX
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6">
            {/* Left Column: Info Form / Payment */}
            <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-2xl uppercase mb-6 font-semibold">Shipping Information</h2>
                {!checkoutId ? (
                    <form onSubmit={handleCreateCheckout}>
                        <h3 className="text-lg mb-4 font-medium">Contact Details</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={user?.email || ""} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" disabled readOnly />
                        </div>
                        <h3 className="text-lg mb-4 font-medium mt-6">Shipping Address</h3>
                        {/* Address Inputs */}
                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" value={shippingAddress.firstName} onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" value={shippingAddress.lastName} onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                <input type="text" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                            <input type="text" value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        {/* End Address Inputs */}
                        <div className="mt-6">
                            <button type="submit" disabled={isProcessing} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50">
                                {isProcessing ? 'Processing...' : 'Continue to Payment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Show Paypal button */
                    <div className="mt-6 text-center">
                        <h3 className="text-xl font-semibold mb-4">Pay with Paypal</h3>
                        <p className="text-sm text-gray-600 mb-4">Press the button below to complete your secure payment via Paypal.</p>
                        <PaypalButton
                            amount={totalPrice} // Use final total from Redux
                            onSuccess={handlePaymentSuccess}
                            onError={(err) => {
                                console.error("Paypal Error:", err);
                                toast.error("Paypal payment failed. Please try again.");
                            }}
                            disabled={isProcessing}
                        />
                        {isProcessing && <p className="mt-2 text-sm text-gray-500">Processing order...</p>}
                    </div>
                )}
            </div>

            {/* Right Column: Order Summary + Coupon */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="border-b border-gray-200 pb-4 mb-4 space-y-3">
                    {/* Map through cartData.products */}
                    {cartData.products.map((product) => (
                        <div key={`${product.productId || product.product}-${product.size}-${product.color}`} className="flex items-start justify-between">
                            <div className="flex items-start">
                                <img src={product.image} alt={product.name} className="w-16 h-20 object-cover mr-4 rounded" />
                                <div>
                                    <h4 className="text-sm font-medium">{product.name}</h4>
                                    <p className="text-xs text-gray-500">
                                        {product.color && `Color: ${product.color}`} {product.size && `| Size: ${product.size}`}
                                    </p>
                                    <p className="text-xs text-gray-500">Qty: {product.quantity || product.qty}</p>
                                </div>
                            </div>
                            <p className="text-sm font-medium">{(product.price * (product.quantity || product.qty)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>
                    ))}
                </div>

                {/* --- Price Display Section (Updated for no tax/shipping) --- */}
                <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">{itemsPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    {/* Shipping and Tax lines removed */}
                    {coupon.code && coupon.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount ({coupon.code}):</span>
                            <span className="font-medium">-{coupon.discountAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </div>
                    )}
                </div>

                {/* --- CouponInput Component --- */}
                {!checkoutId && <CouponInput />}

                {/* --- Final Total --- */}
                <div className="border-t border-gray-300 pt-4 mt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                {/* --- End Price Display Section --- */}
            </div>
        </div>
    );
};

export default Checkout;