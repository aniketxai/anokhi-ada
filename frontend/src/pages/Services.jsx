import { motion } from 'framer-motion';
import { Printer, Zap, Cog, Navigation, PenTool, Box, ArrowRight, Check } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { services } from '../data/products';

const iconMap = { Printer, Zap, Cog, Navigation, PenTool, Box };

export default function Services() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <BlurBlob className="w-56 h-56 sm:w-96 sm:h-96 top-0 right-0 bg-secondary-container" />
      <BlurBlob className="w-36 h-36 sm:w-56 sm:h-56 bottom-40 left-0 bg-accent-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <SectionHeading
            label="What We Do"
            title="Engineering Services"
            description="We deliver end-to-end engineering solutions — design, prototyping, and manufacturing — tailored to your needs."
          />
          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-secondary-text max-w-2xl">
              From concept to production, our team handles every step with precision and care. Explore our core services below or get a custom quote.
            </p>
            <Link to="/contact">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || Cog;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-surface-container rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden transform"
              >
                <div className="absolute -top-8 -right-6 w-40 h-40 bg-linear-to-tr from-primary/6 to-transparent rounded-full opacity-80 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                      <Icon size={26} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{service.title}</h3>
                      <p className="text-secondary-text text-sm">{service.subtitle || service.description}</p>
                    </div>
                  </div>

                  <p className="text-secondary-text text-sm leading-relaxed mb-4">{service.description}</p>

                  <div className="mt-auto flex flex-wrap gap-2 mb-4">
                    {service.features.map(f => (
                      <span key={f} className="inline-flex items-center gap-2 text-xs bg-background/60 px-3 py-1.5 rounded-full text-secondary-text border border-outline">
                        <Check size={12} className="opacity-80" /> {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to="/contact" className="inline-flex">
                      <Button variant="primary" size="sm" icon={ArrowRight}>
                        Get Quote
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Process section */}
        <SectionHeading
          label="Our Process"
          title="How We Work"
          description="A clear, iterative approach that keeps you informed at every stage."
        />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {[
            {
              step: '01',
              icon: PenTool,
              title: 'Discover & Plan',
              desc: 'We start with a short discovery session to understand goals, constraints, and success metrics.',
              bullets: ['Requirements', 'Scope & timeline', 'Cost estimate'],
              time: '1–2 weeks',
            },
            {
              step: '02',
              icon: Navigation,
              title: 'Design & Prototype',
              desc: 'Iterative design, quick prototypes, and early validation to de-risk the solution.',
              bullets: ['CAD & schematics', 'Prototype build', 'User feedback'],
              time: '2–4 weeks',
            },
            {
              step: '03',
              icon: Box,
              title: 'Produce & Support',
              desc: 'High-quality manufacturing, QA, and ongoing support for scaling and delivery.',
              bullets: ['Low-volume runs', 'Quality checks', 'Logistics & support'],
              time: 'Varies',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-surface-container rounded-2xl p-6 flex flex-col h-full"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow">
                    <item.icon size={18} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <span className="text-xs text-secondary-text">{item.time}</span>
                  </div>
                  <p className="text-secondary-text text-sm mt-2 mb-3">{item.desc}</p>

                  <ul className="flex flex-col gap-2 mt-2 mb-3">
                    {item.bullets.map(b => (
                      <li key={b} className="flex items-center gap-2 text-sm text-secondary-text">
                        <Check size={14} className="text-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
