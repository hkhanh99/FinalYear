
import { useEffect, useState } from "react";
import Hero from "../components/Layout/Hero";
import FeaturedCollection from "../components/Product/FeaturedCollection";
import FeaturesSection from "../components/Product/FeaturesSection";
import GenderCollection from "../components/Product/GenderCollection";
import NewArrivals from "../components/Product/NewArrivals";
import ProductDetails from "../components/Product/ProducDetails";
import ProductGrid from "../components/Product/ProductGrid";
import { useDispatch, useSelector } from "react-redux"
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
import axios from "axios";


const Home = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products)
    const [bestSellerProduct, setBestSellerProduct] = useState();

    useEffect(() => {
        dispatch(fetchProductsByFilters({
            brand: "PlayStation",
            category: "Game",
            limit: 8,
        })
        )
        const fetchBestSeller = async ()=> {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
                )
                setBestSellerProduct(response.data)
            } catch (error) {
                console.error(error)
            }
        }
        fetchBestSeller()
    }, [dispatch])
    return <div>
        <Hero />
        <GenderCollection />
        <NewArrivals />
        <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
        {bestSellerProduct ? (<ProductDetails productId={bestSellerProduct._id} />) : (
            <p className="text-center">Loading Best Seller Products</p>
        )}
        <div className="container mx-auto">
            <h2 className="text-3xl text-center font-bold mb-4">
                Top Games for Playstation
            </h2>
            <ProductGrid products={products} loading={loading} error= {error} />
        </div>
        <FeaturedCollection />
        <FeaturesSection />
    </div>;
}
export default Home;