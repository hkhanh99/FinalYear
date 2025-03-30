import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
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
    const categories = ["Games", "Console"];
    const colors = [
        "Red",
        "Black",
        "Green",
        "Yellow",
        "Gray",
        "White",
        "Pink",

    ]
    const displays = ["OLED", "FULL HD"];
    const conditions = ["New", "Used"];
    const sizes = ["Normal", "Lite"]

    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
        setFilters({
            category: params.category || "",
            color: params.color || "",
            size: params.size || "",
            condition: params.condition || "",
            display: params.display || "",
            minPrice: params.minPrice || 0,
            maxPrice: params.maxPrice || 500,
        })
        setPriceRange([0, params.maxPrice || 500])
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const { name, value, checked, type } = e.target;
        let newFilters = { ...filters };

        if (type === "checkbox") {
            if (checked) {
                newFilters[name] = [...(newFilters[name] || []), value];
            } else {
                newFilters[name] = newFilters[name].filter((item) => item !== value);
            }
        } else {
            newFilters[name] = value
        }
        setFilters(newFilters)
        UpdateURLParams(newFilters)
    }

    const UpdateURLParams = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach((key) => {
            if(Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
                params.append(key, newFilters[key].join(","));
            } else if (newFilters[key]) {
                params.append(key, newFilters[key]);
            }
        });
        setSearchParams(params);
        navigate(`?${params.toString()}`)
    }

    const handlePriceChange = (e) => {
        const newPrice = e.target.value;
        setPriceRange([0, newPrice])
        const newFilters = {...filters, minPrice: 0, maxPrice: newPrice};
        setFilters(filters);
        UpdateURLParams(newFilters)

    }

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
            </div>
            {/* Colors */}
            <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <button
                            key={color}
                            name="color"
                            value={color}
                            onClick={handleFilterChange}
                            className={`w-8 h-8 rounded-full border border-gray-300 cursor-pointer transition hover:scale-105
                            ${filters.color === color ? "ring-2 ring-blue-500" : "" }`}
                            style={{ backgroundColor: color.toLowerCase() }}></button>
                    ))}
                </div>
            </div>
            {/* Price Range */}
            <div className="mb-8">
                <label className="block text-gray-600 font-medium mb-2">
                    Price Range
                </label>
                <input
                    type="range" 
                    name="priceRange" 
                    min={0} max={500}
                    value= {priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full h-2 bg-gray-300 rounded-lg apperance-none cursor-pointer" />
                <div className="flex justify-between text-gray-600 mt-2">
                    <span>$0</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>
        </div>)

}
export default FilterSidebar;