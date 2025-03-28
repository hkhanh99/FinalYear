import { Link } from "react-router-dom"
import { HiOutlineShoppingBag } from "react-icons/hi";
import { HiOutlineUser } from "react-icons/hi";
import { HiBars3BottomRight } from "react-icons/hi2";
import SearchBar from "./SearchBar";
import CartDrawer from "../Layout/CartDrawer";
import { useState } from "react";

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleCartDrawer = () =>{
        setDrawerOpen(!drawerOpen);
    };

    return (
        <>
            <nav className="container mx-auto flex items-center justify-between py-4 px-6">
                <div>
                    <Link to="/" className="text-2xl font-medium">
                        GameStore
                    </Link>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link to="#" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        Nintendo
                    </Link>
                    <Link to="#" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        PS5
                    </Link>
                    <Link to="#" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        TCG
                    </Link>
                    <Link to="#" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
                        Accessories
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/profile" className="hover:text-black">
                        <HiOutlineUser className="h-6 w-6 text-gray-700" />
                    </Link>
                    <button 
                    onClick={toggleCartDrawer} 
                    className="relative hover:textblack">
                        <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
                        <span className="absolute -top-1 bg-red text-white text-xs rounded-full px-2 py-0.5">
                            4
                        </span>
                    </button>

                    {/* Search */}
                    <div className="overflow-hidden">
                    <SearchBar />
                    </div>

                    <button className="md:hidden">
                        <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
            </nav>
            <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer = {toggleCartDrawer}/>
        </>
    );
};
export default Navbar;