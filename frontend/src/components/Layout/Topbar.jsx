import { TiSocialFacebook } from "react-icons/ti";
import { TiSocialYoutube } from "react-icons/ti";
import { FaTiktok } from "react-icons/fa";
const Topbar = () => {
    return (
        <div className="bg-black text-white">
            <div className="container mx-auto mx-auto flex justify-between items-center py-3 px-4">
                <div className="hidden md:flex items-center space-x-4">
                    <a href='https://www.facebook.com/khanh.nguyen.368756/' className="hover:text-gray-300">
                        <TiSocialFacebook className="h-7 w-7" />
                    </a>
                    <a href='https://www.youtube.com/@Windjr2599' className="hover:text-gray-300">
                        <TiSocialYoutube className="h-7 w-7" />
                    </a>
                    <a href='https://www.tiktok.com/@alwaysstrive19' className="hover:text-gray-300">
                        <FaTiktok className="h-5 w-5" />
                    </a>
                </div>
                <div className="text-sm text-center">
                    <span>We ship worldwide - Fast and reliable shipping!</span>
                </div>
                <div className="text-sm hidden md:block">
                    <a href="tel:+(84)896229100" className="hover:text-gray-300">
                        +(84) 896 229 100
                    </a>
                </div>
            </div>
        </div>
    )
}
export default Topbar