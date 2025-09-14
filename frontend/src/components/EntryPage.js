import React, { useRef, useState } from 'react';
import axios from 'axios';
import CardCarousel from './CardCarousel';
import { useNavigate } from 'react-router-dom';

export default function EntryPage() {
  const [cards, setCards] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profile, setProfile] = useState('');
  const [file, setFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const aboutSectionRef = useRef(null);
  const topSectionRef = useRef(null);
  const teamSectionRef = useRef(null);

  const handleAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClose = () => {
    topSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTeam = () => {
    teamSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !name || !description || !profile) {
      alert('All fields are required');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('profile', profile);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/cards',
        formData,
        // {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // }
      );
      alert(response.data.message);
      setCards([...cards, response.data.post]);
      // Reset form
      setName('');
      setDescription('');
      setProfile('');
      setFile(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error uploading post:', error.response?.data || error.message);
      alert('Failed to add post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const navigateSignup = () => {
    navigate('/signup', { replace: true });
  };

  const handleHomeBtn = () => {
    setShowMsg(true);
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden" ref={topSectionRef}>
      {/* Message Modal */}
      {showMsg && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-70">
          <div className="relative bg-gray-900 border-2 border-white rounded-lg p-6 w-[90%] max-w-md shadow-2xl">
            <h3 className="text-white text-base sm:text-lg mb-6 text-center">
              You need to log in to continue shopping. We recommend logging in first to fully enjoy your shopping experience.
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/home')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
              >
                Home
              </button>
            </div>
            <button
              onClick={() => setShowMsg(false)}
              className="absolute top-2 right-2 text-white hover:text-red-400 transition-colors duration-200"
              aria-label="Close modal"
            >
              <i className="text-xl fa-regular fa-circle-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 relative z-10">
        <nav className="w-full sm:w-auto flex justify-center">
          <div className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-2 py-2 flex gap-2 sm:gap-4 backdrop-blur-sm">
            <button
              onClick={handleHomeBtn}
              className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-4 py-2 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all duration-200 text-sm whitespace-nowrap"
            >
              Home <i className="ml-2 fa-solid fa-house"></i>
            </button>
            <button
              onClick={handleAbout}
              className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-4 py-2 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all duration-200 text-sm whitespace-nowrap"
            >
              About
            </button>
            <button
              onClick={navigateSignup}
              className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-4 py-2 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all duration-200 text-sm whitespace-nowrap"
            >
              Register
            </button>
          </div>
        </nav>

        <div className="flex justify-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-4 py-2 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all duration-200 text-sm h-10 mt-2 whitespace-nowrap"
          >
            {isOpen ? 'Close Form' : 'Share Your Experience'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative px-4 sm:px-8 pt-8 sm:pt-16 pb-32 overflow-hidden">
        <div className="max-w-2xl z-10 relative">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-6xl mb-6 font-bold leading-tight">
            Discover your best <br/> 
            <span className="italic text-red-400">Perfume</span> at 
            <span className="italic text-gray-400"> Veda Essence</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed">
            Embrace the Power of Fragrance and Transform <br className="hidden sm:block"/>
            Your Everyday Moments into Extraordinary Experiences.
          </p>
        </div>

        {/* Background Image */}
        <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full">
          <img
            className="w-full h-full object-cover"
            src='EntryBlack.jpg'
            alt='Perfume collection background'
            style={{ opacity: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        </div>
      </div>

      {/* Experience Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-70">
          <div className="bg-gray-900 rounded-lg p-6 w-[90%] max-w-lg relative border border-gray-600 shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Share Your Experience</h2>
            <form onSubmit={handleCardSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2  w-full text-white file:bg-gray-700 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:mr-3"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your experience"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-none"
                  rows="3"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">Profile</label>
                <input
                  type="text"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  placeholder="Enter your profile"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sharing...' : 'Share Experience'}
                </button>
              </div>
            </form>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition-colors duration-200"
              aria-label="Close form"
            >
              <i className="text-2xl fa-regular fa-circle-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Card Carousel */}
      <div className="relative z-10 px-4 mb-16">
        <CardCarousel experience={cards} />
      </div>

      {/* Product Cards */}
      <div className="px-4 sm:px-8 mb-16">
        <h2 className="text-white text-2xl sm:text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* First Card */}
          <div className="bg-gray-900 bg-opacity-80 border-2 border-gray-600 rounded-lg p-6 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4">
              <img
                className="w-24 h-24 object-cover rounded-lg shadow-lg"
                src='images/cobalt-rush.jpg'
                alt="Cobalt Rush perfume"
              />
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-1">Cobalt Rush</h3>
                <p className="text-gray-400 text-sm mb-3">Men's Perfume</p>
                <button
                  onClick={handleHomeBtn}
                  className="border-2 border-white text-black px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-black transition-all duration-200 font-semibold"
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>

          {/* Second Card */}
          <div className="bg-gray-900 bg-opacity-80 border-2 border-gray-600 rounded-lg p-6 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4">
              <img
                className="w-24 h-24 object-cover rounded-lg shadow-lg"
                src='images/mystic-rose.jpg'
                alt="Mystic Rose perfume"
              />
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-1">Mystic Rose</h3>
                <p className="text-gray-400 text-sm mb-3">Women's Perfume</p>
                <button
                  onClick={handleHomeBtn}
                  className="border-2 border-white text-black px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-black transition-all duration-200 font-semibold"
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>

          {/* Third Card */}
          <div className="bg-gray-900 bg-opacity-80 border-2 border-gray-600 rounded-lg p-6 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4">
              <img
                className="w-24 h-24 object-cover rounded-lg shadow-lg"
                src='images/Lattafa-Khamrah.jpeg'
                alt="Velvet Sky perfume"
              />
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-1">Velvet Sky</h3>
                <p className="text-gray-400 text-sm mb-3">Unisex Perfume</p>
                <button
                  onClick={handleHomeBtn}
                  className="border-2 border-white text-black px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-black transition-all duration-200 font-semibold"
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About, Team, and Contact Sections */}
      <div className="space-y-8">
        <div ref={aboutSectionRef} className="px-4">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-8 text-center">About Us</h2>
          {/* Uncomment when image is available */}
          {/* <img className="w-full h-auto rounded-lg shadow-lg" src='images/history.png' alt='Company history' /> */}
        </div>
        
        <div ref={teamSectionRef} className="px-4">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-8 text-center">Our Team</h2>
          <img className="w-full h-auto rounded-lg shadow-lg" src='images/team.png' alt='Team members' />
        </div>
        
        <div className="px-4">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-8 text-center">Contact Us</h2>
          <img className="w-full h-auto rounded-lg shadow-lg" src='images/perfume-contact.PNG' alt='Contact information' />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-600 mt-16 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Veda Essence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}