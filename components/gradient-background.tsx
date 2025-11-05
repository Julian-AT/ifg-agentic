import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface GradientBackgroundProps {
  active: boolean;
}

const GradientBackground = ({ active }: GradientBackgroundProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-10 h-dvh w-dvw overflow-hidden">
      <div
        className="absolute inset-0 hidden bg-auto bg-repeat dark:block"
        style={{ backgroundImage: "url(/grain.png)" }}
      />
      <motion.div
        initial={{
          y: "100%",
          scale: 1,
          opacity: 0,
        }}
        animate={
          imageLoaded
            ? {
                y: 0,
                scale: 1,
                opacity: 1,
              }
            : {
                y: "100%",
                scale: 1,
                opacity: 0,
              }
        }
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="absolute inset-0"
      >
        <Image
          src="/gradient.png"
          alt="Gradient"
          fill
          className="hidden object-cover opacity-60 dark:block"
          priority
          onLoad={handleImageLoad}
        />
      </motion.div>
    </div>
  );
};

export default GradientBackground;
