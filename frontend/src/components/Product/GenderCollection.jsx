import { Link } from "react-router-dom"
import psCollectionImage from "../../assets/PlayStation 5.jpg"
import nintendoCollectionImage from "../../assets/Nintendo Switch.jpg"

const GenderCollection = () => {
    return (
        <section className="py-16 px-4 lg:px-0">
            <div className="container mx-auto flex flex-col md:flex-row gap-8">
                <div className="relative flex-1">
                    <img 
                        src={psCollectionImage}
                        alt="PS's Collection"
                        className="w-full h-[700px] object-cover"
                    />
                    <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            PlayStation's Collection
                        </h2>
                        <Link to="/collections/all?gender=PS" className="text-gray-900 underline">
                            Shop Now
                        </Link>
                    </div>
                </div>
                
                <div className="relative flex-1">
                    <img 
                        src={nintendoCollectionImage}
                        alt="Nintendo's Collection"
                        className="w-full h-[700px] object-cover"
                    />
                    <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Nintendo's Collection
                        </h2>
                        <Link to="/collections/all?gender=Nintendo" className="text-gray-900 underline">
                            Shop Now
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default GenderCollection