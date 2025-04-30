// src/pages/AdminCouponListPage.jsx (hoặc vị trí tương ứng)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAdminCoupons,
    deleteAdminCoupon,
    createAdminCoupon,
    updateAdminCoupon,
    fetchAdminCouponDetails, 
    clearCurrentCoupon 
} from '../../redux/slices/adminCouponSlice'; // Đảm bảo đúng đường dẫn
import AddEditCouponForm from '../../components/Admin/AddEditCouponForm'; // Import form
import { toast } from 'sonner';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {children}
                </div>
                 <button onClick={onClose} className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
            </div>
        </div>
    );
};
// ------------------------------------

const AdminCouponListPage = () => {
    const dispatch = useDispatch();
    const { coupons, status, error, currentCoupon, detailStatus } = useSelector((state) => state.adminCoupons);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' hoặc 'edit'
    const [editingCouponId, setEditingCouponId] = useState(null); // Lưu ID coupon đang sửa

    useEffect(() => {
        dispatch(fetchAdminCoupons());
    }, [dispatch]);

     useEffect(() => {
        if (modalType === 'edit' && detailStatus === 'succeeded' && currentCoupon) {
             setIsModalOpen(true); // Mở modal khi có data
        }
        // Xử lý lỗi fetch details
        if (detailStatus === 'failed') {
             toast.error("Failed to fetch coupon details.");
             handleCloseModal(); // Đóng modal nếu fetch lỗi
        }
    }, [detailStatus, currentCoupon, modalType]);


    const handleAddClick = () => {
        dispatch(clearCurrentCoupon()); // Xóa data cũ nếu có
        setModalType('add');
        setEditingCouponId(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (coupon) => {
        setModalType('edit');
        setEditingCouponId(coupon._id);
        // Fetch dữ liệu mới nhất trước khi mở modal sửa
        // Modal sẽ tự mở trong useEffect khi fetch xong
        dispatch(fetchAdminCouponDetails(coupon._id));
    };

     const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            dispatch(deleteAdminCoupon(id))
                .unwrap() // unwrap để dùng .then/.catch hoặc bắt lỗi nếu cần
                .then(() => toast.success('Coupon deleted successfully'))
                .catch((err) => toast.error(err || 'Failed to delete coupon'));
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCouponId(null);
        dispatch(clearCurrentCoupon()); // Reset currentCoupon trong state
    };

    const handleFormSubmit = (formData) => {
        if (modalType === 'add') {
            dispatch(createAdminCoupon(formData))
                .unwrap()
                .then(() => {
                    toast.success('Coupon created successfully!');
                    handleCloseModal();
                })
                .catch((err) => toast.error(err || 'Failed to create coupon'));
        } else if (modalType === 'edit' && editingCouponId) {
             dispatch(updateAdminCoupon({ id: editingCouponId, ...formData }))
                .unwrap()
                .then(() => {
                    toast.success('Coupon updated successfully!');
                    handleCloseModal();
                })
                .catch((err) => toast.error(err || 'Failed to update coupon'));
        }
    };

     // --- Định dạng ngày tháng ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Coupon Management</h1>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add New Coupon
                </button>
            </div>

            {status === 'loading' && <p>Loading coupons...</p>}
            {status === 'failed' && <p className="text-red-500">Error loading coupons: {error}</p>}

            {status === 'succeeded' && (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Purchase</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage (Count/Limit)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.discountType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                         {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : coupon.discountValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.minPurchaseAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(coupon.expiryDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.usageCount} / {coupon.maxUsageLimit ?? '∞'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleEditClick(coupon)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDeleteClick(coupon._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                             {coupons.length === 0 && (
                                <tr><td colSpan="9" className="text-center py-4 text-gray-500">No coupons found.</td></tr>
                             )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal chứa Form Thêm/Sửa */}
             <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                 <AddEditCouponForm
                     // Nếu là sửa và đã fetch xong details thì dùng currentCoupon, ngược lại là null (thêm mới)
                     initialData={modalType === 'edit' && detailStatus === 'succeeded' ? currentCoupon : null}
                     onSubmit={handleFormSubmit}
                     onClose={handleCloseModal}
                     // Pass loading state của create/update nếu muốn disable nút submit trong form
                     isLoading={status === 'loading'}
                 />
                 {/* Hiển thị loading khi fetch details cho form sửa */}
                 {modalType === 'edit' && detailStatus === 'loading' && <p className='text-center p-4'>Loading details...</p>}
             </Modal>

        </div>
    );
};

export default AdminCouponListPage;