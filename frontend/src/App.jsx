import { BrowserRouter, Route, Routes } from "react-router-dom"
import UserLayout from "./components/Layout/UserLayout"
import Home from "./pages/Home"
import {Toaster} from "sonner"

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Toaster position="top-right"/>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route>{ }</Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App