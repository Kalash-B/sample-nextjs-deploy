"use client";

import { motion } from "framer-motion";

export default function LogoShine() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      {/* SVG logo outline */}
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Static base outline */}
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="#444"
          strokeWidth="6"
          fill="none"
        />

        {/* Shining edge animation */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          stroke="url(#grad)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -500] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 3,
            ease: "linear",
          }}
          strokeDasharray="500"
        />

        <defs>
          {/* gradient for the shining edge */}
          <linearGradient id="grad" x1="0" y1="0" x2="200" y2="200">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#00ffff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
