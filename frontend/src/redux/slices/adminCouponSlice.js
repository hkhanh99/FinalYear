import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getToken = () => localStorage.getItem("userToken");

// --- Async Thunks ---

// Fetch all coupons (Admin)
export const fetchAdminCoupons = createAsyncThunk(
    'adminCoupons/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/coupons`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Fetch single coupon details (Admin) - Cần khi sửa để lấy data mới nhất
export const fetchAdminCouponDetails = createAsyncThunk(
    'adminCoupons/fetchDetails',
    async (id, { rejectWithValue }) => {
         try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/coupons/${id}`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


// Create a new coupon (Admin)
export const createAdminCoupon = createAsyncThunk(
    'adminCoupons/create',
    async (couponData, { rejectWithValue, dispatch }) => {
        try {
            const token = getToken();
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/coupons`, couponData, config);
            dispatch(fetchAdminCoupons()); // Fetch lại list sau khi tạo thành công
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Update a coupon (Admin)
export const updateAdminCoupon = createAsyncThunk(
    'adminCoupons/update',
    async ({ id, ...couponData }, { rejectWithValue, dispatch }) => { // Nhận id và data
        try {
            const token = getToken();
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/coupons/${id}`, couponData, config);
            dispatch(fetchAdminCoupons()); // Fetch lại list sau khi cập nhật thành công
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Delete a coupon (Admin)
export const deleteAdminCoupon = createAsyncThunk(
    'adminCoupons/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/coupons/${id}`, config);
            // Không cần dispatch fetchAdminCoupons ở đây vì extraReducer sẽ xóa item khỏi list
            return id; // Trả về id để dùng trong reducer
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// --- Initial State ---
const initialState = {
    coupons: [],            // Danh sách coupons
    currentCoupon: null,    // Coupon đang được xem/sửa chi tiết
    status: 'idle',         // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    detailStatus: 'idle',   // Status riêng cho việc fetch details
    detailError: null,
};

// --- Slice ---
const adminCouponSlice = createSlice({
    name: 'adminCoupons',
    initialState,
    reducers: {
        // Có thể thêm reducer để reset currentCoupon khi đóng modal chẳng hạn
        clearCurrentCoupon: (state) => {
            state.currentCoupon = null;
            state.detailStatus = 'idle';
            state.detailError = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch List
        builder
            .addCase(fetchAdminCoupons.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.coupons = action.payload;
            })
            .addCase(fetchAdminCoupons.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch Details
            .addCase(fetchAdminCouponDetails.pending, (state) => {
                state.detailStatus = 'loading';
                state.currentCoupon = null; // Xóa cái cũ trước khi fetch
                state.detailError = null;
            })
            .addCase(fetchAdminCouponDetails.fulfilled, (state, action) => {
                state.detailStatus = 'succeeded';
                state.currentCoupon = action.payload; // Lưu coupon vừa fetch vào state
            })
            .addCase(fetchAdminCouponDetails.rejected, (state, action) => {
                state.detailStatus = 'failed';
                state.detailError = action.payload;
            })
            // Create
            .addCase(createAdminCoupon.pending, (state) => {
                state.status = 'loading'; // Có thể dùng loading chung hoặc loading riêng cho create/update
            })
            .addCase(createAdminCoupon.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Không cần thêm thủ công vì đã gọi fetchAdminCoupons lại trong thunk
                // state.coupons.push(action.payload);
                state.currentCoupon = null; // Reset nếu cần
            })
            .addCase(createAdminCoupon.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // Lưu lỗi tạo coupon
            })
            // Update
             .addCase(updateAdminCoupon.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAdminCoupon.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Không cần cập nhật thủ công vì đã gọi fetchAdminCoupons lại
                // const index = state.coupons.findIndex(c => c._id === action.payload._id);
                // if (index !== -1) { state.coupons[index] = action.payload; }
                state.currentCoupon = null; // Reset
            })
            .addCase(updateAdminCoupon.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteAdminCoupon.pending, (state) => {
                 state.status = 'loading'; // Hoặc dùng status riêng cho delete
             })
            .addCase(deleteAdminCoupon.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Xóa coupon khỏi danh sách trong state mà không cần fetch lại
                state.coupons = state.coupons.filter(c => c._id !== action.payload);
            })
            .addCase(deleteAdminCoupon.rejected, (state, action) => {
                 state.status = 'failed';
                 state.error = action.payload;
             });
    }
});

export const { clearCurrentCoupon } = adminCouponSlice.actions;
export default adminCouponSlice.reducer;