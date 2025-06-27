// src/router/index.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import BlogDetail from "@/pages/BlogDetail"
import Login from "@/pages/Login"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/login" element={<Login />} />
        {/* Add more routes later like /write, /signup, /profile */}
      </Routes>
    </BrowserRouter>
  )
}
