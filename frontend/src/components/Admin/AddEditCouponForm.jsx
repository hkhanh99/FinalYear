// src/components/Admin/AddEditCouponForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const AddEditCouponForm = ({ initialData, onSubmit, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage', // Mặc định
        discountValue: 0,
        expiryDate: '',
        minPurchaseAmount: 0,
        maxUsageLimit: null, // null = không giới hạn
        isActive: true,
        // Thêm các trường khác nếu cần
    });

    const isEditing = !!initialData; // Cờ xác định là thêm hay sửa

    useEffect(() => {
        if (isEditing && initialData) {
            // Nếu là sửa, điền dữ liệu vào form
            setFormData({
                code: initialData.code || '',
                description: initialData.description || '',
                discountType: initialData.discountType || 'percentage',
                discountValue: initialData.discountValue || 0,
                // Format lại ngày tháng cho input type="date" hoặc "datetime-local"
                expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().slice(0, 16) : '',
                minPurchaseAmount: initialData.minPurchaseAmount || 0,
                maxUsageLimit: initialData.maxUsageLimit === null ? '' : initialData.maxUsageLimit, // Hiển thị '' nếu là null
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
            });
        } else {
             // Nếu là thêm, reset form
             setFormData({
                code: '', description: '', discountType: 'percentage', discountValue: 0,
                expiryDate: '', minPurchaseAmount: 0, maxUsageLimit: null, isActive: true,
            });
        }
    }, [initialData, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

     const handleNumberChange = (e) => {
        const { name, value } = e.target;
        // Xử lý giá trị null cho maxUsageLimit
        if (name === 'maxUsageLimit' && value === '') {
             setFormData(prev => ({ ...prev, maxUsageLimit: null }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value) // Chuyển thành số hoặc giữ chuỗi rỗng
            }));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate cơ bản
        if (!formData.code || !formData.discountType || formData.discountValue <= 0 || !formData.expiryDate) {
            toast.error("Please fill in all required fields (Code, Type, Value > 0, Expiry Date).");
            return;
        }

         // Chuyển đổi maxUsageLimit về null nếu là chuỗi rỗng
         const dataToSubmit = {
            ...formData,
            maxUsageLimit: formData.maxUsageLimit === '' || formData.maxUsageLimit === null ? null : Number(formData.maxUsageLimit),
            discountValue: Number(formData.discountValue), // Đảm bảo là số
            minPurchaseAmount: Number(formData.minPurchaseAmount) // Đảm bảo là số
        };


        onSubmit(dataToSubmit); // Gọi hàm submit được truyền từ component cha
    };

    return (
        // Nên đặt form này trong một component Modal
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
             <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Coupon' : 'Add New Coupon'}</h2>

             <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Coupon Code <span className='text-red-500'>*</span></label>
                <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="2"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">Discount Type <span className='text-red-500'>*</span></label>
                    <select name="discountType" id="discountType" value={formData.discountType} onChange={handleChange} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed_amount">Fixed Amount</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Discount Value <span className='text-red-500'>*</span></label>
                    <input type="number" name="discountValue" id="discountValue" value={formData.discountValue} onChange={handleNumberChange} required min="0.01" step="any"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
             </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date <span className='text-red-500'>*</span></label>
                    {/* Dùng datetime-local để chọn cả ngày và giờ */}
                    <input type="datetime-local" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange} required
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="minPurchaseAmount" className="block text-sm font-medium text-gray-700">Min Purchase Amount</label>
                    <input type="number" name="minPurchaseAmount" id="minPurchaseAmount" value={formData.minPurchaseAmount} onChange={handleNumberChange} min="0" step="any"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="maxUsageLimit" className="block text-sm font-medium text-gray-700">Max Usage Limit (leave blank for unlimited)</label>
                    <input type="number" name="maxUsageLimit" id="maxUsageLimit" value={formData.maxUsageLimit ?? ''} onChange={handleNumberChange} min="1" step="1" placeholder="Unlimited"
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                 <div className="flex items-center pt-6">
                     <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                     <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-900">Is Active?</label>
                 </div>
             </div>


            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Coupon' : 'Create Coupon')}
                </button>
            </div>
        </form>
    );
};

export default AddEditCouponForm;