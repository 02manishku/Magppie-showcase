"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
      className={`fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-center transition-all duration-300 ${
        scrolled
          ? "bg-[#F5F0E8]/95 backdrop-blur-[12px] px-6"
          : "bg-transparent px-6"
      }`}
    >
      <div 
        className={`font-display font-medium text-[14px] tracking-[0.2em] transition-colors duration-300 ${
          scrolled ? "text-[#1B3B2A]" : "text-[#F5F0E8]"
        }`}
      >
        MAGPPIE
      </div>
    </motion.nav>
  );
}
