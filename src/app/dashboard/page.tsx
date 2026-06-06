"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnalyticsPanel from "./components/AnalyticsPanel";
import HousekeepingPanel from "./components/HousekeepingPanel";
import ConciergePanel from "./components/ConciergePanel";
import CrmPanel from "./components/CrmPanel";
import NightAuditPanel from "./components/NightAuditPanel";
import AccountingPanel from "./components/AccountingPanel";
import TapeChartPanel from "./components/TapeChartPanel";
import RestaurantPosPanel from "./components/RestaurantPosPanel";

export default function Dashboard() {
  // Database datasets
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [concierge, setConcierge] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);
  const [hallBookings, setHallBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Tab Navigation (analytics, rooms, hr, accounting, inventory, restaurant, halls, marketing)
  const [activeTab, setActiveTab] = useState<string>("analytics");


  // Load States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form States
  // 1. Room Booking Form
  const [newBooking, setNewBooking] = useState({
    clientId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // 2. KYC Modal States
  const [kycResId, setKycResId] = useState<string | null>(null);
  const [kycForm, setKycForm] = useState({
    idType: "CNI",
    idNumber: "",
    idExpiry: "",
  });

  // 3. Staff Form (RH)
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    position: "Waiter",
    salary: "180000",
    contractType: "CDI",
    shift: "Matin (06h - 14h)",
  });
  const [hrSuccess, setHrSuccess] = useState<string | null>(null);
  const [hrError, setHrError] = useState<string | null>(null);

  // 4. Accounting Expense Form
  const [newExpenseForm, setNewExpenseForm] = useState({
    amount: "",
    description: "",
    category: "GENERAL",
  });
  const [expenseSuccess, setExpenseSuccess] = useState<string | null>(null);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // 5. Stock Add Form
  const [newInventoryForm, setNewInventoryForm] = useState({
    name: "",
    category: "Food",
    quantity: "20",
    unit: "kg",
    minThreshold: "5",
  });
  const [inventorySuccess, setInventorySuccess] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // 6. F&B Order Form
  const [newOrderForm, setNewOrderForm] = useState({
    type: "RESTAURANT",
    tableNumber: "Table 1",
    roomNumber: "",
    dishId: "",
    quantity: 1,
  });
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // 7. Hall Booking Form
  const [newHallBookingForm, setNewHallBookingForm] = useState({
    hallId: "",
    clientName: "",
    clientPhone: "",
    eventDate: "",
    durationHours: "6",
  });
  const [hallSuccess, setHallSuccess] = useState<string | null>(null);
  const [hallError, setHallError] = useState<string | null>(null);

  // 8. User Management Form (RBAC)
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT",
  });
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // 9. Promo Offer Form
  const [newPromoForm, setNewPromoForm] = useState({
    title: "",
    description: "",
    discountPct: "15",
    promoCode: "ASTORIA15",
    image: "suite2.jpg",
    startDate: "",
    endDate: "",
  });
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // 10. Hotel Event Form
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    price: "15000",
    image: "bar2.jpg",
  });
  const [eventSuccess, setEventSuccess] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  // Fetch all initial data
  const fetchData = async () => {

    try {
      setLoading(true);
      setError(null);

      const [
        roomsRes,
        resRes,
        conciergeRes,
        invRes,
        settingsRes,
        testRes,
        hrRes,
        ordersRes,
        hallsRes,
        hallBookingsRes,
        transactionsRes,
        dishesRes,
        usersRes,
        promosRes,
        eventsRes,
      ] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/reservations"),
        fetch("/api/concierge"),
        fetch("/api/inventory"),
        fetch("/api/settings"),
        fetch("/api/test"),
        fetch("/api/hr"),
        fetch("/api/restaurant/orders"),
        fetch("/api/halls"),
        fetch("/api/halls/bookings"),
        fetch("/api/transactions"),
        fetch("/api/restaurant/dishes"),
        fetch("/api/users"),
        fetch("/api/promotions"),
        fetch("/api/events"),
      ]);

      const roomsJson = await roomsRes.json();
      const resJson = await resRes.json();
      const conciergeJson = await conciergeRes.json();
      const invJson = await invRes.json();
      const settingsJson = await settingsRes.json();
      const testJson = await testRes.json();
      const hrJson = await hrRes.json();
      const ordersJson = await ordersRes.json();
      const hallsJson = await hallsRes.json();
      const hallBookingsJson = await hallBookingsRes.json();
      const transactionsJson = await transactionsRes.json();
      const dishesJson = await dishesRes.json();
      const usersJson = await usersRes.json();
      const promosJson = await promosRes.json();
      const eventsJson = await eventsRes.json();

      if (roomsJson.status === "success") setRooms(roomsJson.data);
      if (resJson.status === "success") setReservations(resJson.data);
      if (conciergeJson.status === "success") setConcierge(conciergeJson.data);
      if (invJson.status === "success") setInventory(invJson.data);
      if (settingsJson.status === "success") setSettings(settingsJson.data);
      if (hrJson.status === "success") setStaff(hrJson.data.filter((s: any) => s.status !== "INACTIVE"));
      if (ordersJson.status === "success") setOrders(ordersJson.data);
      if (hallsJson.status === "success") setHalls(hallsJson.data);
      if (hallBookingsJson.status === "success") setHallBookings(hallBookingsJson.data);
      if (transactionsJson.status === "success") setTransactions(transactionsJson.data);
      if (dishesJson.status === "success") setDishes(dishesJson.data);
      if (usersJson.status === "success") setUsers(usersJson.data);
      if (promosJson.status === "success") setPromotions(promosJson.data);
      if (eventsJson.status === "success") setEvents(eventsJson.data);

      if (testJson.status === "success") {
        setRoomTypes(testJson.data.roomTypes || []);
        setSites(testJson.data.sites || []);
        if (usersJson.status !== "success" || !usersJson.data.length) {
          setUsers([
            { id: "client-id-2", name: "KOUAME PATRICE YAO", email: "patrice.yao@yahoo.fr", role: "CLIENT" },
            { id: "client-id-3", name: "AMANI KOFFI SERGE", email: "serge.amani@ci-news.com", role: "CLIENT" },
          ]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync database. Ensure Next.js dev server is running.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Update room status
  const handleRoomStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setRooms(rooms.map((r) => (r.id === roomId ? data.data : r)));
      }
    } catch (err) {
      console.error("Failed to update room status", err);
    }
  };

  // Update reservation status
  const handleReservationStatusChange = async (resId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${resId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setReservations(reservations.map((res) => (res.id === resId ? data.data : res)));
        fetchData(); 
      }
    } catch (err) {
      console.error("Failed to update reservation", err);
    }
  };

  // Submit KYC ID data
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycResId) return;

    try {
      const response = await fetch(`/api/reservations/${kycResId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kycForm),
      });
      const data = await response.json();
      if (data.status === "success") {
        setReservations(reservations.map((res) => (res.id === kycResId ? { ...res, checkInStatus: "KYC_SUBMITTED", kycData: data.data } : res)));
        setKycResId(null);
        setKycForm({ idType: "CNI", idNumber: "", idExpiry: "" });
      }
    } catch (err) {
      console.error("Failed to submit KYC data", err);
    }
  };

  // Create quick booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });
      const data = await response.json();
      if (data.status === "success") {
        setBookingSuccess("Réservation de chambre créée avec succès !");
        setNewBooking({ clientId: "", roomId: "", checkIn: "", checkOut: "" });
        fetchData();
      } else {
        setBookingError(data.message || "Impossible de réserver la chambre.");
      }
    } catch (err) {
      setBookingError("Erreur serveur lors de la création de la réservation.");
    }
  };

  // RH (Ressources Humaines) Actions
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setHrError(null);
    setHrSuccess(null);

    if (!sites[0]?.id) return;

    try {
      const response = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStaffForm, siteId: sites[0].id }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setHrSuccess("Employé ajouté au registre RH !");
        setNewStaffForm({
          name: "",
          email: "",
          position: "Waiter",
          salary: "180000",
          contractType: "CDI",
          shift: "Matin (06h - 14h)",
        });
        fetchData();
      } else {
        setHrError(data.message || "Erreur de création du profil RH.");
      }
    } catch (err) {
      setHrError("Erreur serveur lors de l'embauche.");
    }
  };

  const handleStaffShiftChange = async (staffId: string, shift: string) => {
    try {
      await fetch(`/api/hr/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shift }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStaffStatusChange = async (staffId: string, status: string) => {
    try {
      await fetch(`/api/hr/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStaffSalaryChange = async (staffId: string, salary: string) => {
    try {
      await fetch(`/api/hr/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStaffDelete = async (staffId: string) => {
    try {
      await fetch(`/api/hr/${staffId}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Accounting Actions
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);
    setExpenseSuccess(null);

    try {
      const numericAmount = -Math.abs(parseFloat(newExpenseForm.amount));
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          type: "EXPENSE",
          status: "PAID",
          description: newExpenseForm.description,
          category: newExpenseForm.category,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setExpenseSuccess("Dépense enregistrée dans le livre comptable !");
        setNewExpenseForm({ amount: "", description: "", category: "GENERAL" });
        fetchData();
      } else {
        setExpenseError(data.message || "Erreur lors du log de transaction.");
      }
    } catch (err) {
      setExpenseError("Erreur serveur lors de la transaction.");
    }
  };

  // Stock inventory Actions
  const handleInventoryStockChange = async (itemId: string, newQuantity: number) => {
    try {
      await fetch(`/api/inventory/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryError(null);
    setInventorySuccess(null);
    if (!sites[0]?.id) return;

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInventoryForm,
          quantity: parseFloat(newInventoryForm.quantity),
          minThreshold: parseFloat(newInventoryForm.minThreshold),
          siteId: sites[0].id,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setInventorySuccess("Article de stock ajouté avec succès !");
        setNewInventoryForm({ name: "", category: "Food", quantity: "20", unit: "kg", minThreshold: "5" });
        fetchData();
      } else {
        setInventoryError(data.message || "Impossible de créer le stock.");
      }
    } catch (err) {
      setInventoryError("Erreur serveur lors du stock.");
    }
  };

  // F&B orders Actions
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setOrderSuccess(null);

    if (!newOrderForm.dishId) {
      setOrderError("Sélectionnez au moins un article culinaire ou boisson.");
      return;
    }

    try {
      const response = await fetch("/api/restaurant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newOrderForm.type,
          tableNumber: newOrderForm.type !== "ROOM_SERVICE" ? newOrderForm.tableNumber : null,
          roomNumber: newOrderForm.type === "ROOM_SERVICE" ? newOrderForm.roomNumber : null,
          items: [{ dishId: newOrderForm.dishId, quantity: parseInt(newOrderForm.quantity as any) }],
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setOrderSuccess("Commande de service enregistrée !");
        setNewOrderForm({ ...newOrderForm, dishId: "", quantity: 1 });
        fetchData();
      } else {
        setOrderError(data.message || "Erreur de création de commande.");
      }
    } catch (err) {
      setOrderError("Erreur serveur F&B.");
    }
  };

  const handleOrderUpdateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/restaurant/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Salles de Réception Actions
  const handleCreateHallBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setHallError(null);
    setHallSuccess(null);

    try {
      const response = await fetch("/api/halls/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHallBookingForm),
      });
      const data = await response.json();
      if (data.status === "success") {
        setHallSuccess("Réservation de salle enregistrée !");
        setNewHallBookingForm({
          hallId: "",
          clientName: "",
          clientPhone: "",
          eventDate: "",
          durationHours: "6",
        });
        fetchData();
      } else {
        setHallError(data.message || "Erreur de réservation.");
      }
    } catch (err) {
      setHallError("Erreur serveur lors de la planification.");
    }
  };

  const handleHallBookingUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await fetch(`/api/halls/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // User Management Actions (RBAC)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });
      const data = await response.json();
      if (data.status === "success") {
        setUserSuccess("Nouvel utilisateur enregistré avec succès !");
        setNewUserForm({ name: "", email: "", password: "", role: "CLIENT" });
        fetchData();
      } else {
        setUserError(data.message || "Erreur de création du compte.");
      }
    } catch (err) {
      setUserError("Erreur serveur lors de la création.");
    }
  };

  const handleUserRoleChange = async (userId: string, role: string) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update user role", err);
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action supprimera également ses profils et préférences liés.")) {
      return;
    }
    try {
      await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  // Marketing & Promotions Actions
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromoForm),
      });
      const data = await response.json();
      if (data.status === "success") {
        setPromoSuccess("Offre promotionnelle créée avec succès !");
        setNewPromoForm({
          title: "",
          description: "",
          discountPct: "15",
          promoCode: "ASTORIA15",
          image: "suite2.jpg",
          startDate: "",
          endDate: "",
        });
        fetchData();
      } else {
        setPromoError(data.message || "Erreur de création de la promotion.");
      }
    } catch (err) {
      setPromoError("Erreur serveur lors de la création.");
    }
  };

  const handlePromoToggleActive = async (promoId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/promotions/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle promotion status", err);
    }
  };

  const handlePromoDelete = async (promoId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette promotion ?")) return;
    try {
      await fetch(`/api/promotions/${promoId}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Failed to delete promotion", err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventError(null);
    setEventSuccess(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEventForm),
      });
      const data = await response.json();
      if (data.status === "success") {
        setEventSuccess("Événement créé avec succès !");
        setNewEventForm({
          title: "",
          description: "",
          eventDate: "",
          price: "15000",
          image: "bar2.jpg",
        });
        fetchData();
      } else {
        setEventError(data.message || "Erreur de création de l'événement.");
      }
    } catch (err) {
      setEventError("Erreur serveur lors de la création.");
    }
  };

  const handleEventToggleActive = async (eventId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle event status", err);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet événement ?")) return;
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  // Analytical stats
  const totalRooms = rooms.length;


  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const cleaningCount = rooms.filter((r) => r.status === "CLEANING").length;
  const maintenanceCount = rooms.filter((r) => r.status === "MAINTENANCE").length;
  const lowStockCount = inventory.filter((item) => item.quantity <= item.minThreshold).length;

  // accounting ledger balance stats
  const totalIncomes = transactions.filter(t => t.amount > 0 && t.status === "PAID").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0 && t.status === "PAID").reduce((sum, t) => sum + t.amount, 0);
  const netTreasury = totalIncomes + totalExpenses;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-bold tracking-widest text-[#b08b45] uppercase border border-[#c5a059]/30 px-2.5 py-1 rounded hover:bg-[#c5a059]/10 transition-colors bg-white shadow-sm">
            ← Site Client
          </Link>
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Logo Astoria Palace" 
              className="h-10 w-auto object-contain rounded bg-white p-0.5 border border-slate-200 shadow-sm" 
            />
            <div className="flex flex-col">
              <h1 className="text-base font-extrabold font-serif text-slate-900 tracking-wide leading-tight">
                SGHI — ASTORIA PALACE
              </h1>
              <div className="flex items-center gap-0.5 text-[9px] text-[#c5a059] font-bold">
                <span>★</span><span>★</span><span>★</span><span>★</span>
                <span className="text-slate-500 font-sans normal-case tracking-normal ml-2 text-[9px]">Console de Gestion</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs text-slate-600 font-semibold">Bdd Connectée (SQLite)</span>
        </div>
      </header>

      {/* DASHBOARD CORE CONTENT */}
      {error && (
        <div className="m-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#0d5ca3] border-t-transparent animate-spin" />
          <span className="text-sm text-slate-450">Synchronisation en cours...</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 p-6 flex flex-col gap-6 font-sans">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-2">Hébergement & Services</p>
                <nav className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide">
                  <button 
                    onClick={() => setActiveTab("analytics")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "analytics" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">📊</span>
                    Analytique & KPIs
                  </button>

                  <button 
                    onClick={() => setActiveTab("rooms")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "rooms" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🏨</span>
                    Chambres ({totalRooms})
                  </button>

                  <button 
                    onClick={() => setActiveTab("housekeeping")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "housekeeping" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🧹</span>
                    Housekeeping ({rooms.filter(r => r.status === 'CLEANING' || r.status === 'MAINTENANCE').length})
                  </button>

                  <button 
                    onClick={() => setActiveTab("concierge")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "concierge" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🛎️</span>
                    Conciergerie ({concierge.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length})
                  </button>
                </nav>
              </div>

              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-2">Restauration & Congrès</p>
                <nav className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide">
                  <button 
                    onClick={() => setActiveTab("restaurant")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "restaurant" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🍽️</span>
                    Restaurant & Bar ({orders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED').length})
                  </button>

                  <button 
                    onClick={() => setActiveTab("halls")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "halls" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🎪</span>
                    Salles / Congrès
                  </button>
                </nav>
              </div>

              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-2">Gestion & Back Office</p>
                <nav className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide">
                  <button 
                    onClick={() => setActiveTab("crm")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "crm" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">👥</span>
                    Clients & CRM
                  </button>

                  <button 
                    onClick={() => setActiveTab("hr")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "hr" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">👔</span>
                    RH (Employés : {staff.length})
                  </button>

                  <button 
                    onClick={() => setActiveTab("accounting")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "accounting" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">📈</span>
                    Comptabilité
                  </button>

                  <button 
                    onClick={() => setActiveTab("housekeeping")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "housekeeping" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🧹</span>
                    Housekeeping
                  </button>

                  <button 
                    onClick={() => setActiveTab("inventory")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "inventory" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">📦</span>
                    Stocks & Épicerie 
                    {lowStockCount > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {lowStockCount}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveTab("marketing")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "marketing" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">📢</span>
                    Marketing / Offres
                  </button>

                  <button 
                    onClick={() => setActiveTab("rbac")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "rbac" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🔑</span>
                    Accès & Rôles
                  </button>

                  <button 
                    onClick={() => setActiveTab("audit")}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                      activeTab === "audit" 
                        ? "bg-[#0d5ca3] text-white shadow-sm" 
                        : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-sm">🌙</span>
                    Clôture & Settings
                  </button>
                </nav>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-3">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs shadow-sm">
                <span className="block font-bold text-slate-500 mb-1">Établissement</span>
                <span className="block text-[#0d5ca3] font-bold">{sites[0]?.name || "Astoria Palace"}</span>
                <span className="block text-slate-550 mt-1">{sites[0]?.location || "Yopougon, Abidjan"}</span>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-500/5 border border-[#c5a059]/35 text-[11px] font-semibold text-slate-700 shadow-sm">
                <span className="block font-extrabold uppercase tracking-wide text-[#b08b45] mb-2">Structure Officielle</span>
                <div className="flex flex-col gap-1.5 font-bold">
                  <div className="flex justify-between">
                    <span>🛏️ Chambres :</span>
                    <span className="text-slate-950">70</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✨ Suites :</span>
                    <span className="text-slate-950">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>👑 S. Présidentielles :</span>
                    <span className="text-slate-950">2</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN DESK PANEL */}
          <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Taux d'Occupation</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold font-serif text-slate-900">
                    {totalRooms ? Math.round((occupiedCount / totalRooms) * 100) : 0}%
                  </span>
                  <span className="text-[10px] text-slate-500">({occupiedCount}/{totalRooms} ch.)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Trésorerie nette</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-2xl font-bold font-serif ${netTreasury >= 0 ? 'text-[#b08b45]' : 'text-rose-600'}`}>
                    {netTreasury.toLocaleString("fr-FR")} F
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Effectifs RH actifs</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold font-serif text-indigo-600">{staff.filter(s => s.status === 'ACTIVE').length}</span>
                  <span className="text-[10px] text-slate-550">salariés postés</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Alertes de Stock</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-2xl font-bold font-serif ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {lowStockCount}
                  </span>
                  <span className="text-[10px] text-slate-550">articles critiques</span>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: ROOMS */}
            {activeTab === "rooms" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Heatmap & Statuts des Chambres</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-550 mt-1.5 font-semibold">
                      <span>Capacité Officielle :</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold border border-slate-200">70 Chambres</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#c5a059]/10 text-[#b08b45] font-extrabold border border-[#c5a059]/20">5 Suites</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-750 font-extrabold">2 Suites Présidentielles</span>
                    </div>
                  </div>
                  
                  {/* Legend colors */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-600 bg-white px-4 py-2 border border-slate-200/80 shadow-sm rounded-lg">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Libre</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c5a059]" /> Occupée</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Nettoyage</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Réparation</span>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {rooms.map((room) => {
                    const isOccupied = room.status === "OCCUPIED";
                    const isCleaning = room.status === "CLEANING";
                    const isMaintenance = room.status === "MAINTENANCE";
                    
                    let bgBorderClass = "border-slate-200 bg-white hover:border-emerald-500/40 shadow-sm";
                    let statusDot = "bg-emerald-500";
                    if (isOccupied) {
                      bgBorderClass = "border-[#c5a059]/35 hover:border-[#c5a059]/60 bg-[#c5a059]/5 shadow-sm";
                      statusDot = "bg-[#c5a059]";
                    } else if (isCleaning) {
                      bgBorderClass = "border-indigo-200 hover:border-indigo-400 bg-indigo-50/70 shadow-sm";
                      statusDot = "bg-indigo-500";
                    } else if (isMaintenance) {
                      bgBorderClass = "border-rose-200 hover:border-rose-400 bg-rose-50/70 shadow-sm";
                      statusDot = "bg-rose-500";
                    }

                    return (
                      <div 
                        key={room.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between min-h-32 transition-all ${bgBorderClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold font-serif tracking-wide text-slate-900">{room.number}</span>
                          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                            {room.roomType?.name.split(' ').pop()}
                          </span>
                          
                          {/* Selector */}
                          <select 
                            value={room.status}
                            onChange={(e) => handleRoomStatusChange(room.id, e.target.value)}
                            className="w-full text-[10px] py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold focus:outline-none focus:border-[#c5a059] focus:bg-white"
                          >
                            <option value="AVAILABLE">Libre</option>
                            <option value="OCCUPIED">Occupée</option>
                            <option value="CLEANING">Nettoyage</option>
                            <option value="MAINTENANCE">SAV / Réparer</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <TapeChartPanel rooms={rooms} reservations={reservations} />

                {/* Bookings & Register split */}
                <div className="grid lg:grid-cols-3 gap-8 mt-4">
                  {/* Bookings List */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-base font-bold text-slate-900 font-serif">Arrivées & KYC Résidents</h3>
                    <div className="flex flex-col gap-3">
                      {reservations.length === 0 ? (
                        <div className="p-6 text-center bg-white border border-slate-200 rounded-xl text-slate-450 text-xs">
                          Aucun séjour enregistré.
                        </div>
                      ) : (
                        reservations.map((res) => {
                          const checkInDate = new Date(res.checkIn).toLocaleDateString("fr-FR");
                          const checkOutDate = new Date(res.checkOut).toLocaleDateString("fr-FR");
                          const isKycSubmitted = res.checkInStatus === "KYC_SUBMITTED" || res.kycData;

                          return (
                            <div key={res.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 border border-slate-200 text-slate-700">Ch. {res.room?.number}</span>
                                  <span className="text-xs text-[#0d5ca3] font-bold">{res.room?.roomType?.name}</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase font-serif">{res.client?.name}</h4>
                                <div className="text-[11px] text-slate-500 mt-1">
                                  <span>📅 {checkInDate} au {checkOutDate}</span> | <span>💰 {res.totalPrice.toLocaleString("fr-FR")} F</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    isKycSubmitted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-250 text-rose-700'
                                  }`}>{isKycSubmitted ? "CNI Enregistrée" : "CNI Manquante"}</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                                <span className="text-[9px] font-extrabold uppercase text-slate-500">Statut : <span className="text-[#b08b45]">{res.status}</span></span>
                                <div className="flex gap-2">
                                  {!isKycSubmitted && (
                                    <>
                                      <button 
                                        onClick={() => {
                                          const link = `${window.location.origin}/checkin/${res.id}`;
                                          navigator.clipboard.writeText(link);
                                          alert("Lien KYC copié : " + link);
                                        }}
                                        className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                                        title="Copier le lien public"
                                      >
                                        🔗 Copier Lien KYC
                                      </button>
                                      <button 
                                        onClick={() => setKycResId(res.id)}
                                        className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#b08b45] border border-[#c5a059]/40"
                                      >
                                        Saisie Manuelle
                                      </button>
                                    </>
                                  )}
                                  {res.status === "PENDING" && (
                                    <button 
                                      onClick={() => handleReservationStatusChange(res.id, "CONFIRMED")}
                                      className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#0d5ca3] text-white hover:bg-[#0d5ca3]/90"
                                    >
                                      Check-in
                                    </button>
                                  )}
                                  {res.status === "CONFIRMED" && (
                                    <button 
                                      onClick={() => handleReservationStatusChange(res.id, "COMPLETED")}
                                      className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                    >
                                      Check-out
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Booking form */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Nouvelle Réservation</h3>
                    <form onSubmit={handleCreateBooking} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3.5 text-xs font-semibold">
                      {bookingError && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">{bookingError}</div>}
                      {bookingSuccess && <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{bookingSuccess}</div>}

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-600">Client</label>
                        <select 
                          required
                          value={newBooking.clientId}
                          onChange={(e) => setNewBooking({ ...newBooking, clientId: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        >
                          <option value="">Sélectionner un client...</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-600">Chambre Libre</label>
                        <select 
                          required
                          value={newBooking.roomId}
                          onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        >
                          <option value="">Sélectionner...</option>
                          {rooms.filter(r => r.status === "AVAILABLE").map((r) => (
                            <option key={r.id} value={r.id}>N° {r.number} — {r.roomType?.name} ({r.roomType?.price} F)</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-600">Arrivée</label>
                          <input 
                            type="date"
                            required
                            value={newBooking.checkIn}
                            onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-600">Départ</label>
                          <input 
                            type="date"
                            required
                            value={newBooking.checkOut}
                            onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                      </div>

                      <button type="submit" className="py-2.5 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-bold uppercase transition-all shadow-sm">
                        Enregistrer séjour
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HR */}
            {activeTab === "hr" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Registre du Personnel (RH)</h2>
                    <p className="text-xs text-slate-550">Gestion des fiches de paye, types de contrat et horaires de shift des employés.</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Employees Directory */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-base font-bold text-slate-900 font-serif">Fiches Salariés</h3>
                    <div className="flex flex-col gap-3">
                      {staff.length === 0 ? (
                        <div className="p-6 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                          Aucun employé enregistré dans le registre RH.
                        </div>
                      ) : (
                        staff.map((employee) => (
                          <div key={employee.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#0d5ca3]/15 text-[#0d5ca3]">{employee.position}</span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">{employee.contractType}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 font-serif">{employee.user?.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{employee.user?.email}</p>
                              <div className="mt-2.5 flex flex-wrap items-center gap-4">
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Salaire</span>
                                  <input 
                                    type="number"
                                    defaultValue={employee.salary}
                                    onBlur={(e) => handleStaffSalaryChange(employee.id, e.target.value)}
                                    className="w-24 text-[11px] font-bold border border-slate-200 rounded p-0.5 bg-slate-50 focus:bg-white text-slate-800"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Shift Horaire</span>
                                  <select 
                                    value={employee.shift}
                                    onChange={(e) => handleStaffShiftChange(employee.id, e.target.value)}
                                    className="text-[11px] font-bold border border-slate-200 rounded p-0.5 bg-slate-50 text-slate-800"
                                  >
                                    <option value="Matin (06h - 14h)">Matin (06h - 14h)</option>
                                    <option value="Après-midi (14h - 22h)">Après-midi (14h - 22h)</option>
                                    <option value="Nuit (22h - 06h)">Nuit (22h - 06h)</option>
                                    <option value="Administratif (08h - 17h)">Administratif (08h - 17h)</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-slate-400 mb-1">Présence</span>
                                <select 
                                  value={employee.status}
                                  onChange={(e) => handleStaffStatusChange(employee.id, e.target.value)}
                                  className={`text-[10px] font-bold border border-slate-200 rounded p-1 ${
                                    employee.status === "ACTIVE" 
                                      ? "bg-emerald-50 text-emerald-700" 
                                      : "bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  <option value="ACTIVE">Actif / Poste</option>
                                  <option value="CONGE">Congés</option>
                                  <option value="ABSENT">Absent</option>
                                </select>
                              </div>
                              <button 
                                onClick={() => handleStaffDelete(employee.id)}
                                className="text-[9px] font-extrabold text-rose-500 hover:underline mt-1 self-start sm:self-end"
                              >
                                Licencier / Désactiver
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Employee Form */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Nouvel Employé</h3>
                    <form onSubmit={handleCreateStaff} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3.5 text-xs font-semibold">
                      {hrError && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">{hrError}</div>}
                      {hrSuccess && <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{hrSuccess}</div>}

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Nom complet</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Patrice Yao"
                          value={newStaffForm.name}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Email</label>
                        <input 
                          type="email"
                          required
                          placeholder="Ex: patrice.yao@astoria.ci"
                          value={newStaffForm.email}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Poste</label>
                          <select 
                            value={newStaffForm.position}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, position: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          >
                            <option value="Receptionist">Réceptionniste</option>
                            <option value="Housekeeping">Gouvernante</option>
                            <option value="Chef">Chef Cuisine</option>
                            <option value="Waiter">Serveur</option>
                            <option value="Bartender">Barman</option>
                            <option value="Manager">Comptable / Cadre</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Contrat</label>
                          <select 
                            value={newStaffForm.contractType}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, contractType: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          >
                            <option value="CDI">CDI</option>
                            <option value="CDD">CDD</option>
                            <option value="Stage">Stage</option>
                            <option value="Extra">Extra</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Salaire Mensuel (FCFA)</label>
                        <input 
                          type="number"
                          required
                          value={newStaffForm.salary}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, salary: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>

                      <button type="submit" className="py-2.5 rounded bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white font-bold uppercase transition-all shadow-sm">
                        Embaucher Salarié
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ACCOUNTING */}
            {activeTab === "accounting" && (
              <AccountingPanel transactions={transactions} onRefresh={fetchData} />
            )}

            {/* TAB CONTENT: INVENTORY */}
            {activeTab === "inventory" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Gestion des Stocks & Épicerie</h2>
                  <p className="text-xs text-slate-550">Ajustez les stocks en temps réel et recevez des alertes automatiques en cas de stock insuffisant.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Stock table */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-base font-bold text-slate-900 font-serif">Inventaire Général</h3>
                    
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3">Article</th>
                            <th className="px-5 py-3">Catégorie</th>
                            <th className="px-5 py-3 text-center">Quantité Actuelle</th>
                            <th className="px-5 py-3 text-center">Ajuster rapide</th>
                            <th className="px-5 py-3 text-right">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-semibold">
                          {inventory.map((item) => {
                            const isLow = item.quantity <= item.minThreshold;

                            return (
                              <tr key={item.id} className={`hover:bg-slate-50/50 ${isLow ? 'bg-rose-500/[0.01]' : ''}`}>
                                <td className="px-5 py-3 text-slate-900 font-bold">{item.name}</td>
                                <td className="px-5 py-3 text-slate-500">{item.category}</td>
                                <td className="px-5 py-3 text-center font-serif font-extrabold">{item.quantity} {item.unit}</td>
                                <td className="px-5 py-3 text-center">
                                  <div className="inline-flex gap-1">
                                    <button 
                                      onClick={() => handleInventoryStockChange(item.id, item.quantity - 1)}
                                      className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 font-extrabold"
                                    >
                                      -1
                                    </button>
                                    <button 
                                      onClick={() => handleInventoryStockChange(item.id, item.quantity + 1)}
                                      className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 font-extrabold"
                                    >
                                      +1
                                    </button>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    isLow ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    {isLow ? "Alerte réappro" : "Disponible"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add stock item form */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Nouvel Article</h3>
                    <form onSubmit={handleCreateInventoryItem} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3.5 text-xs font-semibold">
                      {inventoryError && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">{inventoryError}</div>}
                      {inventorySuccess && <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{inventorySuccess}</div>}

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Nom de l'article</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Savons d'accueil 30g"
                          value={newInventoryForm.name}
                          onChange={(e) => setNewInventoryForm({ ...newInventoryForm, name: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Catégorie</label>
                          <select 
                            value={newInventoryForm.category}
                            onChange={(e) => setNewInventoryForm({ ...newInventoryForm, category: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          >
                            <option value="Food">Nourriture / F&B</option>
                            <option value="Beverage">Boissons / Bar</option>
                            <option value="Linen">Linge & Literie</option>
                            <option value="Housekeeping">Produits d'Entretien</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Unité</label>
                          <input 
                            type="text"
                            required
                            placeholder="Ex: kg, unit, bottle"
                            value={newInventoryForm.unit}
                            onChange={(e) => setNewInventoryForm({ ...newInventoryForm, unit: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Qte Initiale</label>
                          <input 
                            type="number"
                            required
                            value={newInventoryForm.quantity}
                            onChange={(e) => setNewInventoryForm({ ...newInventoryForm, quantity: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Seuil Alerte</label>
                          <input 
                            type="number"
                            required
                            value={newInventoryForm.minThreshold}
                            onChange={(e) => setNewInventoryForm({ ...newInventoryForm, minThreshold: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                      </div>

                      <button type="submit" className="py-2.5 rounded bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white font-bold uppercase transition-all shadow-sm">
                        Ajouter Article
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESTAURANT & BAR */}
            {activeTab === "restaurant" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Restaurant & Pool Bar</h2>
                  <p className="text-xs text-slate-550">Saisissez les tickets de commande en direct et suivez la facturation.</p>
                </div>

                <RestaurantPosPanel orders={orders} dishes={dishes} onRefresh={fetchData} />
              </div>
            )}

            {/* TAB CONTENT: EVENT HALLS */}
            {activeTab === "halls" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Salles de Réception & Congrès</h2>
                  <p className="text-xs text-slate-550">Planification des banquets, mariages et séminaires d'affaires.</p>
                </div>

                {/* Salles Listing grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {halls.map((hall) => (
                    <div key={hall.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex gap-4">
                      {hall.image && (
                        <img 
                          src={`/${hall.image}`} 
                          alt={hall.name}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0d5ca3] font-serif uppercase">{hall.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{hall.description}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-bold">
                          <span className="text-slate-700">🎪 Capacité : {hall.capacity} pers.</span>
                          <span className="text-[#b08b45] font-serif">💰 Tarif : {hall.pricePerHour.toLocaleString("fr-FR")} F/heure</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mt-2">
                  {/* Hall Bookings List */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-base font-bold text-slate-900 font-serif">Planning des Réservations</h3>

                    <div className="flex flex-col gap-3">
                      {hallBookings.length === 0 ? (
                        <div className="p-6 text-center bg-white border border-slate-200 rounded-xl text-slate-450 text-xs">
                          Aucun événement programmé.
                        </div>
                      ) : (
                        hallBookings.map((bk) => {
                          const eventDate = new Date(bk.eventDate).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                          const isConfirmed = bk.status === "CONFIRMED";

                          return (
                            <div key={bk.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold">
                              <div>
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#0d5ca3]/15 text-[#0d5ca3] uppercase">{bk.hall?.name}</span>
                                <h4 className="text-sm font-bold text-slate-900 font-serif mt-1.5 uppercase">{bk.clientName}</h4>
                                <div className="text-[10px] text-slate-500 mt-1">
                                  <span>📅 Date : {eventDate}</span> | <span>🕒 Durée : {bk.durationHours} heures</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  <span>📞 Contact : {bk.clientPhone}</span> | <span className="text-slate-900 font-extrabold">Total : {bk.totalPrice.toLocaleString("fr-FR")} F</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                                <span className={`text-[10px] font-bold uppercase ${
                                  isConfirmed ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded' 
                                  : 'text-[#b08b45] bg-[#c5a059]/10 border border-[#c5a059]/20 px-1.5 py-0.5 rounded animate-pulse'
                                }`}>
                                  {bk.status}
                                </span>

                                {!isConfirmed && (
                                  <button 
                                    onClick={() => handleHallBookingUpdateStatus(bk.id, "CONFIRMED")}
                                    className="px-2.5 py-1 rounded text-[9px] font-extrabold bg-[#0d5ca3] text-white hover:bg-[#0d5ca3]/90 shadow-sm"
                                  >
                                    Confirmer & Encaisser
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Salles Form */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Réserver une Salle</h3>
                    <form onSubmit={handleCreateHallBooking} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3.5 text-xs font-semibold">
                      {hallError && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">{hallError}</div>}
                      {hallSuccess && <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{hallSuccess}</div>}

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Salle Événementielle</label>
                        <select 
                          required
                          value={newHallBookingForm.hallId}
                          onChange={(e) => setNewHallBookingForm({ ...newHallBookingForm, hallId: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        >
                          <option value="">Sélectionner...</option>
                          {halls.map((h) => (
                            <option key={h.id} value={h.id}>{h.name} ({h.pricePerHour} F/h)</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Nom du client</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Entreprise Solibra"
                          value={newHallBookingForm.clientName}
                          onChange={(e) => setNewHallBookingForm({ ...newHallBookingForm, clientName: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-655">Téléphone contact</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: +225 07 00 00 00 00"
                          value={newHallBookingForm.clientPhone}
                          onChange={(e) => setNewHallBookingForm({ ...newHallBookingForm, clientPhone: e.target.value })}
                          className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Date</label>
                          <input 
                            type="datetime-local"
                            required
                            value={newHallBookingForm.eventDate}
                            onChange={(e) => setNewHallBookingForm({ ...newHallBookingForm, eventDate: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-655">Heures</label>
                          <input 
                            type="number"
                            required
                            value={newHallBookingForm.durationHours}
                            onChange={(e) => setNewHallBookingForm({ ...newHallBookingForm, durationHours: e.target.value })}
                            className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                          />
                        </div>
                      </div>

                      <button type="submit" className="py-2.5 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-bold uppercase transition-all shadow-sm">
                        Planifier Événement
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RBAC */}
            {activeTab === "rbac" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-[#c5a059]/30 text-xs text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h3 className="font-bold text-[#b08b45] uppercase tracking-wide flex items-center gap-1.5 text-sm mb-1">
                      <span>🔑</span> Contrôle d'Accès de Haute Intégrité (RBAC)
                    </h3>
                    <p className="font-semibold text-slate-600">
                      Actuellement : <strong className="text-amber-800">DÉSACTIVÉ (AUTH_ENABLED = false)</strong>. Les APIs et les vues sont bypassées pour permettre l'exploration complète.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-amber-500/20 text-[#b08b45] font-black border border-[#c5a059]/40 text-[10px] tracking-wider uppercase whitespace-nowrap self-start md:self-auto">
                    Mode Libre / Démo
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Directory table */}
                  <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-serif font-bold text-slate-900">Registre des Utilisateurs & Rôles</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-full">
                        {users.length} comptes enregistrés
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="pb-3">Utilisateur</th>
                            <th className="pb-3">E-mail</th>
                            <th className="pb-3">Niveau d'Accès (Rôle)</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                              <td className="py-3 font-bold text-slate-900">{user.name || "Sans nom"}</td>
                              <td className="py-3 text-slate-600">{user.email}</td>
                              <td className="py-3">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                  className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-[#c5a059]"
                                >
                                  <option value="CLIENT">CLIENT (Visiteur)</option>
                                  <option value="STAFF">STAFF (Employé)</option>
                                  <option value="ADMIN">ADMIN (Directeur)</option>
                                </select>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleUserDelete(user.id)}
                                  className="text-rose-600 hover:text-rose-800 transition-colors text-[10px] font-bold uppercase"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add User form card */}
                  <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4 h-fit">
                    <h3 className="text-base font-serif font-bold text-slate-900">Créer un Nouvel Accès</h3>
                    
                    <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs font-semibold">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Nom Complet</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: SERGE ALAIN KOFFI"
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Adresse E-mail</label>
                        <input
                          type="email"
                          required
                          placeholder="Ex: serge.koffi@astoriapalace.ci"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Mot de passe temporaire</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Niveau d'Accès</label>
                        <select
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3]"
                        >
                          <option value="CLIENT">CLIENT (Accès réservations)</option>
                          <option value="STAFF">STAFF (Gestion courante)</option>
                          <option value="ADMIN">ADMIN (Directeur Général)</option>
                        </select>
                      </div>

                      {userSuccess && (
                        <p className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">{userSuccess}</p>
                      )}
                      {userError && (
                        <p className="p-2 rounded bg-red-50 border border-red-200 text-[10px] text-red-650">{userError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 rounded bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white hover:brightness-110 transition-all font-bold uppercase text-[10px] tracking-wider shadow-sm"
                      >
                        Enregistrer l'Accès
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MARKETING */}
            {activeTab === "marketing" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                
                {/* Intro row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Gestion des Offres & Événements</h2>
                    <p className="text-xs text-slate-550 mt-1">Créez des promotions, distribuez des codes de réduction et planifiez les activités d'animation de l'hôtel.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* PROMOTIONS COLUMN */}
                  <div className="space-y-6">
                    {/* Add Promo Card */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                        <span>🎁</span> Créer une Offre Promotionnelle
                      </h3>
                      
                      <form onSubmit={handleCreatePromo} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Titre de l'Offre</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Escapade Saint-Valentin"
                            value={newPromoForm.title}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, title: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Description de la Promotion</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Décrivez les avantages de l'offre (ex: bouteille offerte, accès lagon, etc.)"
                            value={newPromoForm.description}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, description: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059] resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Réduction (%)</label>
                          <input
                            type="number"
                            placeholder="Ex: 15"
                            value={newPromoForm.discountPct}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, discountPct: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Code Promo</label>
                          <input
                            type="text"
                            placeholder="Ex: VALENTIN15"
                            value={newPromoForm.promoCode}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, promoCode: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Date de Début</label>
                          <input
                            type="date"
                            required
                            value={newPromoForm.startDate}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, startDate: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Date de Fin</label>
                          <input
                            type="date"
                            required
                            value={newPromoForm.endDate}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, endDate: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Illustration Visuelle</label>
                          <select
                            value={newPromoForm.image}
                            onChange={(e) => setNewPromoForm({ ...newPromoForm, image: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
                          >
                            <option value="suite2.jpg">Suite Junior (Interieur)</option>
                            <option value="piscine2.jpg">Piscine Lagon (Extérieur)</option>
                            <option value="bar3.jpg">Bar Lounge (Cocktails)</option>
                            <option value="jaccuzi.jpg">Espace Jacuzzi / Spa</option>
                            <option value="large_vue.jpg">Grande Vue Panoramique</option>
                          </select>
                        </div>

                        {promoSuccess && (
                          <p className="p-2.5 rounded bg-emerald-50 border border-emerald-250 text-emerald-700 sm:col-span-2">{promoSuccess}</p>
                        )}
                        {promoError && (
                          <p className="p-2.5 rounded bg-rose-50 border border-rose-255 text-rose-700 sm:col-span-2">{promoError}</p>
                        )}

                        <button
                          type="submit"
                          className="py-3 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-bold uppercase text-[10px] tracking-wider sm:col-span-2 hover:brightness-105 shadow-sm transition-all"
                        >
                          Publier la Promotion
                        </button>
                      </form>
                    </div>

                    {/* Promo List Card */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-serif font-bold text-slate-900">Promotions Actives ({promotions.length})</h3>
                      
                      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                        {promotions.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">Aucune offre promotionnelle enregistrée.</p>
                        ) : (
                          promotions.map((promo) => (
                            <div key={promo.id} className="py-4 flex items-center justify-between gap-4 text-xs font-medium">
                              <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {promo.title} 
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                    promo.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                  }`}>
                                    {promo.isActive ? 'Actif' : 'Désactivé'}
                                  </span>
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">{promo.description.substring(0, 80)}...</p>
                                <div className="flex gap-2 text-[10px] text-slate-450 mt-1 font-semibold">
                                  {promo.promoCode && <span>Code: {promo.promoCode}</span>}
                                  {promo.discountPct && <span>-{promo.discountPct}%</span>}
                                  <span>Exp: {new Date(promo.endDate).toLocaleDateString("fr-FR")}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePromoToggleActive(promo.id, promo.isActive)}
                                  className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold"
                                >
                                  {promo.isActive ? "Masquer" : "Afficher"}
                                </button>
                                <button
                                  onClick={() => handlePromoDelete(promo.id)}
                                  className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                                >
                                  Effacer
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EVENTS COLUMN */}
                  <div className="space-y-6">
                    {/* Add Event Card */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                        <span>📅</span> Planifier un Événement Publique
                      </h3>

                      <form onSubmit={handleCreateEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Nom de l'Événement</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Réveillon Jazz & Gastronomie"
                            value={newEventForm.title}
                            onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3]"
                          />
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Description</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Indiquez l'animation, le menu, les invités célèbres, etc."
                            value={newEventForm.description}
                            onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Date & Heure de l'Événement</label>
                          <input
                            type="datetime-local"
                            required
                            value={newEventForm.eventDate}
                            onChange={(e) => setNewEventForm({ ...newEventForm, eventDate: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Prix du Ticket (FCFA)</label>
                          <input
                            type="number"
                            placeholder="0 pour entrée libre"
                            value={newEventForm.price}
                            onChange={(e) => setNewEventForm({ ...newEventForm, price: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3]"
                          />
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Image de Présentation</label>
                          <select
                            value={newEventForm.image}
                            onChange={(e) => setNewEventForm({ ...newEventForm, image: e.target.value })}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
                          >
                            <option value="bar2.jpg">Lounge Bar (Ambiance Jazz)</option>
                            <option value="karaoke.jpg">Soirée Karaoké (Scène & Micro)</option>
                            <option value="restaurent.jpg">Buffet Restaurant Terroir</option>
                            <option value="Piscine.jpg">Piscine Lagon de Nuit</option>
                            <option value="salle de reception2.jpg">Grande Salle Décorée</option>
                          </select>
                        </div>

                        {eventSuccess && (
                          <p className="p-2.5 rounded bg-emerald-50 border border-emerald-255 text-emerald-700 sm:col-span-2">{eventSuccess}</p>
                        )}
                        {eventError && (
                          <p className="p-2.5 rounded bg-rose-50 border border-rose-255 text-rose-700 sm:col-span-2">{eventError}</p>
                        )}

                        <button
                          type="submit"
                          className="py-3 rounded bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white font-bold uppercase text-[10px] tracking-wider sm:col-span-2 hover:brightness-110 shadow-sm transition-all"
                        >
                          Planifier l'Événement
                        </button>
                      </form>
                    </div>

                    {/* Event List Card */}
                    <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-serif font-bold text-slate-900">Événements Planifiés ({events.length})</h3>
                      
                      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                        {events.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">Aucun événement enregistré.</p>
                        ) : (
                          events.map((evt) => (
                            <div key={evt.id} className="py-4 flex items-center justify-between gap-4 text-xs font-medium">
                              <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {evt.title}
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                    evt.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                  }`}>
                                    {evt.isActive ? 'Visible' : 'Masqué'}
                                  </span>
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">{evt.description.substring(0, 80)}...</p>
                                <div className="flex gap-2 text-[10px] text-slate-450 mt-1 font-semibold">
                                  <span>📅 {new Date(evt.eventDate).toLocaleString("fr-FR")}</span>
                                  <span>Price: {evt.price > 0 ? `${evt.price.toLocaleString("fr-FR")} F` : "Gratuit"}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEventToggleActive(evt.id, evt.isActive)}
                                  className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold"
                                >
                                  {evt.isActive ? "Masquer" : "Afficher"}
                                </button>
                                <button
                                  onClick={() => handleEventDelete(evt.id)}
                                  className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                                >
                                  Effacer
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === "analytics" && (
              <AnalyticsPanel rooms={rooms} transactions={transactions} />
            )}

            {activeTab === "housekeeping" && (
              <HousekeepingPanel rooms={rooms} onRefresh={fetchData} />
            )}

            {activeTab === "concierge" && (
              <ConciergePanel 
                concierge={concierge} 
                rooms={rooms} 
                onStatusChange={async (id, status) => {
                  try {
                    await fetch(`/api/concierge/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status }),
                    });
                    fetchData();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                onRefresh={fetchData}
              />
            )}

            {activeTab === "crm" && (
              <CrmPanel users={users} onRefresh={fetchData} />
            )}

            {activeTab === "audit" && (
              <NightAuditPanel settings={settings} onRefresh={fetchData} />
            )}

          </main>


        </div>
      )}

      {/* KYC DRAW MODAL SIMULATION */}
      {kycResId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900 font-serif mb-2">Enregistrement CNI / Passeport</h3>
            <p className="text-xs text-slate-500 mb-4">Conformément à la réglementation ivoirienne (ARTCI), enregistrez la pièce d'identité du client pour activer la clé de chambre.</p>

            <form onSubmit={handleKycSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-655 font-bold">Type de Pièce</label>
                <select 
                  value={kycForm.idType}
                  onChange={(e) => setKycForm({ ...kycForm, idType: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] focus:bg-white"
                >
                  <option value="CNI">CNI (Côte d'Ivoire)</option>
                  <option value="Passport">Passeport</option>
                  <option value="Attestation">Attestation d'Identité</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-655 font-bold">Numéro de la pièce</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: C010823901"
                  value={kycForm.idNumber}
                  onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-655 font-bold">Date d'Expiration</label>
                <input 
                  type="date"
                  value={kycForm.idExpiry}
                  onChange={(e) => setKycForm({ ...kycForm, idExpiry: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setKycResId(null)}
                  className="flex-1 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 uppercase transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-bold uppercase transition-colors hover:shadow-md hover:brightness-105 active:scale-[0.98]"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
