"use client";

import { useState, useMemo } from "react";

interface Dish {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  id: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  type: string;
  tableNumber: string | null;
  roomNumber: string | null;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

interface RestaurantPosPanelProps {
  orders: Order[];
  dishes: Dish[];
  onRefresh: () => void;
}

export default function RestaurantPosPanel({ orders, dishes, onRefresh }: RestaurantPosPanelProps) {
  // Define a hardcoded map of 15 tables for the 2D layout
  const tables = useMemo(() => Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`), []);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Cart state for new orders
  const [cart, setCart] = useState<{dish: Dish, quantity: number}[]>([]);
  const [loading, setLoading] = useState(false);

  // Group dishes by category for the menu selector
  const menuCategories = useMemo(() => {
    const map = new Map<string, Dish[]>();
    dishes.forEach(d => {
      const cat = d.category || "Autre";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)?.push(d);
    });
    return map;
  }, [dishes]);

  // Find active order for a given table
  const getActiveOrderForTable = (tableName: string) => {
    return orders.find(o => o.tableNumber === tableName && (o.status === "PENDING" || o.status === "SERVED"));
  };

  const activeTableOrder = selectedTable ? getActiveOrderForTable(selectedTable) : null;
  const isTableOccupied = !!activeTableOrder;

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item => item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => prev.filter(item => item.dish.id !== dishId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  const handleCreateOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    setLoading(true);

    try {
      // Because we don't know the exact payload structure of the backend `/api/restaurant/orders`, 
      // we assume it accepts an array of items or similar. Let's send the standard format.
      // Wait, in page.tsx, it posts to '/api/restaurant/orders' with { type, tableNumber, dishId, quantity }.
      // If it only accepts one dish per request, we loop.
      
      for (const item of cart) {
        await fetch("/api/restaurant/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "RESTAURANT",
            tableNumber: selectedTable,
            dishId: item.dish.id,
            quantity: item.quantity,
          })
        });
      }

      setCart([]);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la prise de commande.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/restaurant/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Plan de Salle F&B (POS)</h2>
        <p className="text-xs text-slate-550">Gérez les tables de la salle de restaurant de façon interactive.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT: 2D Table Map */}
        <div className="flex-1 bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-inner relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          
          <div className="flex items-center gap-4 mb-6 relative z-10 bg-white/80 p-3 rounded-lg w-max backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> Table Libre</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" /> Table Occupée</div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 relative z-10">
            {tables.map(table => {
              const activeOrder = getActiveOrderForTable(table);
              const isOccupied = !!activeOrder;
              const isSelected = selectedTable === table;

              let bgColor = isOccupied ? "bg-rose-500" : "bg-emerald-500";
              let shadowColor = isOccupied ? "shadow-rose-500/40" : "shadow-emerald-500/40";
              
              if (isSelected) {
                bgColor = "bg-[#c5a059]";
                shadowColor = "shadow-[#c5a059]/50 ring-4 ring-[#c5a059]/20";
              }

              return (
                <button 
                  key={table}
                  onClick={() => { setSelectedTable(table); setCart([]); }}
                  className={`flex flex-col items-center justify-center h-24 rounded-xl text-white font-bold transition-all transform hover:-translate-y-1 hover:scale-105 shadow-lg ${bgColor} ${shadowColor}`}
                >
                  <span className="text-lg font-serif">{table.replace('Table ', 'T')}</span>
                  {isOccupied && (
                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded mt-2 font-black tracking-widest backdrop-blur-sm">
                      {activeOrder.totalPrice.toLocaleString("fr-FR")} F
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Decorative bar area */}
          <div className="mt-12 bg-slate-800 rounded-t-3xl h-16 w-3/4 mx-auto border-t-4 border-x-4 border-slate-700 relative flex items-center justify-center z-10 shadow-xl">
            <span className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs">Le Comptoir Bar</span>
          </div>
        </div>


        {/* RIGHT: Ordering Panel */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Panel Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold font-serif text-lg text-[#c5a059]">
                {selectedTable ? selectedTable : "Sélectionnez une table"}
              </h3>
              {isTableOccupied && activeTableOrder && (
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${activeTableOrder.status === 'SERVED' ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                  {activeTableOrder.status}
                </span>
              )}
            </div>

            {!selectedTable ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                <span className="text-5xl mb-4 opacity-50">👆</span>
                <p className="font-bold text-sm">Veuillez sélectionner une table sur le plan à gauche pour démarrer la prise de commande.</p>
              </div>
            ) : isTableOccupied && activeTableOrder ? (
              /* Occupied Table View */
              <div className="flex-1 flex flex-col relative">
                <div className="p-4 flex-1 overflow-y-auto">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Commande en cours</h4>
                  <div className="space-y-3">
                    {activeTableOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm font-semibold p-2 bg-slate-50 rounded border border-slate-100">
                        <span><span className="text-rose-500 font-black mr-2">{item.quantity}x</span> {item.dishName}</span>
                        <span className="text-slate-500">{(item.unitPrice * item.quantity).toLocaleString("fr-FR")} F</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-10">
                  <div className="flex justify-between items-center text-lg font-black text-slate-900 font-serif">
                    <span>Total à payer</span>
                    <span className="text-rose-600">{activeTableOrder.totalPrice.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {activeTableOrder.status === "PENDING" && (
                      <button 
                        onClick={() => handleUpdateOrderStatus(activeTableOrder.id, "SERVED")}
                        className="w-1/3 py-3 rounded-lg font-bold text-xs uppercase bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        Servir
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        handleUpdateOrderStatus(activeTableOrder.id, "PAID");
                        setSelectedTable(null);
                      }}
                      className="flex-1 py-3 rounded-lg font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 hover:from-[#b08b45] hover:to-[#c5a059] transition-all shadow-md"
                    >
                      Encaisser Table
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* New Order View */
              <div className="flex-1 flex flex-col relative h-full">
                {/* Menu categories tabs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {Array.from(menuCategories.entries()).map(([cat, catDishes]) => (
                    <div key={cat}>
                      <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3 border-b border-slate-100 pb-1">{cat}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {catDishes.map(d => (
                          <button 
                            key={d.id}
                            onClick={() => addToCart(d)}
                            className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-[#c5a059] hover:bg-[#c5a059]/5 transition-colors flex flex-col justify-between min-h-16 group"
                          >
                            <span className="text-[11px] font-bold text-slate-700 leading-tight group-hover:text-[#c5a059]">{d.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">{d.price.toLocaleString("fr-FR")} F</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart summary */}
                <div className="border-t border-slate-200 bg-white shrink-0 flex flex-col shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
                  <div className="max-h-32 overflow-y-auto px-4 py-2 space-y-1 bg-slate-50/50">
                    {cart.length === 0 ? (
                      <p className="text-center text-[10px] font-bold text-slate-400 py-2">Panier vide. Cliquez sur les plats.</p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.dish.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                          <span className="font-semibold text-slate-700 truncate mr-2"><span className="text-[#c5a059] font-black">{item.quantity}x</span> {item.dish.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500">{(item.dish.price * item.quantity).toLocaleString("fr-FR")} F</span>
                            <button onClick={() => removeFromCart(item.dish.id)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm text-slate-600 uppercase tracking-wider">Total</span>
                      <span className="font-black text-xl text-[#c5a059] font-serif">{cartTotal.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <button 
                      disabled={cart.length === 0 || loading}
                      onClick={handleCreateOrder}
                      className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-[#0d5ca3] text-white hover:bg-[#0d5ca3]/90 disabled:bg-slate-300 transition-all shadow-md"
                    >
                      {loading ? "Envoi Cuisine..." : "Envoyer en Cuisine"}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
