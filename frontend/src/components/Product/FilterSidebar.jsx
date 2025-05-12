import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState(
        {
            category: "",
            size: "",
            condition: "",
            color: "",
            display: "",
            minPrice: 0,
            maxPrice: 500,
        }
    );

    const [priceRange, setPriceRange] = useState([0, 500]);
    const categories = ["Game", "Console"];
    const colors = [
        "Red",
        "Black",
        "Green",
        "Yellow",
        "Gray",
        "White",
        "Pink",
        "Blue"
    ];
    const displays = ["OLED", "FULL HD"];
    const conditions = ["New", "Used"];
    const sizes = ["Normal", "Lite"];

    useEffect(() => {
        const paramsFromUrl = Object.fromEntries([...searchParams]);
        const defaultSidebarFilters = {
            category: "",
            size: "",
            condition: "",
            color: "",
            display: "",
            minPrice: 0,
            maxPrice: 500,
        };

        let newInitialFilters = {};
        Object.keys(defaultSidebarFilters).forEach(key => {
            if (paramsFromUrl[key] !== undefined) {
                if (key === "minPrice" || key === "maxPrice") {
                    newInitialFilters[key] = Number(paramsFromUrl[key]);
                } else {
                    
                    if (typeof paramsFromUrl[key] === 'string' && (key === "size" || key === "color")) {
                         newInitialFilters[key] = paramsFromUrl[key];
                    } else {
                        newInitialFilters[key] = paramsFromUrl[key];
                    }
                }
            } else {
                newInitialFilters[key] = defaultSidebarFilters[key];
            }
        });

        setFilters(newInitialFilters);
        setPriceRange([newInitialFilters.minPrice, newInitialFilters.maxPrice]);
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const { name, value, checked, type } = e.target;
        let newFiltersState = { ...filters };

        if (type === "checkbox") {
       
            const currentValues = Array.isArray(newFiltersState[name]) ? newFiltersState[name] : (newFiltersState[name] ? [newFiltersState[name]] : []);
            if (checked) {
                newFiltersState[name] = [...currentValues, value];
            } else {
                newFiltersState[name] = currentValues.filter((item) => item !== value);
            }
       
        } else {
            newFiltersState[name] = value;
        }
        setFilters(newFiltersState);
        UpdateURLParams(newFiltersState);
    };

    const UpdateURLParams = (newFiltersFromState) => {
        const params = new URLSearchParams(searchParams.toString());
        const defaultSidebarValues = {
            category: "",
            size: "",
            condition: "",
            color: "",
            display: "",
            minPrice: 0,
            maxPrice: 500, 
        };
        Object.keys(newFiltersFromState).forEach((key) => {
            const value = newFiltersFromState[key]; 
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    params.set(key, value.join(",")); 
                } else {
                    params.delete(key); 
                }
            }
            else if (key === "minPrice") {
                if (Number(newFiltersFromState.maxPrice) < defaultSidebarValues.maxPrice) {
                    params.set(key, String(value)); 
                } else {
                    params.delete(key);
                }
            } else if (key === "maxPrice") {
                if (Number(value) < defaultSidebarValues.maxPrice) {
                    params.set(key, String(value));
                } else {
                    params.delete(key);
                }
            }
            else if (defaultSidebarValues.hasOwnProperty(key)) { 
                if (value !== undefined && value !== null && String(value) !== defaultSidebarValues[key] && String(value) !== "") {
                    params.set(key, String(value));
                } else {
                    params.delete(key);
                }
            }
        });
        if (params.get("minPrice") === "0" && params.get("maxPrice") === String(defaultSidebarValues.maxPrice)) {
            params.delete("minPrice");
            params.delete("maxPrice");
        }
        
        setSearchParams(params, { replace: true });
    };

    const handlePriceChange = (e) => {
        const newMaxPrice = e.target.value; 
        setPriceRange([filters.minPrice, newMaxPrice]); 

        const newFiltersForUpdate = { ...filters, maxPrice: Number(newMaxPrice) };
       
        const updatedFiltersWithPrice = {...filters, minPrice: 0, maxPrice: Number(newMaxPrice)};
        setFilters(updatedFiltersWithPrice); 
        UpdateURLParams(updatedFiltersWithPrice); 
    };

    return (
        <div className="p-4">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>
            {/* Category */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Category</label>
                {categories.map((category) => (
                    <div key={category} className="flex items-center mb-1">
                        <input
                            type="radio"
                            name="category"
                            value={category}
                            onChange={handleFilterChange}
                            checked={filters.category === category}
                            className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300" />
                        <span className="text-gray-700">{category}</span>
                    </div>
                ))}
                 {/* Nút xóa bộ lọc category */}
                 {filters.category && (
                    <button 
                        onClick={() => handleFilterChange({ target: { name: 'category', value: '' }})}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                        Clear Category
                    </button>
                )}
            </div>
            {/* Size */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Size</label>
                {sizes.map((size) => (
                    <div key={size} className="flex items-center mb-1">
                        <input
                            type="radio"
                            name="size"
                            value={size}
                            onChange={handleFilterChange}
                            checked={filters.size === size}
                            className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300" />
                        <span className="text-gray-700">{size}</span>
                    </div>
                ))}
                {filters.size && (
                    <button 
                        onClick={() => handleFilterChange({ target: { name: 'size', value: '' }})}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                        Clear Size
                    </button>
                )}
            </div>
            {/* Condition */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Condition</label>
                {conditions.map((condition) => (
                    <div key={condition} className="flex items-center mb-1">
                        <input
                            type="radio"
                            name="condition"
                            value={condition}
                            onChange={handleFilterChange}
                            checked={filters.condition === condition}
                            className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300" />
                        <span className="text-gray-700">{condition}</span>
                    </div>
                ))}
                {filters.condition && (
                    <button 
                        onClick={() => handleFilterChange({ target: { name: 'condition', value: '' }})}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                        Clear Condition
                    </button>
                )}
            </div>
            {/* Display */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Display</label>
                {displays.map((display) => (
                    <div key={display} className="flex items-center mb-1">
                        <input
                            type="radio"
                            name="display"
                            value={display}
                            onChange={handleFilterChange}
                            checked={filters.display === display}
                            className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300" />
                        <span className="text-gray-700">{display}</span>
                    </div>
                ))}
                {filters.display && (
                    <button 
                        onClick={() => handleFilterChange({ target: { name: 'display', value: '' }})}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                        Clear Display
                    </button>
                )}
            </div>
            {/* Colors */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <button
                            type="button" 
                            key={color}
                            name="color" 
                            value={color} 
                            onClick={handleFilterChange} 
                            className={`w-8 h-8 rounded-full border border-gray-300 cursor-pointer transition hover:scale-105
                            ${filters.color === color ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                        />
                    ))}
                </div>
                {filters.color && (
                    <button 
                        onClick={() => handleFilterChange({ target: { name: 'color', value: '' }})}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-2" // Thêm mt-2 cho khoảng cách
                    >
                        Clear Color
                    </button>
                )}
            </div>
            {/* Price Range */}
            <div className="mb-8">
                <label className="block text-gray-600 font-medium mb-2">
                    Price Range: ${filters.minPrice} - ${priceRange[1]} 
                </label>
                <input
                    type="range"
                    name="priceRangeSlider"
                    min={0} max={500} 
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-gray-600 mt-2">
                    <span>$0</span>
                    <span>$500</span>
                </div>
            </div>
        </div>);

};
export default FilterSidebar;