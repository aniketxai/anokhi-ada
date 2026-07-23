import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  Rocket,
  Target,
} from 'lucide-react';

import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Precision',
      desc: 'High-detail 3D printing with clean finishing and professional quality.',
    },
    {
      icon: Rocket,
      title: 'Fast Delivery',
      desc: 'Quick production workflow with rapid shipping across India.',
    },
    {
      icon: Layers,
      title: 'Creative Manufacturing',
      desc: 'From custom gifts to prototypes, we turn ideas into reality.',
    },
    {
      icon: Cpu,
      title: 'Innovation',
      desc: 'Blending AI, design, hardware, and manufacturing into one ecosystem.',
    },
  ];

  const founders = [
    {
      name: 'Aniket Singh',
      role: 'Founder',
      image:
        'https://res.cloudinary.com/du8wgbo8b/image/upload/v1779372383/WhatsApp_Image_2026-05-21_at_19.36.08_d1tznj.jpg',
      about:
        'Engineering student and creator focused on AI, IoT, embedded systems, robotics, and modern digital manufacturing. Passionate about building intelligent hardware, real-world tech products, and future-driven startups. Hackathon builder and innovator.',
    },

    {
      name: 'Khushi Kumari',
      role: 'Co-Founder',
      image:
        'https://res.cloudinary.com/du8wgbo8b/image/upload/v1779364629/WhatsApp_Image_2026-05-21_at_17.26.54_jl2a3c.jpg',
      about:
        'Passionate about operations, design, branding, and scaling creative technology products.',
    },
    {
      name: 'Vansh',
      role: 'Co-Founder',
      image:
        'https://res.cloudinary.com/du8wgbo8b/image/upload/ar_1:1,c_auto/vansh_saoohu.png',
      about:
        'Co-founder focusing on product strategy, growth, and operations.',
    },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <BlurBlob className="w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] top-0 left-0 bg-primary" />

      <BlurBlob className="w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] bottom-20 right-0 bg-secondary-container" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          label="About SAMBX"
          title="Building The Future With 3D Printing"
          description="SAMBX Forge combines creativity, engineering, and modern manufacturing to create high-quality custom products and prototypes."
        />

        {/* STORY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-surface-container rounded-3xl p-8 sm:p-12 mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground font-display mb-5">
                Our Journey
              </h3>

              <p className="text-secondary-text leading-relaxed mb-5">
                SAMBX Forge started with a vision to make high-quality
                3D printing accessible, affordable, and creative for
                everyone.
              </p>

              <p className="text-secondary-text leading-relaxed mb-5">
                From personalized gifts and decor to engineering
                prototypes and startup projects, we help transform ideas
                into physical products with precision and speed.
              </p>

              <p className="text-secondary-text leading-relaxed">
                Built by passionate makers and innovators from
                <span className="text-primary font-medium">
                  {' '}
                  VIT Bhopal
                </span>
                , SAMBX is growing into an ecosystem focused on AI,
                hardware, manufacturing, and digital innovation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  num: '0.05mm',
                  label: 'Layer Precision',
                },
                {
                  num: '500mm/s',
                  label: 'Print Speed',
                },
                {
                  num: '24/7',
                  label: 'Production',
                },
                {
                  num: '100+',
                  label: 'Custom Designs',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-background rounded-3xl p-6 text-center"
                >
                  <p className="text-1.5xl font-bold text-primary font-display">
                    {stat.num}
                  </p>

                  <p className="text-xs text-outline mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FOUNDERS */}
        <SectionHeading
          label="Leadership"
          title="Founder & Co-Founder"
          description="The people building the SAMBX vision."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
              }}
              className="bg-surface-container rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
            >
              <div className="aspect-square overflow-hidden bg-surface-muted">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-6 bg-surface-container flex flex-col flex-1">
                <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  {founder.role}
                </p>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {founder.name}
                </h3>

                <p className="text-secondary-text text-sm leading-relaxed flex-1">
                  {founder.about}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* VALUES */}
        <SectionHeading
          label="Core Values"
          title="What Drives Us"
          description="A few principles behind everything we build."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {values.map((v, i) => {
            const Icon = v.icon;

            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.06,
                }}
                className="bg-surface-container rounded-3xl p-6 hover:shadow-lg transition-material group"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-material">
                  <Icon size={20} />
                </div>

                <h3 className="font-semibold text-foreground mb-2">
                  {v.title}
                </h3>

                <p className="text-secondary-text text-sm leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* VISION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-transparent" />

          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-bold text-white font-display mb-5">
              The SAMBX Vision
            </h3>

            <p className="text-white/80 max-w-3xl mx-auto leading-relaxed text-lg">
              SAMBX is more than a 3D printing brand. We are building an
              ecosystem that connects AI, hardware, software, design,
              manufacturing, and innovation into one powerful platform
              for the future.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}