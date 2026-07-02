import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const IMAGES = [
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1577891728591-382cd16b27ef?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2000"
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 8000); // Change image every 8 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/30 z-10" /> {/* Lightened Backdrop Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
      
      <AnimatePresence mode="manual">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={IMAGES[index]}
            alt=""
            className="w-full h-full object-cover brightness-[75%]"
            animate={{
              scale: [1, 1.05],
              x: [0, -20],
              y: [0, -10]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
