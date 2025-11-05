import { motion } from "framer-motion";
import Image from "next/image";

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="mx-auto flex h-[90%] w-full max-w-3xl flex-col justify-center gap-4 overflow-hidden text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.7 }}
      >
        <Image
          src="/assets/logo_datagvat.png"
          alt="Logo"
          width={100}
          height={100}
          className="mx-auto"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="mx-auto mb-2 flex items-center gap-1 font-medium text-2xl text-foreground leading-none sm:text-3xl md:mb-2.5 md:gap-0 md:text-5xl"
      >
        Erkunde Österreichs Daten
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="mx-auto mb-6 max-w-3/4 text-center text-foreground/65 text-lg leading-tight md:max-w-full md:text-xl"
      >
        Suche, Entdecke und Visualisiere Daten von data.gv.at
      </motion.div>
    </div>
  );
};
