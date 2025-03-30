import { BrowserRouter, Route, Routes } from "react-router-dom"
import UserLayout from "./components/Layout/UserLayout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import {Toaster} from "sonner"
import Register from "./pages/Register"
import Profile from "./pages/Profile"

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
          </Route>
          <Route>{ }</Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App