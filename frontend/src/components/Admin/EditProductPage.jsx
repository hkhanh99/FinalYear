import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductDetails } from "../../redux/slices/productsSlice";
import { updateProduct } from "../../redux/slices/adminProductSlice";
import axios from "axios";

const EditProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedProduct, loading, error } = useSelector((state) => state.products)
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        countInStock: 0,
        category: "",
        sizes: [],
        condition: "",
        display: "",
        colors: [],
        brand: "",
        images: []
    })

    const [uploading, setUploading] = useState(false) //img loading state

    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails(id))
        }
    }, [dispatch, id])

    useEffect(() => {
        if (selectedProduct) {
            setProductData(selectedProduct)
        }
    }, [selectedProduct])
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({ ...prevData, [name]: value }))
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return; // Thêm kiểm tra nếu không chọn file

        // SỬA LẠI TỪ ĐÂY:
        const uploadFormData = new FormData(); // 1. Đổi tên biến, 2. Dùng FormData()
        uploadFormData.append("image", file);
        try {
            setUploading(true)
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, uploadFormData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            setProductData((prevData) => ({
                ...prevData,
                images: [...prevData.images, { url: data.imageUrl, altText: "" }],
            }));
            setUploading(false);
        } catch (error) {
            console.error("Image upload error:", error); 
            setUploading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProduct({id,productData}));
        navigate("/admin/products")
    }

    if(loading) return <p>Loading...</p>
    if(error) return <p>Error:{error}</p>

    return <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
        <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Product Name</label>
                <input type="text" name="name" value={productData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Description</label>
                <textarea name="description" value={productData.description}
                    className="w-full border border-gray-300 rounded-md p-2"
                    onChange={handleChange}
                    rows={4}
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Price</label>
                <input type="number" name="price" value={productData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Count In Stock</label>
                <input type="number" name="countInStock" value={productData.countInStock}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">SKU</label>
                <input type="number" name="sku" value={productData.sku}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Sizes</label>
                <input type="text"
                    name="size"
                    value={productData.sizes.join(", ")}
                    onChange={(e) => setProductData({ ...productData, sizes: e.target.value.split(",").map((size) => size.trim()) })}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Colors</label>
                <input type="text" name="colors" value={productData.colors.join(", ")}
                    onChange={(e) => setProductData({ ...productData, colors: e.target.value.split(",").map((color) => color.trim()) })}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-2">Upload Image</label>
                <input type="file" onChange={handleImageUpload}></input>
                {uploading && <p>Uploading Image...</p>}
                <div className="flex gap-4 mt-4">
                    {productData.images.map((image, index) => (
                        <div key={index}>
                            <img src={image.url} alt={image.altText || "Product Image"}
                                className="w-20 h-20 object-cover rounded-md shadow-md"
                            />
                        </div>

                    ))}
                </div>
            </div>
            <button type="submit" className="w-full bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                Update Product
            </button>
        </form>
    </div>
}

export default EditProductPage