import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { heroSlides } from '../../data/content';
import { BRAND } from '../../data/brand';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Hero() {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        effect="fade"
        loop
        className="h-[70vh] min-h-[480px] w-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="max-w-xl text-white"
                  >
                    <span className="inline-block rounded-full glass-pink px-4 py-1.5 text-xs font-medium text-white mb-5">
                      {BRAND.name}
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight text-balance">
                      {slide.title}
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-white/85 max-w-md">
                      {slide.subtitle}
                    </p>
                    <Link
                      to={slide.href}
                      className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
                    >
                      {slide.cta}
                      <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
