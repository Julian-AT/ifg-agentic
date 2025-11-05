"use client"

import * as React from "react"

import { motion } from "framer-motion";

export function ShinyText({ text }: { text: string }) {
    return (
        <motion.h1
            className="bg-[linear-gradient(110deg,#71717b,35%,#ecfdf5,50%,#71717b,75%,#71717b)] bg-[length:200%_100%] bg-clip-text text-base font-regular text-transparent"
            initial={{ backgroundPosition: "200% 0" }}
            animate={{ backgroundPosition: "-200% 0" }}
            transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: "linear",
            }}
        >
            {text}
        </motion.h1>
    );
}
