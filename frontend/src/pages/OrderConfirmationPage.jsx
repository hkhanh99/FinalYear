// pages/OrderConfirmationPage.jsx
import React, { useEffect } from 'react'; // Import React nếu chưa có
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom"; // Import Link
// Dùng clearCart hay resetCart tùy thuộc vào cái nào bạn đã export và hoạt động
import { clearCart, resetCart } from "../redux/slices/cartSlice"; // Import cả hai để thử

const OrderConfirmationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Lấy dữ liệu checkout session từ Redux state
    const { checkout } = useSelector((state) => state.checkout);

    // clear cart when order is confirm (Giữ lại logic này theo yêu cầu của bạn)
    useEffect(() => {
        if (checkout && checkout._id) {
            // Thử dùng resetCart trước nếu đã định nghĩa đúng, nếu không thì dùng clearCart
            if (typeof resetCart === 'function') {
                 dispatch(resetCart());
                 console.log("OrderConfirmationPage: Dispatched resetCart");
            } else if (typeof clearCart === 'function') {
                 dispatch(clearCart());
                 console.log("OrderConfirmationPage: Dispatched clearCart because resetCart was not found/imported");
            }
            // Vẫn nên để Redux xử lý việc xóa localStorage thay vì làm thủ công ở đây
            // localStorage.removeItem("cart");
        } else {
            // Nếu không có checkout data, có thể người dùng vào trang trực tiếp
            console.warn("OrderConfirmationPage: No checkout data found, navigating to my-orders.");
            navigate("/my-orders"); // Chuyển về trang đơn hàng
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkout, dispatch, navigate]); // Chỉ chạy khi checkout thay đổi

    // Hàm tính ngày giao dự kiến
    const calculatedEstimateDelivery = (createdAt) => {
         if (!createdAt) return 'N/A';
         const orderDate = new Date(createdAt);
         orderDate.setDate(orderDate.getDate() + 10); // Example +10 days
         // Nên dùng định dạng nhất quán (ví dụ: en-US cho USD)
         return orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
     }

     // Hàm định dạng tiền tệ USD
     const formatCurrency = (value) => {
         if (typeof value !== 'number') return '$0.00';
         return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      };
    if (!checkout) {
         return <div className="text-center p-10">No checkout information available.</div>;
    }

    // --- Render Nội dung chính ---
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md my-10 rounded-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-emerald-700 mb-6">
                 Thank You for Your Order!
             </h1>
             <p className="text-center text-gray-600 mb-8">Your order has been received and is being processed.</p>

            <div className="p-6 rounded-lg border border-gray-200">
                {/* Thông tin Order ID, Date, Delivery */}
                <div className="flex flex-col sm:flex-row justify-between mb-6 pb-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                           {/* ID này là của Checkout Session, không phải Order ID cuối cùng */}
                           Confirmation Ref: #{checkout._id?.slice(-8)}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Order Placed: {checkout.createdAt ? new Date(checkout.createdAt).toLocaleDateString('en-US') : 'N/A'}
                        </p>
                    </div>
                    <div className='mt-2 sm:mt-0 sm:text-right'>
                        <p className="text-emerald-700 text-sm font-medium">
                            Estimated Delivery: {calculatedEstimateDelivery(checkout.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Danh sách sản phẩm (Lấy từ checkoutItem) */}
                <div className="mb-6">
                     <h3 className="text-lg font-semibold mb-3">Items Confirmed</h3>
                     <div className="space-y-3">
                        {checkout.checkoutItem?.map((item) => (
                            <div key={item.productId || item._id} className="flex items-center text-sm"> {/* Nên có key ổn định hơn */}
                                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded mr-3" />
                                <div className="flex-grow">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {/* Vẫn hiển thị size/color nếu có trong checkoutItem */}
                                        {item.color ? `Color: ${item.color}` : ''} {item.size ? `${item.color ? ' | ' : ''}Size: ${item.size}`: ''}
                                    </p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thông tin thanh toán và giao hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-base font-semibold mb-2">Payment</h4>
                        <p className="text-sm text-gray-600">{checkout.paymentMethod || 'N/A'}</p>
                        <p className={`text-sm font-semibold ${checkout.isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                            {checkout.isPaid ? 'Paid' : 'Pending'}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-base font-semibold mb-2">Delivery Address</h4>
                        <p className="text-sm text-gray-600">{checkout.shippingAddress?.address}</p>
                        <p className="text-sm text-gray-600">
                            {checkout.shippingAddress?.city}, {checkout.shippingAddress?.country}
                        </p>
                    </div>
                </div>

                {/* --- Phần Tóm tắt Giá (CHỈ HIỂN THỊ TOTAL TỪ CHECKOUT) --- */}
                <div className="border-t border-gray-200 pt-4">
                     <h4 className="text-base font-semibold mb-3 text-gray-800">Order Total</h4>
                     <div className="space-y-1 text-sm">
                         <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                             <span>Total Paid (Approx.):</span>
                              {/* Hiển thị tổng tiền từ checkout state */}
                             <span>{formatCurrency(checkout.totalPrice)}</span>
                         </div>
                         <p className="text-xs text-gray-500 mt-1">Note: Final discounts may apply. Check your order details for the final amount.</p>
                     </div>
                </div>
                {/* --- Kết thúc Tóm tắt Giá --- */}

                {/* Nút điều hướng */}
                 <div className="mt-8 text-center">
                     {/* Luôn cung cấp link về trang đơn hàng */}
                     <Link
                        to="/my-orders"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded mr-4 transition duration-200"
                     >
                         View My Orders
                     </Link>
                     <Link
                        to="/"
                        className="inline-block text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 transition duration-200"
                     >
                        Continue Shopping
                     </Link>
                 </div>
            </div>
        </div>
    );
}
export default OrderConfirmationPage;