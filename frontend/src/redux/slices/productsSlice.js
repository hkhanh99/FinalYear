import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

//Async thunk to fetch products by Collection and filters
export const fetchProductsByFilters = createAsyncThunk("products/fetchByFilters",
    async ({
        category,
        size,
        condition,
        display,
        color,
        minPrice,
        maxPrice,
        sortBy,
        search,
        brand,
    }) => {
        const query = new URLSearchParams();
        if (category) query.append("category", category);
        if (brand) query.append("brand", brand);
        if (size) query.append("size", size);
        if (color) query.append("color", color);
        if (condition) query.append("condition", condition);
        if (display) query.append("display", display);
        if (minPrice) query.append("minPrice", minPrice);
        if (maxPrice) query.append("maxPrice", maxPrice);
        if (sortBy) query.append("sortBy", sortBy);
        if (search) query.append("search", search);

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`)
        return response.data;
    }
)

//Fetch single product by ID
export const fetchProductDetails = createAsyncThunk("products/fetchProductDetails",
    async (id) => {
        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
        )
        return response.data
    }
)

//fetch similar products
export const updateProducts = createAsyncThunk("products/updateProduct",
    async ({ id, productData }) => {
        const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, productData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            }
        )
        return response.data
    }
)

//fetch similar products
export const fetchSimilarProducts = createAsyncThunk("products/fetchSimilarProducts",
    async ({ id }) => {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`)
        return response.data
    }
)

const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        selectedProduct: null,
        similarProducts: [],
        loading: false,
        error: null,
        filters: {
            category: "",
            brand: "",
            size: "",
            color: "",
            condition: "",
            display: "",
            minPrice: "",
            maxPrice: "",
            sortBy: "",
            search: "",
        }
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                category: "",
                size: "",
                color: "",
                condition: "",
                display: "",
                minPrice: "",
                maxPrice: "",
                sortBy: "",
                search: "",
            }
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchProductsByFilters.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
            state.loading = false;
            state.products = Array.isArray(action.payload) ? action.payload: [];
        })
        .addCase(fetchProductsByFilters.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(fetchProductDetails.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchProductDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedProduct = action.payload;
        })
        .addCase(fetchProductDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(updateProducts.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(updateProducts.fulfilled, (state, action) => {
            state.loading = false;
            const updatedProduct = action.payload;
            const index = state.products.findIndex(
                (product) => product._id === updatedProduct._id
            );
            if (index !== -1) {
                state.products[index] = updatedProduct;
            }
        })
        .addCase(updateProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(fetchSimilarProducts.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.similarProducts = action.payload;
        })
        .addCase(fetchSimilarProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
    }
})

export const {setFilters,clearFilters} = productsSlice.actions;
export default productsSlice.reducer