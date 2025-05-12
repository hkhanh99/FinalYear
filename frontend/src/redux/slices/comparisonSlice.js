import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_API_URL = 'http://localhost:9000/api';

// Helper function to log state for debugging
const logStateChange = (message, state) => {
  console.log(`🔄 ${message}:`, {
    productIdsToCompare: state.productIdsToCompare,
    isLoadingDetails: state.isLoadingDetails,
    isLoadingSummary: state.isLoadingSummary,
    summaryLength: state.summary?.length,
    productsDetailsCount: state.productsDetails?.length
  });
};

/**
 * Fetches details for multiple products by their IDs
 */
export const fetchProductsDetailsForCompare = createAsyncThunk(
  'comparison/fetchProductsDetails',
  async (productIds, { rejectWithValue }) => {
    console.log("🔍 fetchProductsDetailsForCompare called with:", productIds);
    if (!productIds || productIds.length === 0) {
      console.warn("⚠️ fetchProductsDetailsForCompare called with empty productIds");
      return [];
    }
    try {
      const params = new URLSearchParams();
      productIds.forEach(id => params.append('ids', id));
      const response = await axios.get(`${BACKEND_API_URL}/products/batch-details?${params.toString()}`);
      console.log("✅ Product details fetched successfully:", response.data.length, "items");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("❌ Error fetching product details:", error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch product details for comparison.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetches an AI-generated summary comparing the products
 */
export const fetchComparisonSummary = createAsyncThunk(
  'comparison/fetchSummary',
  async (productIds, { rejectWithValue }) => {
    console.log("📤 Gửi request tới Gemini với productIds:", productIds);
    try {
      const response = await axios.post(`${BACKEND_API_URL}/compare/summary`, { productIds });
      console.log("✅ Nhận về summary từ backend:", response.data);
      return response.data.summary;
    } catch (error) {
      console.error("❌ Lỗi khi gọi /compare/summary:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch AI summary.');
    }
  }
);

/**
 * Compare two products - this is a thunk action that dispatches multiple other actions
 */
export const compareTwoProducts = (id1, id2) => async (dispatch, getState) => {
  console.log("🌀 compareTwoProducts called with:", id1, id2);
  
  // Clear previous comparison data
  dispatch(clearComparison());
  
  // Add the products to compare list
  dispatch(addProductToCompare(id1));
  console.log("✅ Added product 1:", id1);
  const stateAfterAdd1 = getState().comparison;
  logStateChange("State after adding product 1", stateAfterAdd1);
  
  dispatch(addProductToCompare(id2));
  console.log("✅ Added product 2:", id2);
  const stateAfterAdd2 = getState().comparison;
  logStateChange("State after adding product 2", stateAfterAdd2);
  
  // Fetch product details
  try {
    const detailsResult = await dispatch(fetchProductsDetailsForCompare([id1, id2]));
    console.log("✅ Fetched details result:", detailsResult);
    const stateAfterDetails = getState().comparison;
    logStateChange("State after fetching details", stateAfterDetails);
    
    if (detailsResult.error) {
      console.error("❌ Error fetching details:", detailsResult.error);
      return { error: detailsResult.error };
    }
    
    // Fetch comparison summary
    const summaryResult = await dispatch(fetchComparisonSummary([id1, id2]));
    console.log("✅ Fetched summary result:", summaryResult);
    const finalState = getState().comparison;
    logStateChange("Final state after all operations", finalState);
    
    if (summaryResult.error) {
      console.error("❌ Error fetching summary:", summaryResult.error);
      return { error: summaryResult.error };
    }
    
    return { 
      details: detailsResult, 
      summary: summaryResult,
      state: getState().comparison 
    };
  } catch (error) {
    console.error("❌ Unexpected error in compareTwoProducts:", error);
    return { error: error.message };
  }
};

const initialState = {
  productIdsToCompare: [],
  productsDetails: [],
  summary: '',
  isLoadingDetails: false,
  detailsError: null,
  isLoadingSummary: false,
  summaryError: null,
  maxCompareItems: 4,
};

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    addProductToCompare: (state, action) => {
      console.log("➕ addProductToCompare called with:", action.payload);
      const productId = action.payload;
      if (!state.productIdsToCompare.includes(productId) && state.productIdsToCompare.length < state.maxCompareItems) {
        state.productIdsToCompare.push(productId);
        console.log("✅ Product added to compare list. New list:", [...state.productIdsToCompare]);
      } else if (state.productIdsToCompare.length >= state.maxCompareItems) {
        console.warn(`⚠️ Comparison limit of ${state.maxCompareItems} items reached.`);
      } else {
        console.warn("⚠️ Product already in comparison list:", productId);
      }
    },
    removeProductFromCompare: (state, action) => {
      console.log("➖ removeProductFromCompare called with:", action.payload);
      const productIdToRemove = action.payload;
      state.productIdsToCompare = state.productIdsToCompare.filter(id => id !== productIdToRemove);
      state.productsDetails = state.productsDetails.filter(p => p._id !== productIdToRemove && p.id !== productIdToRemove);
      if (state.productIdsToCompare.length < 2) {
        state.summary = '';
        state.isLoadingSummary = false;
        state.summaryError = null;
      }
      if (state.productIdsToCompare.length === 0) {
        state.isLoadingDetails = false;
        state.detailsError = null;
        state.productsDetails = [];
      }
      console.log("✅ Product removed. Updated list:", [...state.productIdsToCompare]);
    },
    clearComparison: (state) => {
      console.log("🧹 clearComparison called");
      state.productIdsToCompare = [];
      state.productsDetails = [];
      state.summary = '';
      state.isLoadingDetails = false;
      state.detailsError = null;
      state.isLoadingSummary = false;
      state.summaryError = null;
      console.log("✅ Comparison state cleared");
    },
    clearSummaryState: (state) => {
      console.log("🧹 clearSummaryState called");
      state.summary = '';
      state.isLoadingSummary = false;
      state.summaryError = null;
      console.log("✅ Summary state cleared");
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProductsDetailsForCompare states
      .addCase(fetchProductsDetailsForCompare.pending, (state) => {
        console.log("🕒 fetchProductsDetailsForCompare.pending");
        state.isLoadingDetails = true;
        state.detailsError = null;
      })
      .addCase(fetchProductsDetailsForCompare.fulfilled, (state, action) => {
        console.log("✅ fetchProductsDetailsForCompare.fulfilled with", action.payload?.length, "items");
        state.isLoadingDetails = false;
        state.productsDetails = Array.isArray(action.payload) ? action.payload : [];
        console.log("Products details updated:", state.productsDetails.length, "items");
      })
      .addCase(fetchProductsDetailsForCompare.rejected, (state, action) => {
        console.error("❌ fetchProductsDetailsForCompare.rejected:", action.payload);
        state.isLoadingDetails = false;
        state.detailsError = action.payload || "Unknown error fetching product details";
        state.productsDetails = [];
      })
      
      // Handle fetchComparisonSummary states
      .addCase(fetchComparisonSummary.pending, (state) => {
        console.log("🕒 fetchComparisonSummary.pending");
        state.isLoadingSummary = true;
        state.summary = '';
        state.summaryError = null;
      })
      .addCase(fetchComparisonSummary.fulfilled, (state, action) => {
        console.log("✅ fetchComparisonSummary.fulfilled with summary length:", action.payload?.length);
        state.isLoadingSummary = false;
        state.summary = action.payload || '';
        console.log("Summary updated, new length:", state.summary.length);
      })
      .addCase(fetchComparisonSummary.rejected, (state, action) => {
        console.error("❌ fetchComparisonSummary.rejected:", action.payload);
        state.isLoadingSummary = false;
        state.summaryError = action.payload || "Unknown error fetching comparison summary";
        state.summary = '';
      });
  },
});

export const {
  addProductToCompare,
  removeProductFromCompare,
  clearComparison,
  clearSummaryState
} = comparisonSlice.actions;

export default comparisonSlice.reducer;