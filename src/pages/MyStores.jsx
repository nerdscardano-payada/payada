import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Plus, Store, Pencil, Trash2, ExternalLink, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoreTransactionHistory from "@/components/stores/StoreTransactionHistory";

export default function MyStores() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [user, setUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores", user?.email],
    queryFn: () => base44.entities.Store.filter({ merchant_id: user.email }, "-updated_date", 100),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Store.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setDeletingId(null);
    },
  });

  if (!isProfileComplete && profile !== undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Complete Your Profile</h2>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            To access PayADA tools, please complete your merchant profile first. You need to provide your business name and a receiving wallet address.
          </p>
          <button
            onClick={() => window.location.href = '/MerchantProfile'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (selectedStore) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => setSelectedStore(null)}
          className="text-sm text-slate-600 hover:text-slate-900 font-medium mb-6"
        >
          ← Back to stores
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{selectedStore.name}</h1>
        <StoreTransactionHistory store={selectedStore} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Stores</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your ADA shopping pages</p>
        </div>
        <Link to={createPageUrl("ShoppingPageGenerator")}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Store
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">Loading...</div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-slate-700 text-lg mb-1">No stores yet</h3>
          <p className="text-slate-400 text-sm mb-6">Create your first ADA shopping page</p>
          <Link to={createPageUrl("ShoppingPageGenerator")}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Create Store
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedStore(store)}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: store.config?.theme?.accent ? store.config.theme.accent + "15" : "#eef2ff" }}>
                {store.config?.logoText?.slice(0, 2) || "🛒"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate hover:text-indigo-600">{store.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${store.status === "active" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                    {store.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {store.products?.length || 0} products
                  </span>
                  <span>Updated {new Date(store.updated_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Link to={`${createPageUrl("ShoppingPageGenerator")}?storeId=${store.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>
                {deletingId === store.id ? (
                  <div className="flex gap-1">
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(store.id)} disabled={deleteMutation.isPending}>
                      Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingId(store.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}