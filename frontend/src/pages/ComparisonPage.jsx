import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    ColumnsIcon,
    SparklesIcon,
    XCircleIcon,
    AlertTriangleIcon,
    FilterXIcon
} from '../components/Layout/Icons'; // Đảm bảo đường dẫn này đúng
import {
    fetchProductsByFilters
} from '../redux/slices/productsSlice'; // Đảm bảo đường dẫn này đúng
import {
    removeProductFromCompare,
    clearComparison,
    compareTwoProducts // Giả sử action này xử lý việc lấy chi tiết sản phẩm và summary
} from '../redux/slices/comparisonSlice'; // Đảm bảo đường dẫn này đúng

// Enhanced Loading Spinner with responsive sizing
const LoadingSpinner = ({ text = "Loading...", variant = "default" }) => {
    const variants = {
        default: "border-blue-500",
        error: "border-red-500",
        success: "border-green-500"
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 animate-pulse">
            {/* Responsive spinner size */}
            <div className={`animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 ${variants[variant]}`}></div>
            {/* Responsive text size */}
            <p className="mt-3 sm:mt-4 text-sm sm:text-md text-gray-700 font-medium">{text}</p>
        </div>
    );
};

// Product Comparison Table with responsive adjustments
const ProductComparisonTable = ({ products, onRemoveProduct }) => {
    if (!products || !Array.isArray(products) || products.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FilterXIcon className="mx-auto mb-4 text-gray-400" size={40} /> {/* Adjusted icon size slightly */}
                <p className="text-gray-600 text-md sm:text-lg">No products available for comparison</p>
                {/* Added a hint for clarity, can be removed if not needed */}
                {/* <p className="text-gray-500 text-sm mt-1">Select products to see their comparison.</p> */}
            </div>
        );
    }

    // Logic để lấy allKeys giữ nguyên như bạn cung cấp
    const { allKeys } = useMemo(() => {
        const commonAttributes = ['name', 'price', 'category', 'brand', 'storage', 'display', 'condition', 'rating'];
        const tempAllKeys = [...commonAttributes]; // Start with common attributes to ensure order

        products.forEach(product => {
            if (!product) return;
            Object.keys(product).forEach(key => {
                if (
                    !tempAllKeys.includes(key) &&
                    !['_id', 'id', '__v', 'images', 'description', 'reviews', 'numReviews', 'countInStock', 'isFeatured', 'isPublished', 'user', 'createdAt', 'updatedAt', 'slug', 'originalPrice', 'tags', 'colors', 'sizes'] // Các trường bỏ qua
                    .includes(key) &&
                    typeof product[key] !== 'object' && product[key] !== null // Chỉ lấy giá trị đơn giản, không phải object và không null
                ) {
                    tempAllKeys.push(key);
                }
            });
        });
         // Đảm bảo các commonAttributes được ưu tiên và chỉ hiển thị nếu có dữ liệu
        const uniqueKeys = [...new Set(tempAllKeys)];
        const filteredKeys = uniqueKeys.filter(key => products.some(p => p && (p[key] !== undefined && p[key] !== null && p[key] !== "")));


        return { allKeys: filteredKeys };
    }, [products]);

    return (
        // Wrapper cho phép cuộn ngang
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
            <div className="align-middle inline-block min-w-full"> {/* Đảm bảo bảng chiếm ít nhất full width trước khi cuộn */}
                <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <tr>
                            <th scope="col"
                                className="py-3 px-4 sm:py-4 sm:px-6 text-left text-xs font-semibold sm:font-bold text-gray-700 uppercase tracking-wider sticky left-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-20">
                                Attribute
                            </th>
                            {products.map(p => (
                                p && ( // Kiểm tra sản phẩm p có tồn tại không
                                <th scope="col"
                                    key={p._id || p.id}
                                    className="py-3 px-4 sm:py-4 sm:px-6 text-center text-xs font-semibold sm:font-bold text-gray-700 uppercase tracking-wider min-w-[170px] sm:min-w-[200px] md:min-w-[224px]"> {/* Responsive min-width */}
                                    <div className="flex flex-col items-center">
                                        {p.images?.[0]?.url ? (
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 mb-2 rounded-md sm:rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                                <img
                                                    src={p.images[0].url}
                                                    alt={p.name || 'Product Image'}
                                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs mb-2 rounded-md sm:rounded-lg shadow-sm">
                                                No Image
                                            </div>
                                        )}
                                        <span className="block text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[180px] md:max-w-[200px] mb-1 sm:mb-2">
                                            {p.name || 'N/A'}
                                        </span>
                                        <button
                                            onClick={() => onRemoveProduct(p._id || p.id)}
                                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 transition-colors p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300" // Tăng vùng chạm, thêm focus style
                                        >
                                            <XCircleIcon size={14} />
                                            Remove
                                        </button>
                                    </div>
                                </th>
                                )
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allKeys.map((key, index) => (
                            <tr
                                key={key}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                            >
                                <td scope="row" // Thêm scope
                                    className={`py-3 px-4 sm:py-4 sm:px-6 font-medium text-gray-800 sticky left-0 z-10 capitalize text-xs sm:text-sm 
                                               ${index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}`}> {/* Đảm bảo background của sticky cell giống background của row và có hover */}
                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                </td>
                                {products.map(p => (
                                    p && ( // Kiểm tra sản phẩm p
                                    <td
                                        key={(p._id || p.id) + key}
                                        className="py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-700 text-center"
                                    >
                                        { typeof p[key] === 'boolean'
                                            ? (
                                                <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs whitespace-nowrap ${p[key] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {p[key] ? 'Yes' : 'No'}
                                                </span>
                                            )
                                            : Array.isArray(p[key])
                                                ? p[key].join(', ')
                                                : (p[key] != null && String(p[key]).trim() !== '' ? String(p[key]) : <span className="text-gray-400 italic">N/A</span>) // Hiển thị N/A nếu rỗng hoặc null/undefined
                                        }
                                    </td>
                                    )
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

    // Logic useEffect, handleAddSelectedToCompare, handleRemoveProduct, handleClearAll giữ nguyên như code gốc của bạn
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
            // Logic dispatch của bạn giữ nguyên
            // Có thể bạn muốn clear comparison cũ ở đây trước khi dispatch cái mới
            // dispatch(clearComparison()); 
            const result = await dispatch(compareTwoProducts(dropdown1SelectedId, dropdown2SelectedId)); // Giả sử action này đã xử lý đúng logic
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
        // Bạn có thể muốn reset cả dropdowns ở đây nếu cần
        // setDropdown1SelectedId('');
        // setDropdown2SelectedId('');
    };
    
    // Logic showProductSelectors giữ nguyên như code gốc của bạn
    const showProductSelectors = productIdsToCompare.length < 2 && !isLoadingDetails;
    
    if (showProductSelectors) {
        return (
            // Container và box chọn sản phẩm với responsive padding, max-width
            <div className="container mx-auto px-4 py-8 min-h-[70vh] flex flex-col items-center justify-center">
                <div className="w-full max-w-lg sm:max-w-2xl bg-white shadow-2xl rounded-2xl p-6 sm:p-10 border border-gray-100">
                    {/* Tiêu đề responsive */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                        <ColumnsIcon size={28} className="text-blue-600" /> {/* Giảm size icon một chút */}
                        Product Comparison
                    </h1>
                    
                    { allProductsLoading && allAvailableProducts.length === 0 // Hiển thị loading nếu đang fetch allAvailableProducts và chưa có sp nào
                        ? <LoadingSpinner text="Loading available products..." />
                        : (
                            <div className="space-y-4 sm:space-y-6">
                                {/* Grid responsive cho dropdowns: 1 cột trên mobile, 2 cột từ sm trở lên */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label htmlFor="product1-select" className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-700">
                                            First Product
                                        </label>
                                        <select
                                            id="product1-select"
                                            value={dropdown1SelectedId}
                                            onChange={e => setDropdown1SelectedId(e.target.value)}
                                            className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base bg-white"
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
                                        <label htmlFor="product2-select" className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-700">
                                            Second Product
                                        </label>
                                        <select
                                            id="product2-select"
                                            value={dropdown2SelectedId}
                                            onChange={e => setDropdown2SelectedId(e.target.value)}
                                            className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base bg-white"
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
                                    // Logic disabled giữ nguyên như gốc hoặc bạn có thể thêm:
                                    disabled={!dropdown1SelectedId || !dropdown2SelectedId || dropdown1SelectedId === dropdown2SelectedId || isLoadingDetails}
                                    className="w-full mt-4 sm:mt-6 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon size={18} /> {/* Giảm size icon */}
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
        // Container với responsive padding
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
            {/* Header của trang kết quả responsive: xếp chồng trên mobile, hàng ngang từ sm */}
            <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2 sm:gap-3 text-center sm:text-left">
                    <ColumnsIcon size={28} className="text-blue-600" />
                    Comparison Results
                </h1>
                <button
                    onClick={handleClearAll}
                    className="bg-red-500 text-white px-3 py-2 sm:px-5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base whitespace-nowrap" // Đảm bảo text không xuống dòng
                >
                    <XCircleIcon size={16} />
                    Clear All ({productIdsToCompare.length}) {/* Vẫn dùng productIdsToCompare.length như gốc */}
                </button>
            </div>
            
            {/* AI Summary Section - responsive padding, font-size */}
            {productIdsToCompare.length >= 2 && ( // Logic hiển thị giữ nguyên
                <section className="mb-8 sm:mb-10 p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
                        <SparklesIcon size={20} className="text-purple-600" />
                        AI Generated Summary
                    </h2>
                    { isLoadingSummary
                        ? <LoadingSpinner text="AI analyzing products..." />
                        : summaryError
                            ? (
                                <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3">
                                    <AlertTriangleIcon className="text-red-600 flex-shrink-0 mt-1" size={24} smSize={28} /> {/* items-start và mt-1 cho icon */}
                                    <div>
                                        <p className="font-semibold text-red-800 text-sm sm:text-base">Error generating summary:</p>
                                        <p className="text-red-600 text-xs sm:text-sm">{summaryError}</p>
                                    </div>
                                </div>
                            )
                            : (
                                <div>
                                    {summary 
                                        ? (
                                        <p className="text-sm sm:text-base text-gray-700 bg-white p-3 sm:p-4 rounded-lg shadow-md leading-relaxed"> {/* Thêm leading-relaxed */}
                                            {summary}
                                        </p>
                                        )
                                        : ( // Hiển thị khi không có summary và không có lỗi
                                        <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3">
                                            <AlertTriangleIcon className="text-yellow-600 flex-shrink-0 mt-1" size={24} smSize={28} />
                                            <p className="text-yellow-800 text-xs sm:text-sm">
                                                No summary available. This could be due to an issue with the AI or the products selected.
                                            </p>
                                        </div>
                                        )
                                    }
                                </div>
                            )
                    }
                </section>
            )}

            {/* Detailed Comparison Table Section */}
            <section>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                    Detailed Comparison
                </h2>
                { isLoadingDetails
                    ? <LoadingSpinner text="Loading product details..." />
                    : detailsError && productsDetails.length === 0 // Chỉ hiển thị lỗi này nếu không có sp nào trong details
                        ? (
                            <div className="bg-red-50 border border-red-200 p-4 sm:p-6 rounded-lg flex items-start gap-3 sm:gap-4">
                                <AlertTriangleIcon className="text-red-600 flex-shrink-0 mt-1" size={28} smSize={32} />
                                <div>
                                    <p className="font-semibold text-red-800 text-md sm:text-lg mb-1">
                                        Error Loading Product Details
                                    </p>
                                    <p className="text-red-600 text-xs sm:text-sm">{detailsError}</p>
                                </div>
                            </div>
                        )
                        // Luôn hiển thị bảng nếu không loading, hoặc nếu có lỗi nhưng vẫn có productsDetails (có thể fetch được 1 sp)
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