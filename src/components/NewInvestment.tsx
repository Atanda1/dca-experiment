import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Loader, Plus, X } from "lucide-react";

const INVESTMENT_CATEGORIES = [
  "Stocks",
  "Bonds",
  "Real Estate",
  "Cryptocurrency",
  "Mutual Funds",
  "ETFs",
  "Other",
];

interface CategoryAllocation {
  category: string;
  amount: string;
  notes?: string;
}

export function NewInvestment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<CategoryAllocation[]>([
    { category: "", amount: "", notes: "" },
  ]);
  const [formData, setFormData] = useState({
    investmentDate: new Date().toISOString().split("T")[0],
  });

  // Calculate total investment amount
  const totalAmount = allocations.reduce((sum, allocation) => {
    return sum + (parseFloat(allocation.amount) || 0);
  }, 0);

  const handleAddAllocation = () => {
    setAllocations([...allocations, { category: "", amount: "" }]);
  };

  const handleRemoveAllocation = (index: number) => {
    if (allocations.length === 1) {
      setAllocations([{ category: "", amount: "" }]);
    } else {
      setAllocations(allocations.filter((_, i) => i !== index));
    }
  };

  const handleAllocationChange = (
    index: number,
    field: keyof CategoryAllocation,
    value: string
  ) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      [field]: value,
    };
    setAllocations(updatedAllocations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to add investments");
      return;
    }

    // Validate allocations
    const invalidAllocations = allocations.some(
      (alloc) =>
        !alloc.category || !alloc.amount || parseFloat(alloc.amount) <= 0
    );

    if (invalidAllocations) {
      setError("All categories must be selected and have a valid amount");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Insert each allocation as a separate investment entry
      const investmentPromises = allocations.map((allocation) => {
        return supabase.from("investments").insert([
          {
            user_id: user.id,
            amount: parseFloat(allocation.amount),
            category: allocation.category,
            investment_date: formData.investmentDate,
            notes: allocation.notes || "",
          },
        ]);
      });

      const results = await Promise.all(investmentPromises);

      // Check if any of the insertions had an error
      const insertErrors = results.filter((result) => result.error);
      if (insertErrors.length > 0) throw insertErrors[0].error;

      navigate("/dashboard");
    } catch (err) {
      console.error("Error adding investments:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add investments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                New Investment
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Record a new investment across multiple categories to track your
                portfolio growth.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium text-gray-700">
                        Category Allocations
                      </h3>
                      <div className="text-sm text-gray-500">
                        Total: ${totalAmount.toFixed(2)}
                      </div>
                    </div>

                    {allocations.map((allocation, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-4 mb-4 p-4 border border-gray-200 rounded-md"
                      >
                        <div className="w-full sm:w-2/5">
                          <label
                            htmlFor={`category-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Category
                          </label>
                          <select
                            id={`category-${index}`}
                            required
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={allocation.category}
                            onChange={(e) =>
                              handleAllocationChange(
                                index,
                                "category",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select a category</option>
                            {INVESTMENT_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-2/5">
                          <label
                            htmlFor={`amount-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Amount
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                $
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              id={`amount-${index}`}
                              required
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              value={allocation.amount}
                              onChange={(e) =>
                                handleAllocationChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="w-full sm:w-auto sm:mt-6">
                          <button
                            type="button"
                            onClick={() => handleRemoveAllocation(index)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </div>
                        <div className="w-full ">
                          <label
                            htmlFor="notes"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Notes
                          </label>
                          <div className="mt-1 w-full">
                            <textarea
                              id="notes"
                              rows={3}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                              placeholder="Add any additional notes about this investment"
                              value={allocation.notes}
                              onChange={(e) =>
                                handleAllocationChange(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddAllocation}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="investmentDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Investment Date
                    </label>
                    <input
                      type="date"
                      id="investmentDate"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.investmentDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          investmentDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div></div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading && (
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    )}
                    Save Investment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
