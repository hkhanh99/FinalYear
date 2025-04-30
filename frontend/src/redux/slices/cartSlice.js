// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- LocalStorage Functions ---
const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem("cart");
    const initialCartState = { products: [] }; // Only needs products initially
    if (storedCart) {
        try {
            const parsed = JSON.parse(storedCart);
            return { products: parsed.products || [] };
        } catch (e) {
            console.error("Failed to parse cart from storage", e);
            return { products: [] };
        }
    }
    return { products: [] };
};

const saveCartToStorage = (cartData) => {
    // Only save products array
    localStorage.setItem("cart", JSON.stringify({ products: cartData.products }));
};

// --- Helper Function: Calculate Totals (Pure) ---
const calculateNewTotals = (cartItems = [], couponState = {}) => {
    const itemsPrice = cartItems.reduce(
        (acc, item) => acc + (item.price * item.quantity), 0
    );
    const shippingPrice = 0; // No shipping
    const taxPrice = 0;      // No tax

    let subTotal = itemsPrice;
    let finalDiscountAmount = 0;

    // Calculate discount based on passed couponState
    if (couponState.code && couponState.discountAmount > 0) {
        finalDiscountAmount = Math.min(couponState.discountAmount, subTotal);
    }

    let finalTotalPrice = subTotal - finalDiscountAmount;
    if (finalTotalPrice < 0) finalTotalPrice = 0;

    // Return calculated values
    return {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice: finalTotalPrice,
        appliedDiscountAmount: finalDiscountAmount, // Return the actual applied discount
    };
};

// --- Async Thunks ---
export const fetchCart = createAsyncThunk("cart/fetchCart", async ({ userId, guestId }, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, { params: { userId, guestId } });
        return data; // Expects { products: [...] }
    } catch (error) { return rejectWithValue(error.response?.data || 'Failed to fetch cart'); }
});

export const addToCart = createAsyncThunk("cart/addToCart", async (cartData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, cartData);
        return data; // Expects { products: [...] }
    } catch (error) { return rejectWithValue(error.response?.data || 'Failed to add'); }
});

export const updateCartItemQuantity = createAsyncThunk("cart/updateCartItemQuantity", async (cartData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, cartData);
        return data; // Expects { products: [...] }
    } catch (error) { return rejectWithValue(error.response?.data || 'Failed to update'); }
});

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (cartData, { rejectWithValue }) => {
    try {
        const { data } = await axios({ method: "DELETE", url: `${import.meta.env.VITE_BACKEND_URL}/api/cart`, data: cartData });
        return data; // Expects { products: [...] }
    } catch (error) { return rejectWithValue(error.response?.data || 'Failed to remove'); }
});

export const mergeCart = createAsyncThunk("cart/mergeCart", async ({ guestId, user }, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`, { guestId, user }, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
        return data; // Expects { products: [...] }
    } catch (error) { return rejectWithValue(error.response?.data || 'Failed to merge'); }
});

export const validateCoupon = createAsyncThunk(
     'cart/validateCoupon',
     async ({ couponCode, cartTotal }, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem("userToken");
            const config = { headers: { 'Content-Type': 'application/json' } };
            if (userToken) {
                config.headers['Authorization'] = `Bearer ${userToken}`;
                console.log(">>> Sending coupon validation request WITH Auth Token from localStorage");
            } else {
                console.log(">>> Sending coupon validation request WITHOUT Auth Token (Not found in localStorage)");
            }
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/coupons/validate`, { couponCode, cartTotal }, config);
            return data; // Expects { isValid: boolean, message: string, coupon?: obj, discountAmount?: number }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Validation failed';
            console.error("Validate Coupon Error Response:", error.response?.data || error.message);
            return rejectWithValue(message);
        }
     }
);

// --- Initial State ---
const initialCartItems = loadCartFromStorage();
const initialState = {
    cart: initialCartItems, // Contains { products: [] }
    loading: false,
    error: null,
    coupon: {
        code: null,
        discountType: null,
        discountValue: 0,
        discountAmount: 0, // Stores discount value *from API* or adjusted value
        isValidating: false,
        validationError: null,
        validationMessage: null,
    },
    // Calculated values stored at top level
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
};
// Calculate initial totals based on loaded cart and initial coupon state
const initialTotals = calculateNewTotals(initialState.cart.products, initialState.coupon);
initialState.itemsPrice = initialTotals.itemsPrice;
initialState.shippingPrice = initialTotals.shippingPrice;
initialState.taxPrice = initialTotals.taxPrice;
initialState.totalPrice = initialTotals.totalPrice;
initialState.coupon.discountAmount = initialTotals.appliedDiscountAmount; // Should be 0 initially


// --- Slice ---
const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cart.products = [];
            state.coupon = initialState.coupon; // Reset coupon state
            // Recalculate totals based on empty cart/coupon state
            const totals = calculateNewTotals(state.cart.products, state.coupon);
            state.itemsPrice = totals.itemsPrice;
            state.shippingPrice = totals.shippingPrice;
            state.taxPrice = totals.taxPrice;
            state.totalPrice = totals.totalPrice;
            // state.coupon.discountAmount = totals.appliedDiscountAmount; // <<< DÒNG NÀY ĐÃ BỎ >>>
            localStorage.removeItem("cart");
            console.log("Cart cleared via clearCart");
        },
        resetCart: (state) => {
            state.cart.products = [];
            state.coupon = initialState.coupon; // Reset coupon state
            const totals = calculateNewTotals(state.cart.products, state.coupon);
            state.itemsPrice = totals.itemsPrice;
            state.shippingPrice = totals.shippingPrice;
            state.taxPrice = totals.taxPrice;
            state.totalPrice = totals.totalPrice;
            // state.coupon.discountAmount = totals.appliedDiscountAmount; // <<< DÒNG NÀY ĐÃ BỎ >>>
            localStorage.removeItem("cart");
            console.log("Cart reset via resetCart");
        },
        removeAppliedCoupon: (state) => {
            state.coupon = initialState.coupon; // Reset coupon state
            // Recalculate totals
            const totals = calculateNewTotals(state.cart.products, state.coupon);
            state.itemsPrice = totals.itemsPrice;
            state.shippingPrice = totals.shippingPrice;
            state.taxPrice = totals.taxPrice;
            state.totalPrice = totals.totalPrice;
            // state.coupon.discountAmount = totals.appliedDiscountAmount; // <<< DÒNG NÀY CŨNG NÊN BỎ >>>
                                                                       // Vì initialState.coupon đã có discountAmount = 0
        },
    },
    extraReducers: (builder) => {
        // Common handlers
        const handlePending = (state) => { state.loading = true; state.error = null; };
        const handleRejected = (state, action) => { state.loading = false; state.error = action.payload || action.error?.message || 'An error occurred'; };
        const handleCartUpdate = (state, action) => {
            state.cart.products = action.payload.products || [];
            state.coupon = initialState.coupon; // Reset coupon
            const totals = calculateNewTotals(state.cart.products, state.coupon); // Recalculate
            state.itemsPrice = totals.itemsPrice;
            state.shippingPrice = totals.shippingPrice;
            state.taxPrice = totals.taxPrice;
            state.totalPrice = totals.totalPrice;
            state.coupon.discountAmount = totals.appliedDiscountAmount; // Update actual applied discount (will be 0 here)
            saveCartToStorage(state.cart);
        };

        builder
            // Cart Thunks
            .addCase(fetchCart.pending, handlePending)
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false; // Need loading false here too
                handleCartUpdate(state, action); // Use common handler
            })
            .addCase(fetchCart.rejected, handleRejected)

            .addCase(addToCart.pending, handlePending)
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                handleCartUpdate(state, action);
            })
            .addCase(addToCart.rejected, handleRejected)

            .addCase(updateCartItemQuantity.pending, handlePending)
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                 state.loading = false;
                 handleCartUpdate(state, action);
             })
            .addCase(updateCartItemQuantity.rejected, handleRejected)

            .addCase(removeFromCart.pending, handlePending)
            .addCase(removeFromCart.fulfilled, (state, action) => {
                 state.loading = false;
                 handleCartUpdate(state, action);
             })
            .addCase(removeFromCart.rejected, handleRejected)

            .addCase(mergeCart.pending, handlePending)
            .addCase(mergeCart.fulfilled, (state, action) => {
                 state.loading = false;
                 handleCartUpdate(state, action);
             })
            .addCase(mergeCart.rejected, handleRejected)

            // Coupon Thunk
            .addCase(validateCoupon.pending, (state) => {
                 state.coupon.isValidating = true;
                 state.coupon.validationError = null;
                 state.coupon.validationMessage = null;
                 state.coupon.code = null;
                 state.coupon.discountType = null;
                 state.coupon.discountValue = 0;
                 state.coupon.discountAmount = 0;
                 const totals = calculateNewTotals(state.cart.products, state.coupon); // Recalculate with reset coupon
                 state.itemsPrice = totals.itemsPrice;
                 state.shippingPrice = totals.shippingPrice;
                 state.taxPrice = totals.taxPrice;
                 state.totalPrice = totals.totalPrice;
             })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.coupon.isValidating = false;
                if (action.payload.isValid) {
                    // Update coupon state first
                    state.coupon = {
                         ...initialState.coupon,
                         isValidating: false,
                         code: action.payload.coupon.code,
                         discountType: action.payload.coupon.discountType,
                         discountValue: action.payload.coupon.discountValue,
                         discountAmount: action.payload.discountAmount, // Amount from API
                         validationMessage: action.payload.message,
                    };
                    // Recalculate totals based on new coupon state
                    const totals = calculateNewTotals(state.cart.products, state.coupon);
                    state.itemsPrice = totals.itemsPrice;
                    state.shippingPrice = totals.shippingPrice;
                    state.taxPrice = totals.taxPrice;
                    state.totalPrice = totals.totalPrice;
                    state.coupon.discountAmount = totals.appliedDiscountAmount; // Update with *actual* applied amount
                } else {
                     state.coupon.validationError = action.payload.message || 'Coupon is invalid';
                     state.coupon = initialState.coupon; // Reset coupon
                     const totals = calculateNewTotals(state.cart.products, state.coupon); // Recalculate totals
                     state.itemsPrice = totals.itemsPrice;
                     state.shippingPrice = totals.shippingPrice;
                     state.taxPrice = totals.taxPrice;
                     state.totalPrice = totals.totalPrice;
                }
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                 state.coupon.isValidating = false;
                 state.coupon.validationError = action.payload;
                 state.coupon = initialState.coupon; // Reset coupon
                 const totals = calculateNewTotals(state.cart.products, state.coupon); // Recalculate totals
                 state.itemsPrice = totals.itemsPrice;
                 state.shippingPrice = totals.shippingPrice;
                 state.taxPrice = totals.taxPrice;
                 state.totalPrice = totals.totalPrice;
             });
    }
});

// Export actions
export const { clearCart, removeAppliedCoupon, /* recalculateTotals removed */ resetCart } = cartSlice.actions;
export default cartSlice.reducer;