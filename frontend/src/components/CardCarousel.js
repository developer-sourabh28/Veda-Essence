import React, { useEffect, useState } from 'react'
import axios from 'axios';
import api from '../api/axiosConfig';

export default function CardCarousel({ experience }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [cards, setCard] = useState([]);

  const handleNext = () => {
    setCurrentCard((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
  }

  const handlePrev = () => {
    setCurrentCard((prev) => Math.max(0, prev - 1));
  }

  useEffect(() => {
    fetchCards();
  }, [])

  const fetchCards = async () => {
    try {
      const response = await api.get('/car'`,
        { withCredentials: true }
      )
      setCard(response.data)
    } catch (error) {
      alert('Failed to fetch cards')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h2 className="text-white text-lg sm:text-xl font-bold italic text-center mb-6">
        ~The Essence of Our Customer's Experience~
      </h2>
      
      <div className="relative bg-black bg-opacity-10 backdrop-blur-md border-2 border-white/30 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="text-gray-400 hover:text-white transition-colors text-2xl sm:text-3xl focus:outline-none"
            disabled={currentCard === 0}
          >
            &#60;
          </button>

          {/* Card Content */}
          {cards.length > 0 && (
            <div className="flex-1 mx-4 text-center">
              {cards[currentCard].image && (
                <div className="mb-4">
                  <img
  src={`${process.env.REACT_APP_API_URL}/${cards[currentCard].image}`}
  alt={cards[currentCard].name}
  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover"
/>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-white text-lg sm:text-xl font-semibold">
                  {cards[currentCard].name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {cards[currentCard].profile}
                </p>
                <p className="text-white text-sm sm:text-base mt-4">
                  {cards[currentCard].description}
                </p>
              </div>
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="text-gray-400 hover:text-white transition-colors text-2xl sm:text-3xl focus:outline-none"
            disabled={currentCard === cards.length - 1}
          >
            &#62;
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentCard ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
