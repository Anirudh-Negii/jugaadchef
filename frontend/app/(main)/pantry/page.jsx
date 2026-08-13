"use client";

import AddToPantryModal from "@/components/AddToPantryModal";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import React, { useState } from "react";

const PantryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", quantity: "" });

  const handleModalSuccess = () => {};

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-16 h-16 text-orange-600" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-light">
                  My Pantry
                </h1>
                <p className="text-stone-600 font-light">
                  Manage your ingredients & discover what you can cook with
                  them.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex"
              size="lg"
              variant="primary"
            >
              <Plus className="h-5 w-5" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* Quick Action Card - Find Recipes */}

        {/* Loading State */}

        {/* Pantry Items Grid */}

        {/* Empty State */}
      </div>

      {/* Add to Pantry Modal */}
      <AddToPantryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PantryPage;
