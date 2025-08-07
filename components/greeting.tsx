import { motion } from "framer-motion";
import Image from "next/image";

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto text-center w-full flex flex-col justify-center gap-4 overflow-hidden"
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
        className="mb-2 flex items-center mx-auto gap-1 text-2xl font-medium leading-none text-foreground sm:text-3xl md:mb-2.5 md:gap-0 md:text-5xl"
      >
        Erkunde Österreichs Daten
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="mb-6 max-w-3/4 mx-auto text-center text-lg leading-tight text-foreground/65 md:max-w-full md:text-xl"
      >
        Suche, Entdecke und Visualisiere Daten von data.gv.at
      </motion.div>
    </div>
  );
};
