import { PricingTable } from "@clerk/nextjs";
import React from "react";

const PricingSection = () => {
  return (
    <div className="max-w-6xl">
      <div className="mb-16">
        <h2 className="text-5xl md:text-6xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-xl text-stone-600 font-light">
          Start for free. Unlock more ways to cook with Pro.
        </p>
      </div>

      <div className="max-4xl mx-auto">
        <PricingTable />
      </div>
    </div>
  );
};

export default PricingSection;
