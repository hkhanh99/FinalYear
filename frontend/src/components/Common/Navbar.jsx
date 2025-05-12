import { Link } from "react-router-dom"
import { HiOutlineShoppingBag } from "react-icons/hi";
import { HiOutlineUser } from "react-icons/hi";
import { HiBars3BottomRight } from "react-icons/hi2";
import SearchBar from "./SearchBar";
import CartDrawer from "../Layout/CartDrawer";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { MdCompareArrows } from "react-icons/md";

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);
    const { cart } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.auth)
    const { productIdsToCompare } = useSelector((state) => state.comparison || { productIdsToCompare: [] });
    const cartItemCount = cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;
    const compareItemCount = productIdsToCompare?.length || 0;

    const toggleNavDrawer = () => {
        setNavDrawerOpen(!navDrawerOpen);
    }

    const toggleCartDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <>
            <nav className="container mx-auto flex items-center justify-between py-4 px-6">
                <div>
                    <Link to="/" className="text-2xl font-medium">
                        GameZone
                    </Link>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link to="/collections/all?brand=Nintendo" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        Nintendo
                    </Link>
                    <Link to="/collections/all?brand=Playstation" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        PS5
                    </Link>
                    <Link to="/collections/all?category=Console" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        Console
                    </Link>
                    <Link to="/collections/all?category=Game" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        Games
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    {user && user.role === "admin" && (
                        <Link to="/admin" className="block bg-black px-2 rounded text-sm text-white">Admin</Link>
                    )}
                    <Link to="/profile" className="hover:text-black">
                        <HiOutlineUser className="h-6 w-6 text-gray-700" />
                    </Link>
                    <button
                        onClick={toggleCartDrawer}
                        className="relative hover:textblack">
                        <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
                        {cartItemCount > 0 && (<span className="absolute -top-1 bg-red text-white text-xs rounded-full px-2 py-0.5">
                            {cartItemCount}
                        </span>)}

                    </button>

                    {/* Search */}
                    <div className="overflow-hidden">
                        <SearchBar />
                    </div>

                    {/* Compare Products Button */}
                    <Link to="/compare" className="relative text-gray-700 hover:text-blue-600 transition-colors" title="Compare Products">
                        <MdCompareArrows className="h-6 w-6" />
                        {compareItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                                {compareItemCount}
                            </span>
                        )}
                    </Link>

                    <button onClick={toggleNavDrawer} className="md:hidden">
                        <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
            </nav>
            <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

            {/* Mobile Navigate */}
            <div className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${navDrawerOpen ? "translate-x-0 " : "-translate-x-full"}`}>
                <div className="flex justify-end p-4">
                    <button onClick={toggleNavDrawer}>
                        <IoMdClose className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Menu</h2>
                    <nav className="space-y-4">
                        <Link to="/collections/all?brand=Nintendo" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
                            Nintendo
                        </Link>
                        <Link to="/collections/all?brand=Playstation" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
                            PS5
                        </Link>
                        <Link to="/collections/all?category=Console" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
                            Console
                        </Link>
                        <Link to="/collections/all?category=Game" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
                            Game
                        </Link>
                        <Link to="/compare" onClick={toggleNavDrawer} className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors relative">
                            So Sánh Sản Phẩm
                            {compareItemCount > 0 && (
                                <span className="ml-2 bg-blue-500 text-white text-xs font-semibold rounded-full h-5 w-5 inline-flex items-center justify-center">
                                    {compareItemCount}
                                </span>
                            )}
                        </Link>
                    </nav>
                </div>
            </div>
        </>
    );
};
export default Navbar;