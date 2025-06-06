import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Navbar({ OnCartClick, OnCategoryClick, OnArrivalClick, selectedSort, showBestSeller, setShowBestSeller, showCrazyDeals, setShowCrazyDeals, showNewArrivals, setShowNewArrivals}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/logout", {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.log("Logout failed", error.response?.data || error.message);
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-gray-900 to-black px-4 py-4 relative shadow-lg">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <select 
            className="bg-transparent text-white border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:border-white transition-all duration-300 hover:border-white"
            defaultValue="All" 
            onChange={OnCategoryClick}
          >
            <option value="All" className="bg-gray-900">All</option>
            <option value="female" className="bg-gray-900">Female</option>
            <option value="male" className="bg-gray-900">Male</option>
            <option value="unisex" className="bg-gray-900">Unisex</option>
          </select>

          <button 
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              showNewArrivals 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white border-gray-400 hover:border-white'
            }`}
            onClick={() => setShowNewArrivals(!showNewArrivals)}
          >
            {showNewArrivals ? 'All' : 'New Arrivals'}
          </button>

          <button 
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              showBestSeller 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white border-gray-400 hover:border-white'
            }`}
            onClick={() => setShowBestSeller(!showBestSeller)}
          >
            {showBestSeller ? 'All' : 'BestSeller'}
          </button>

          <button 
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              showCrazyDeals 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white border-gray-400 hover:border-white'
            }`}
            onClick={() => setShowCrazyDeals(!showCrazyDeals)}
          >
            {showCrazyDeals ? 'All' : 'Crazy Deals 🎉'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="bg-transparent text-white px-4 py-2 border border-gray-400 rounded-lg hover:border-white transition-all duration-300 flex items-center gap-2"
            onClick={OnCartClick}
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Cart</span>
          </button>

          <button 
            className="bg-transparent text-white px-4 py-2 border border-gray-400 rounded-lg hover:border-white transition-all duration-300 flex items-center gap-2"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-between items-center">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white text-2xl hover:text-gray-300 transition-colors duration-300"
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <div className="flex gap-3">
          <button 
            className="bg-transparent text-white px-3 py-2 border border-gray-400 rounded-lg hover:border-white transition-all duration-300"
            onClick={OnCartClick}
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </button>
          
          <button 
            className="bg-transparent text-white px-3 py-2 border border-gray-400 rounded-lg hover:border-white transition-all duration-300"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-900 border-t border-gray-700 py-4 px-4 space-y-3 z-50 shadow-lg">
          <select 
            className="w-full bg-transparent text-white border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:border-white"
            defaultValue="All" 
            onChange={OnCategoryClick}
          >
            <option value="All" className="bg-gray-900">All</option>
            <option value="female" className="bg-gray-900">Female</option>
            <option value="male" className="bg-gray-900">Male</option>
            <option value="unisex" className="bg-gray-900">Unisex</option>
          </select>

          <button 
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
              showNewArrivals 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white border-gray-400 hover:border-white'
            }`}
            onClick={() => setShowNewArrivals(!showNewArrivals)}
          >
            {showNewArrivals ? 'All' : 'New Arrivals'}
          </button>

          <button 
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
              showBestSeller 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white border-gray-400 hover:border-white'
            }`}
            onClick={() => setShowBestSeller(!showBestSeller)}
          >
            {showBestSeller ? 'All' : 'BestSeller'}
          </button>

          <button 
            className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
              showCrazyDeals 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white border-gray-400 hover:border-white'
            }`}
            onClick={() => setShowCrazyDeals(!showCrazyDeals)}
          >
            {showCrazyDeals ? 'All' : 'Crazy Deals 🎉'}
          </button>
        </div>
      )}
    </nav>
  );
}
