import { BrowserRouter, Route, Routes } from "react-router-dom"
import UserLayout from "./components/Layout/UserLayout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import {Toaster} from "sonner"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import CollectionPage from "./pages/CollectionPage"
import ProductDetails from "./components/Product/ProducDetails"
import Checkout from "./components/Cart/Checkout"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"
import OrderDetailsPage from "./pages/OrderDetailsPage"
import MyOrdersPage from "./pages/MyOrdersPage"

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Toaster position="top-right"/>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="collections/:collection" element={<CollectionPage />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="checkout" element ={<Checkout/>} />
            <Route path="order-confirmation" element={<OrderConfirmationPage/>} />
            <Route path="order/:id" element= {<OrderDetailsPage/>} />
            <Route path="my-orders" element= {<MyOrdersPage/>} />
          </Route>
          <Route>{ }</Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App