import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";

const ProductGrid = ({ products, loading, error }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">Error: {error}</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <Link 
                    key={product._id} 
                    to={`/product/${product._id}`} 
                    className="block transform transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg"
                >
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative w-full h-96 mb-4 overflow-hidden">
                            <img 
                                src={product.images[0].url}
                                alt={product.images[0].altText || product.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 bg-white/70 p-2 rounded-full">
                                <ShoppingCart 
                                    className="text-gray-700 hover:text-blue-500 transition-colors" 
                                    size={20} 
                                />
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
                                <div className="flex items-center text-yellow-500">
                                    <Star size={16} fill="currentColor" className="mr-1" />
                                    <span className="text-xs text-gray-600">{product.rating || ''}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-blue-600 font-bold text-sm">
                                    ${product.price.toFixed(2)}
                                </p>
                                <button 
                                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs hover:bg-blue-600 transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductGrid;