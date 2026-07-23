import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import SectionHeader from '../common/SectionHeader';
import ReviewCard from '../product/ReviewCard';
import { reviews } from '../../data/content';

import 'swiper/css';
import 'swiper/css/pagination';

export default function Reviews() {
  if (!reviews?.length) return null;
  return (
    <section className="bg-accent/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Loved by our customers"
          title="What our customers say"
          subtitle="Real stories from real orders across India."
          center
        />
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-12"
        >
          {reviews.map((r, i) => (
            <SwiperSlide key={r.id} className="h-auto !pb-1">
              <ReviewCard review={r} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
