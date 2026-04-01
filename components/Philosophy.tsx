"use client";

import { motion } from "framer-motion";

export default function Philosophy() {
  return (
    <section className="flex items-center justify-center px-6 py-20 md:px-8 md:py-32 lg:py-40">
      <div className="max-w-xl text-center">
        <motion.h2
          className="font-display text-[28px] font-light leading-snug tracking-[-0.02em] text-text-primary md:text-[42px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
        >
          Where stone meets soul
        </motion.h2>

        <motion.p
          className="mt-6 text-[15px] leading-relaxed text-text-secondary md:text-[17px]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
        >
          Every Magppie space is designed to feel timeless.
          <br />
          Explore our kitchens and wardrobes below.
        </motion.p>
      </div>
    </section>
  );
}
