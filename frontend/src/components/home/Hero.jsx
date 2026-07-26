import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../../data/content';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function Hero({ slides }) {
  const [, setActiveIndex] = useState(0);
  const activeSlides = Array.isArray(slides) && slides.length > 0 ? slides : heroSlides;

  return (
    <section className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FAF2EB] to-[#FFFDF9] border-b border-rose-100/60 overflow-hidden py-3 sm:py-6">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-md border border-rose-200/60 bg-[#FDF8F3]">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={{
              nextEl: '.hero-next-btn',
              prevEl: '.hero-prev-btn',
            }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-[220px] xs:h-[280px] sm:h-[380px] md:h-[460px] lg:h-[540px] xl:h-[600px] group/swiper bg-[#FDF8F3]"
          >
            {activeSlides.map((slide, idx) => (
              <SwiperSlide key={slide.id || idx} className="bg-[#FDF8F3]">
                <Link to={slide.href} className="block relative w-full h-full group cursor-pointer overflow-hidden">
                  {/* Banner Image */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />

                  {/* Glassmorphism Title & Subtitle Badge */}
                  <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 max-w-[62%] sm:max-w-md z-10 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-rose-200/60 shadow-lg shadow-rose-950/5 transition-all duration-300 group-hover:bg-white/95">
                      <span className="inline-block px-2 py-0.5 mb-0.5 sm:mb-1 text-[9px] sm:text-xs font-bold tracking-wider text-rose-700 uppercase bg-rose-50 rounded-full border border-rose-100">
                        Featured Collection
                      </span>
                      <h2 className="text-xs sm:text-lg md:text-xl font-serif font-bold text-slate-900 line-clamp-1">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="hidden sm:block text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Responsive Rose Action Button (Fixed Black Button) */}
                  <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-10">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white px-3.5 py-2 sm:px-6 sm:py-3 text-[11px] sm:text-sm font-bold shadow-lg shadow-rose-600/30 border border-white/30 hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all duration-300">
                      <span>{slide.cta || 'Shop Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button
            className="hero-prev-btn absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 text-rose-700 flex items-center justify-center shadow-md hover:bg-rose-600 hover:text-white hover:border-rose-600 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            className="hero-next-btn absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 text-rose-700 flex items-center justify-center shadow-md hover:bg-rose-600 hover:text-white hover:border-rose-600 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

