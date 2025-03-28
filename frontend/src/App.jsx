import {BrowserRouter, Route, Routes} from "react-router-dom"
import UserLayout from "./components/Layout/UserLayout"

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserLayout/>}>{ }</Route>
          <Route>{ }</Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App