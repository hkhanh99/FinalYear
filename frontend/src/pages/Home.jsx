import Hero from "../components/Layout/Hero";
import GenderCollection from "../components/Product/GenderCollection";
import NewArrivals from "../components/Product/NewArrivals";
import ProductDetails from "../components/Product/ProducDetails";

const Home =() => {
    return <div>
        <Hero/>
        <GenderCollection/>
        <NewArrivals/>
        <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
        <ProductDetails/>
    </div>;
}
export default Home;