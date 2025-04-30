import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/slices/adminProductSlice"; 
import axios from "axios";
import { toast } from "sonner"; 

const AddProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { loading, error } = useSelector((state) => state.adminProducts || {}); 
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        discountPrice: 0, 
        countInStock: 0,
        sku: "",          
        category: "",     
        brand: "",       
        sizes: [],
        colors: [],
        display: [],      
        condition: [],    
        images: [],
        tags: [],         
        isFeatured: false,
        isPublished: false 
    });

    const [uploading, setUploading] = useState(false); 

     useEffect(() => {
         if (user && user.role !== "admin") {
             navigate("/");
             toast.error("Unauthorized access");
         }
     }, [user, navigate]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

     const handleListChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({
            ...prevData,
            [name]: value.split(",").map(item => item.trim()).filter(item => item !== "") 
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        try {
            setUploading(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/upload`, 
                uploadFormData,
                {
                    headers: {
                         "Content-Type": "multipart/form-data",
                        
                          Authorization: `Bearer ${localStorage.getItem("userToken")}`
                        }
                }
            );
            setProductData((prevData) => ({
                ...prevData,
                images: [...prevData.images, { url: data.imageUrl, altText: "" }], 
            }));
            setUploading(false);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error(error?.response?.data?.message || "Image upload failed.");
            setUploading(false);
        }
    };

     const handleRemoveImage = (indexToRemove) => {
        setProductData((prevData) => ({
            ...prevData,
            images: prevData.images.filter((_, index) => index !== indexToRemove)
        }));
    };


    // --- Handler Submit Form ---
    const handleSubmit = (e) => {
        e.preventDefault();
         // Thêm kiểm tra các trường required cơ bản ở đây nếu muốn
         if (!productData.name || !productData.description || !productData.price || !productData.countInStock || !productData.sku || !productData.category || !productData.condition || productData.condition.length === 0) {
            toast.error("Please fill in all required fields.");
            return;
        }
        console.log("Submitting new product data:", productData); 
        dispatch(createProduct(productData)) 
            .unwrap()
            .then((newProduct) => {
                toast.success("Product added successfully!");
                navigate("/admin/products"); 
                navigate(`/admin/products/${newProduct._id}/edit`);
            })
            .catch((err) => {
                console.error("Failed to add product:", err);
                toast.error(err?.message || "Failed to add product.");
            });
    };

    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white my-10">
            <h2 className="text-3xl font-bold mb-6 text-center">Add New Product</h2>
            {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>} 
            <form onSubmit={handleSubmit} className="space-y-6">
               
                <div>
                    <label className="block font-semibold mb-2">Product Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={4}
                        required
                    />
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-2">Price <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="price"
                            value={productData.price}
                            onChange={handleChange}
                             min="0" 
                            step="0.01" 
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                     <div>
                        <label className="block font-semibold mb-2">Discount Price</label>
                        <input
                            type="number"
                            name="discountPrice"
                            value={productData.discountPrice}
                            onChange={handleChange}
                             min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-2">Count In Stock <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="countInStock"
                            value={productData.countInStock}
                            onChange={handleChange}
                            min="0" 
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2">SKU <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="sku"
                            value={productData.sku}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="category"
                            value={productData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            placeholder="e.g., Console, Game, Accessory"
                        />
                    </div>
                     <div>
                        <label className="block font-semibold mb-2">Brand</label>
                        <input
                            type="text"
                            name="brand"
                            value={productData.brand}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                 <div>
                    <label className="block font-semibold mb-2">Sizes <span className="text-sm text-gray-500">(comma-separated)</span></label>
                    <input
                        type="text"
                        name="sizes"
                        value={productData.sizes.join(", ")}
                        onChange={handleListChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Slim,Normal,Lite"
                    />
                 </div>
                 <div>
                    <label className="block font-semibold mb-2">Colors <span className="text-sm text-gray-500">(comma-separated, e.g., Black, White, Red)</span></label>
                    <input
                        type="text"
                        name="colors"
                        value={productData.colors.join(", ")}
                        onChange={handleListChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder=""
                    />
                 </div>
                 <div>
                    <label className="block font-semibold mb-2">Display <span className="text-sm text-gray-500">(comma-separated)</span></label>
                    <input
                        type="text"
                        name="tags"
                        value={productData.tags.join(", ")}
                        onChange={handleListChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., new, sale, featured"
                    />
                 </div>
                 <div>
                    <label className="block font-semibold mb-2">Condition <span className="text-red-500">*</span> <span className="text-sm text-gray-500">(comma-separated)</span></label>
                    <input
                        type="text"
                        name="condition"
                        value={productData.condition.join(", ")}
                        onChange={handleListChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                         placeholder="e.g., New, Used - Like New"
                    />
                 </div>
                <div>
                    <label className="block font-semibold mb-2">Upload Images</label>
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        accept="image/*" 
                        multiple 
                    />
                     {uploading && <p className="text-indigo-600 mt-2">Uploading Image...</p>}
                    <div className="flex flex-wrap gap-4 mt-4">
                        {productData.images.map((image, index) => (
                             <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={image.altText || "Product Image"}
                                    className="w-24 h-24 object-cover rounded-md shadow-md"
                                />
                                <button
                                    type="button" 
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs -mt-1 -mr-1 hover:bg-red-700"
                                    aria-label="Remove image"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    className={`w-full bg-green-500 text-white py-3 px-4 rounded-md transition-colors duration-200 ${loading ? "cursor-not-allowed opacity-50" : "hover:bg-green-600"}`}
                    disabled={loading || uploading} 
                >
                    {loading ? "Adding..." : "Add Product"}
                </button>
            </form>
        </div>
    );
};

export default AddProductPage;