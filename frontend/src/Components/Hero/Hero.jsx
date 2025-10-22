

// export default Hero  last edited 16/10/2025
import React, { useState, useEffect } from 'react';
import './Hero.css';
// Import your images
import hero_image from '../Assets/hero_image.png';
import hero_image2 from '../Assets/hero_image2.png';
import hero_image3 from '../Assets/hero_image3.png';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel data - only images
  const carouselSlides = [
    {
      image: hero_image,
    },
    {
      image: hero_image2,
    },
    {
      image: hero_image3,
    }
  ];

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className='hero-carousel'>
      {/* Navigation Arrows */}
      <button className="carousel-btn carousel-prev" onClick={prevSlide}>
        &#8249;
      </button>
      
      <button className="carousel-btn carousel-next" onClick={nextSlide}>
        &#8250;
      </button>

      {/* Carousel Slides - Only Images */}
      <div className="carousel-container">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.image} alt={`Slide ${index + 1}`} className="carousel-image" />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;
