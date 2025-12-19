import React from "react";
import { AnimatedTooltip } from "./ui/animated-tooltip.jsx";
import { assets } from "@/assets/assets.js";
const people = [
  {
    id: 1,
    name: "Vuppu Chinmay",
    
    image:
      assets.PP_Chinmay
  },
  {
    id: 2,
    name: "Chiranth Raju C",
   
    image:
     assets.PP_Chiranth
  },
  {
    id: 3,
    name: "Ryan Sinha",
    
    image:
      assets.PP_Ryan
  },
  {
    id: 4,
    name: "Aryan Maniyar",
    
    image: assets.PP_Aryan
  }
];

export default function Hero_Profiles() {
  return (
    (<div className="flex flex-row items-center justify-start max-900px:justify-center mb-10 w-full relative z-10">
      <AnimatedTooltip items={people} />
    </div>)
  );
}
