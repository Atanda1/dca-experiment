import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { PlusCircle, LogOut, Loader } from "lucide-react";

interface Investment {
  id: string;
  amount: number;
  investment_date: string;
  category: string;
  notes: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  async function fetchInvestments() {
    try {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("investment_date", { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function deleteInvestment(id: string) {
    const { error } = await supabase.from("investments").delete().eq("id", id); // Match row with given ID

    if (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } else {
      setInvestments((prev) => prev.filter((item) => item.id !== id)); // Remove the deleted item from the state
      console.log("Item deleted successfully");
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Investment Tracker
              </h1>
            </div>
            <div className="flex items-center">
              <Link
                to="/new-investment"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New Investment
              </Link>
              <button
                onClick={handleSignOut}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Notes
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.map((investment) => (
                      <tr key={investment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(
                            investment.investment_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {investment.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${investment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {investment.notes}
                        </td>
                        <td
                          onClick={() => deleteInvestment(investment.id)}
                          className="px-6 py-4 whitespace-nowrap text-sm text-red-500"
                        >
                          <button>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {investments.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No investments recorded yet. Click "New Investment" to
                          add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {investments.length !== 0 && (
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          TOTAL
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {`${
                            investments[investments.length - 1]?.investment_date
                          } - ${investments[0]?.investment_date}`}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          $
                          {investments
                            .reduce((sum, item) => sum + item.amount, 0)
                            .toLocaleString()}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        ></th>
                      </tr>
                    </thead>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
