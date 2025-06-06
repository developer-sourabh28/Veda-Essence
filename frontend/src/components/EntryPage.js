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
  const [showMsg,setShowMsg] = useState(false);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const aboutSectionRef = useRef(null);
  const topSectionRef = useRef(null);
  const teamSectionRef = useRef(null);

  const handleAbout = () => {
    aboutSectionRef.current?.scrollIntoView({behavior : "smooth"})
  }

  const handleClose = () => {
    topSectionRef.current?.scrollIntoView({behavior : "smooth"})
  }

  const handleTeam = () => {
    teamSectionRef.current?.scrollIntoView({behavior:'smooth'})
  }

  const handleCardSubmit = async(e) => {
    e.preventDefault();

    if(!file || !name || !description || !profile){
        alert('All fields are required');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('profile', profile);

    try {
        const response = await axios.post(
            'http://localhost:8000/api/cards',
            formData,
            {
                headers:{
                    'Content-Type' : 'multipart/form-data',
                },
            }
        )
        alert(response.data.message);
        setCards([...cards, response.data.post]);
    } catch (error) {
        console.error('Error uploading post:', error.response?.data || error.message);
        alert('Failed to add post')
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  }

  const navigateSignup = () => {
    navigate('/signup', { replace: true });
  }

  const handleHomeBtn = () => {
   setShowMsg(true);
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Message Modal */}
      {showMsg && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="relative bg-black border-2 border-white rounded-lg p-6 w-[90%] max-w-md">
            <h3 className="text-white text-base sm:text-lg mb-6">
              You need to log in to continue shopping. We recommend logging in first to fully enjoy your shopping experience.
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/home')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Home
              </button>
            </div>
            <button
              onClick={() => setShowMsg(false)}
              className="absolute top-2 right-2 text-white"
            >
              <i className="text-xl fa-regular fa-circle-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 relative z-10">
        <nav className="w-full sm:w-auto flex justify-center">
          <div className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-4 py-2 flex gap-4 sm:gap-6">
            <button
              onClick={handleHomeBtn}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm whitespace-nowrap"
            >
              Home<i className="ml-2 fa-solid fa-house"></i>
            </button>
            <button
              onClick={handleAbout}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              About
            </button>
            <button
              onClick={navigateSignup}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              Register
            </button>
          </div>
        </nav>

        <div className="flex justify-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-black bg-opacity-70 border-2 border-gray-500 rounded-full px-4 py-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
          >
            {isOpen ? 'Close Form' : 'Share Your Experience'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative px-4 sm:px-8 pt-8 sm:pt-16 pb-32">
        <div className="max-w-xl z-10 relative">
          <h1 className="text-white text-2xl sm:text-4xl lg:text-5xl mb-4">
            Discover your best <br/> 
            <span className="italic">Perfume</span> at 
            <span className="italic text-gray-400"> Veda Essence</span>
          </h1>
          <p className="text-white text-sm sm:text-lg">
            Embrace the Power of Fragrance and Transform <br className="hidden sm:block"/>
            Your Everyday Moments into Extraordinary Experiences.
          </p>
        </div>

        {/* Background Image */}
        <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full">
          <img
            className="w-full h-full object-cover bg-gray-500"
            src='EntryBlack.jpg'
            alt='Entry Pic'
            style={{ opacity: 0.8 }}
          />
        </div>
      </div>

      {/* Experience Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[90%] max-w-lg relative">
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-white font-bold whitespace-nowrap">Select image ~</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="bg-white rounded px-3 py-2 w-full"
                />
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full px-3 py-2 rounded"
              />

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                className="w-full px-3 py-2 rounded"
              />

              <input
                type="text"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="Enter Profile"
                className="w-full px-3 py-2 rounded"
              />

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Share
                </button>
              </div>
            </form>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-600"
            >
              <i className="text-2xl fa-regular fa-circle-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Card Carousel */}
      <div className="relative z-10 px-4">
        <CardCarousel experience={cards} />
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 mt-8 sm:mt-16">
        {/* First Card */}
        <div className="bg-transparent border-2 border-white rounded-lg p-4 flex items-center gap-4">
          <img
            className="w-24 h-24 object-cover rounded"
            src='images/cobalt-rush.jpg'
            alt="Cobalt Rush"
          />
          <div>
            <p className="text-white text-lg mb-1">Cabalt Rush</p>
            <p className="text-gray-400 text-sm mb-2">Mens Perfume</p>
            <button
              onClick={handleHomeBtn}
              className="border border-white text-white px-3 py-1 rounded text-sm hover:bg-white hover:text-black transition-colors"
            >
              Explore More
            </button>
          </div>
        </div>

        {/* Second Card */}
        <div className="bg-transparent border-2 border-white rounded-lg p-4 flex items-center gap-4">
          <img
            className="w-24 h-24 object-cover rounded"
            src='images/mystic-rose.jpg'
            alt="Mystic Rose"
          />
          <div>
            <p className="text-white text-lg mb-1">Mystic Rose</p>
            <p className="text-gray-400 text-sm mb-2">Womens Perfume</p>
            <button
              onClick={handleHomeBtn}
              className="border border-white text-white px-3 py-1 rounded text-sm hover:bg-white hover:text-black transition-colors"
            >
              Explore More
            </button>
          </div>
        </div>

        {/* Third Card */}
        <div className="bg-transparent border-2 border-white rounded-lg p-4 flex items-center gap-4">
          <img
            className="w-24 h-24 object-cover rounded"
            src='images/Lattafa-Khamrah.jpeg'
            alt="Lattafa Khamrah"
          />
          <div>
            <p className="text-white text-lg mb-1">Velvet Sky</p>
            <p className="text-gray-400 text-sm mb-2">Unisex Perfume</p>
            <button
              onClick={handleHomeBtn}
              className="border border-white text-white px-3 py-1 rounded text-sm hover:bg-white hover:text-black transition-colors"
            >
              Explore More
            </button>
          </div>
        </div>
      </div>

      {/* About, Team, and Contact Sections */}
      <div className="mt-16 space-y-4">
        <div ref={aboutSectionRef}>
          <img className="w-full h-auto" src='images/history.png' alt='history pic' />
        </div>
        <div>
          <img className="w-full h-auto" src='images/team.png' alt='team pic' />
        </div>
        <div>
          <img className="w-full h-auto" src='images/perfume-contact.PNG' alt='contact pic' />
        </div>
      </div>
    </div>
  );
}
