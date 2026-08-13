"use client";

import { deletePantryItem, getPantryItems, updatePantryItem } from "@/actions/pantry.actions";
import AddToPantryModal from "@/components/AddToPantryModal";
import PricingModal from "@/components/PricingModal";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { ChefHat, InfinityIcon, Package, Plus, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const PantryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", quantity: "" });

  // Fetch pantry items
  const {
    loading: loadingItems,
    data: itemsData,
    fn: fetchItems,
  } = useFetch(getPantryItems);

  // Delete pantry item
  const {
    loading: deleting,
    data: deleteData,
    fn: deleteItem,
  } = useFetch(deletePantryItem);

  // Update pantry item
  const {
    loading: updating,
    data: updateData,
    fn: updateItem,
  } = useFetch(updatePantryItem);

  useEffect(() => {
    fetchItems();
  }, []);

  // Update items state when itemsData changes
  useEffect(() => {
    if (itemsData?.success) {
      setItems(itemsData.items);
    }
  }, [itemsData]);

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
          {itemsData?.scansLimit !== undefined && (
            <div className="bg-white py-3 px-4 border-2 border-stone-200 inline-flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <div className="text-sm">
                {itemsData.scansLimit === "unlimited" ? (
                  <>
                    <span className="font-bold text-green-600">∞</span>
                    <span className="text-stone-500">
                      {" "}
                      Unlimited AI Scans (Pro Plan)
                    </span>
                  </>
                ) : (
                  <PricingModal>
                    <span className="text-stone-500 cursor-pointer">
                      Upgrade to Pro for unlimited pantry scans.
                    </span>
                  </PricingModal>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Card - Find Recipes */}
        {items.length > 0 && (
          <Link href={"/pantry/recipes"} className="block mb-8">
            <div className="bg-linear-to-br from-green-600 to-emerald-500 text-white p-6 border-2 border-emrald-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 border-2 border-white/30 group-hover:bg-white/30 transition-colors">
                  <ChefHat className="w-8 h-8" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">What can I cook with my ingredients?</h3>

                  <p className="text-green-100 text-sm font-light">
                    Get AI-powered recipe suggestions from your {items.length}{" "}{items.length === 1 ? "ingredient" : "ingredients"}.
                  </p>
                </div>

                <div className="hidden sm:block">
                  <Badge className='bg-white/20 text-white border-2 border-white/30 font-bold uppercase tracking-wide'>
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        )}

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
