import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ColumnsIcon, 
  SparklesIcon, 
  XCircleIcon, 
  AlertTriangleIcon, 
  FilterXIcon
} from '../components/Layout/Icons';
import {
  fetchProductsByFilters
} from '../redux/slices/productsSlice';
import {
  removeProductFromCompare,
  clearComparison,
  compareTwoProducts
} from '../redux/slices/comparisonSlice';

// Enhanced Loading Spinner with more engaging design
const LoadingSpinner = ({ text = "Loading...", variant = "default" }) => {
  const variants = {
    default: "border-blue-500",
    error: "border-red-500",
    success: "border-green-500"
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-pulse">
      <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${variants[variant]}`}></div>
      <p className="mt-4 text-md text-gray-700 font-medium">{text}</p>
    </div>
  );
};

// Improved Product Comparison Table with more visual differentiation
const ProductComparisonTable = ({ products, onRemoveProduct }) => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <FilterXIcon className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 text-lg">No products available for comparison</p>
      </div>
    );
  }

  const { commonAttributes, allKeys } = useMemo(() => {
    const commonAttributes = ['name', 'price', 'category', 'brand', 'storage', 'display', 'condition', 'rating'];
    const allKeys = [...commonAttributes];

    products.forEach(product => {
      if (!product) return;
      
      Object.keys(product).forEach(key => {
        if (
          !allKeys.includes(key) &&
          !['_id', 'id', '__v', 'images', 'description'].includes(key) &&
          typeof product[key] !== 'object'
        ) {
          allKeys.push(key);
        }
      });
    });

    return { commonAttributes, allKeys };
  }, [products]);

  return (
    <div className="overflow-x-auto">
      <div className="shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider sticky left-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10">
                Attribute
              </th>
              {products.map(p => (
                <th key={p._id || p.id} className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-56">
                  <div className="flex flex-col items-center">
                    {p.images?.[0]?.url ? (
                      <div className="h-24 w-24 mb-3 rounded-lg overflow-hidden shadow-md border border-gray-200">
                        <img 
                          src={p.images[0].url} 
                          alt={p.name} 
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs mb-3 rounded-lg shadow-md">
                        No Image
                      </div>
                    )}
                    <span className="block text-sm font-semibold text-gray-900 truncate max-w-[200px] mb-2">
                      {p.name}
                    </span>
                    <button 
                      onClick={() => onRemoveProduct(p._id || p.id)} 
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 transition-colors"
                    >
                      <XCircleIcon size={16} />
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allKeys.map((key, index) => (
              <tr 
                key={key} 
                className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                  hover:bg-blue-50 transition-colors
                `}
              >
                <td className="py-4 px-6 font-medium text-gray-800 sticky left-0 bg-white z-10 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </td>
                {products.map(p => (
                  <td 
                    key={(p._id || p.id) + key} 
                    className="py-4 px-6 text-sm text-gray-700 text-center"
                  >
                    { typeof p[key] === 'boolean'
                        ? (
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${p[key] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {p[key] ? 'Yes' : 'No'}
                          </span>
                        )
                        : Array.isArray(p[key])
                          ? p[key].join(', ')
                          : (p[key] != null ? String(p[key]) : 'N/A')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ComparisonPage = () => {
  const dispatch = useDispatch();

  const comparisonState = useSelector(state => state.comparison || {});
  
  const {
    productIdsToCompare = [],
    productsDetails = [],
    summary = '',
    isLoadingDetails = false,
    detailsError = null,
    isLoadingSummary = false,
    summaryError = null
  } = comparisonState;

  const {
    products: allAvailableProducts = [],
    loading: allProductsLoading = false
  } = useSelector(state => state.products || {});

  const [dropdown1SelectedId, setDropdown1SelectedId] = useState('');
  const [dropdown2SelectedId, setDropdown2SelectedId] = useState('');

  useEffect(() => {
    if (!allProductsLoading && allAvailableProducts.length === 0) {
      dispatch(fetchProductsByFilters({}));
    }
  }, [dispatch, allAvailableProducts, allProductsLoading]);

  const handleAddSelectedToCompare = async () => {
    if (!dropdown1SelectedId || !dropdown2SelectedId) {
      return alert('Please select two products to compare.');
    }
    if (dropdown1SelectedId === dropdown2SelectedId) {
      return alert('Please select two different products.');
    }
    
    try {
      const result = await dispatch(compareTwoProducts(dropdown1SelectedId, dropdown2SelectedId));
      console.log("Comparison result:", result);
    } catch (error) {
      console.error("Comparison error:", error);
      alert(`An error occurred: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveProduct = id => {
    dispatch(removeProductFromCompare(id));
  };
  
  const handleClearAll = () => {
    dispatch(clearComparison());
  };

  const showProductSelectors = productIdsToCompare.length < 2 && !isLoadingDetails;
  
  if (showProductSelectors) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-10 border border-gray-100">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 flex items-center justify-center gap-3">
            <ColumnsIcon size={36} className="text-blue-600" />
            Product Comparison
          </h1>
          
          { allProductsLoading
            ? <LoadingSpinner text="Loading products..." />
            : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      First Product
                    </label>
                    <select
                      value={dropdown1SelectedId}
                      onChange={e => setDropdown1SelectedId(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="">Select first product</option>
                      {allAvailableProducts.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Second Product
                    </label>
                    <select
                      value={dropdown2SelectedId}
                      onChange={e => setDropdown2SelectedId(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="">Select second product</option>
                      {allAvailableProducts.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddSelectedToCompare}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <SparklesIcon size={20} />
                  Compare Products
                </button>
              </div>
            )
          }
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <ColumnsIcon size={36} className="text-blue-600" />
          Comparison Results
        </h1>
        <button
          onClick={handleClearAll}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <XCircleIcon size={18} />
          Clear All ({productIdsToCompare.length})
        </button>
      </div>
      
      {productIdsToCompare.length >= 2 && (
        <section className="mb-10 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <SparklesIcon size={24} className="text-purple-600" />
            AI Generated Summary
          </h2>
          { isLoadingSummary
            ? <LoadingSpinner text="AI analyzing products..." />
            : summaryError
              ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="text-red-600" size={32} />
                  <div>
                    <p className="font-semibold text-red-800">Error generating summary:</p>
                    <p className="text-red-600">{summaryError}</p>
                  </div>
                </div>
              )
              : (
                <div>
                  {summary 
                    ? (
                      <p className="text-gray-700 bg-white p-4 rounded-lg shadow-md">
                        {summary}
                      </p>
                    )
                    : (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangleIcon className="text-yellow-600" size={32} />
                        <p className="text-yellow-800">
                          No summary available. Please try selecting products again.
                        </p>
                      </div>
                    )
                  }
                </div>
              )
          }
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Detailed Comparison
        </h2>
        { isLoadingDetails
          ? <LoadingSpinner text="Loading product details..." />
          : detailsError
            ? (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg flex items-center gap-4">
                <AlertTriangleIcon className="text-red-600" size={40} />
                <div>
                  <p className="font-semibold text-red-800 text-lg mb-2">
                    Error Loading Product Details
                  </p>
                  <p className="text-red-600">{detailsError}</p>
                </div>
              </div>
            )
            : <ProductComparisonTable 
                products={productsDetails} 
                onRemoveProduct={handleRemoveProduct} 
              />
        }
      </section>
    </div>
  );
};

export default ComparisonPage;