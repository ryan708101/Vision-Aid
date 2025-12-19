import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


export const LampContainer = ({
  children,
  className
}) => {
  return (
    (<div
      className={cn(
        " absolute top-[-100] flex min-h-[500px] flex-col items-center justify-center overflow-hidden bg-transparent w-full rounded-md z-10 max-600px:w-[90%]",
        className
      )}>
      <div
        className="absolute top-[100] flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem", height: '8rem' }}
          whileInView={{ opacity: 1, width: "30rem", height: "8rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            filter: 'blur(40px)',
            borderRadius: '7px'
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-blue-600 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]">
          <div
            className="absolute  w-[100%] left-0 bg-transparent h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div
            className="absolute  w-40 h-[100%] left-0 bg-transparent  bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem", height: '8rem' }}
          whileInView={{ opacity: 1, width: "30rem", height: '8rem' }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            filter: 'blur(40px)',
            borderRadius: '7px'
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-blue-600 text-white [--conic-position:from_290deg_at_center_top]">
          <div
            className="absolute  w-40 h-[100%] right-0 bg-transparent  bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div
            className="absolute  w-[100%] right-0 bg-transparent h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div
          className="absolute top-0 h-48 w-full translate-y-12 scale-x-150 bg-transparent blur-2xl"></div>
        <div
          className="absolute top-0 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>

        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute top-0 inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-blue-400 "></motion.div>
      </div>

    </div>)
  );
};
