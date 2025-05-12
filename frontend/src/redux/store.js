import {configureStore} from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import productReducer from "./slices/productsSlice"
import cartReducer from "./slices/cartSlice"
import checkoutReducer from "./slices/checkoutSlice"
import orderReducer from "./slices/orderSlice"
import adminReducer from "./slices/adminSlice"
import adminProductReducer from "./slices/adminProductSlice"
import adminOrderReducer from "./slices/adminOrderSlice"
import adminCouponReducer from "./slices/adminCouponSlice"
import comparisonReducer from "./slices/comparisonSlice"
const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        orders: orderReducer,
        comparison: comparisonReducer,
        admin: adminReducer,
        adminProducts: adminProductReducer,
        adminOrders: adminOrderReducer,
        adminCoupons: adminCouponReducer, 
    },
});

export default store