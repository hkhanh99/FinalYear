import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateCoupon, removeAppliedCoupon } from '../../redux/slices/cartSlice';
import { toast } from 'sonner';

const CouponInput = () => {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const dispatch = useDispatch();

  const {
    coupon,     
    itemsPrice, 
  } = useSelector((state) => state.cart);

  const {
    code: appliedCode, // Mã coupon đang được áp dụng
    discountAmount,
    isValidating,      // Cờ báo đang gọi API
    validationError,   // Lỗi trả về
    validationMessage, // Thông báo thành công trả về
  } = coupon;

 
  useEffect(() => {
    if (validationError) {
      toast.error(validationError, { id: 'coupon-error' });
    }
    if (appliedCode && validationMessage) {
       toast.success(validationMessage, { id: 'coupon-success' });
    }
  }, [validationError, validationMessage, appliedCode]); // Thêm appliedCode vào dependency

  const handleApplyCoupon = (e) => {
    e.preventDefault(); // Ngăn form submit lại trang
    const codeToValidate = couponCodeInput.trim();
    if (!codeToValidate) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return;
    }
    // Dispatch action validateCoupon, gửi mã và tổng tiền hàng hiện tại
    dispatch(validateCoupon({ couponCode: codeToValidate, cartTotal: itemsPrice }));
  };

  const handleRemoveCoupon = () => {
      dispatch(removeAppliedCoupon());
      setCouponCodeInput(''); // Xóa nội dung ô input
      toast.info('Đã gỡ bỏ mã giảm giá.');
  };

  return (
    <div className="my-4 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
      <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700 mb-2">
        Bạn có mã giảm giá?
      </label>
      {appliedCode ? (
           <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
               <div>
                   <p className="text-sm font-medium text-green-800">
                      Coupon code: <span className="font-semibold">{appliedCode}</span>
                   </p>
                   {discountAmount > 0 && (
                        <p className="text-xs text-green-700">
                        Discount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(discountAmount)}
                        </p>
                   )}
               </div>
               <button
                   type="button" // Quan trọng: để không submit form nếu component nằm trong form khác
                   onClick={handleRemoveCoupon}
                   className="ml-4 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                   disabled={isValidating} // Disable khi đang xử lý việc khác
                   aria-label="Remove coupon"
                >
                   Gỡ bỏ
               </button>
           </div>
      ) : (
          <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row sm:space-x-2">
            <input
              type="text"
              id="coupon-code"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              placeholder="Nhập mã tại đây"
              className="flex-grow border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 mb-2 sm:mb-0"
              disabled={isValidating} // Disable khi đang gọi API
              aria-label="Mã giảm giá"
            />
            <button
              type="submit"
              disabled={isValidating} // Disable khi đang gọi API
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Áp dụng'
              )}
            </button>
          </form>
      )}
    </div>
  );
};

export default CouponInput;