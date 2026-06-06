"use client";

import { useMemo, useState } from "react";

interface TapeChartPanelProps {
  rooms: any[];
  reservations: any[];
}

export default function TapeChartPanel({ rooms, reservations }: TapeChartPanelProps) {
  // Config: 14 days view starting from 3 days ago
  const VIEW_DAYS = 14;
  const START_OFFSET = -3; 

  const [referenceDate, setReferenceDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const shiftDates = (days: number) => {
    const newDate = new Date(referenceDate);
    newDate.setDate(newDate.getDate() + days);
    setReferenceDate(newDate);
  };

  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < VIEW_DAYS; i++) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() + START_OFFSET + i);
      arr.push(d);
    }
    return arr;
  }, [referenceDate]);

  // Sort rooms: first by Type, then by Number
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      if (a.roomType?.name < b.roomType?.name) return -1;
      if (a.roomType?.name > b.roomType?.name) return 1;
      return a.number.localeCompare(b.number);
    });
  }, [rooms]);

  // Map reservations to timeline columns (1-based index for CSS Grid)
  const getColSpan = (checkIn: string, checkOut: string) => {
    const inDate = new Date(checkIn);
    inDate.setHours(0,0,0,0);
    const outDate = new Date(checkOut);
    outDate.setHours(0,0,0,0);

    const firstViewDate = dates[0];
    const lastViewDate = dates[dates.length - 1];

    if (outDate <= firstViewDate || inDate >= lastViewDate) return null;

    // Calculate grid start (1-indexed)
    let startCol = 1;
    if (inDate > firstViewDate) {
      const diffTime = Math.abs(inDate.getTime() - firstViewDate.getTime());
      startCol = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculate grid end (exclusive)
    let endCol = VIEW_DAYS + 1;
    if (outDate < lastViewDate) {
      const diffTime = Math.abs(outDate.getTime() - firstViewDate.getTime());
      endCol = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // A reservation requires at least 1 day length
    if (endCol <= startCol) endCol = startCol + 1;

    return { startCol, endCol };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-serif">Calendrier Visuel (Tape Chart)</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Vue panoramique des affectations de chambres sur 14 jours.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDates(-7)} className="px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs shadow-sm">
            &larr; 7 jours
          </button>
          <button onClick={() => setReferenceDate(new Date(new Date().setHours(0,0,0,0)))} className="px-3 py-1.5 rounded bg-[#0d5ca3] text-white font-bold hover:bg-[#0d5ca3]/90 text-xs shadow-sm">
            Aujourd'hui
          </button>
          <button onClick={() => shiftDates(7)} className="px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs shadow-sm">
            7 jours &rarr;
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px] border-b border-slate-200">
          
          {/* Timeline Header (Days) */}
          <div className="flex bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wide">
            <div className="w-32 shrink-0 p-3 border-r border-slate-200 bg-slate-50 sticky left-0 z-20 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              Chambre
            </div>
            <div 
              className="flex-1 grid" 
              style={{ gridTemplateColumns: `repeat(${VIEW_DAYS}, minmax(60px, 1fr))` }}
            >
              {dates.map((d, i) => {
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className={`p-2 border-r border-slate-200 text-center flex flex-col justify-center ${isToday ? 'bg-[#c5a059]/10 text-[#b08b45]' : ''}`}>
                    <span className="opacity-70">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                    <span className={`text-sm ${isToday ? 'font-black' : 'font-bold text-slate-800'}`}>{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rooms Rows */}
          <div className="divide-y divide-slate-100 bg-slate-50/30">
            {sortedRooms.map(room => {
              // Find reservations for this room
              const roomRes = reservations.filter(r => r.roomId === room.id);

              return (
                <div key={room.id} className="flex relative hover:bg-slate-50 transition-colors group">
                  {/* Fixed left column (Room info) */}
                  <div className="w-32 shrink-0 p-3 flex flex-col justify-center border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors">
                    <span className="font-serif font-bold text-slate-900 text-sm">Ch. {room.number}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase truncate" title={room.roomType?.name}>
                      {room.roomType?.name.split(' ').pop()}
                    </span>
                  </div>

                  {/* Right grid column (Timeline) */}
                  <div 
                    className="flex-1 grid relative"
                    style={{ gridTemplateColumns: `repeat(${VIEW_DAYS}, minmax(60px, 1fr))` }}
                  >
                    {/* Vertical grid lines */}
                    {Array.from({ length: VIEW_DAYS }).map((_, i) => (
                      <div key={i} className="border-r border-slate-200 h-full pointer-events-none" />
                    ))}

                    {/* Reservation Blocks */}
                    {roomRes.map(res => {
                      const span = getColSpan(res.checkIn, res.checkOut);
                      if (!span) return null; // Outside viewport

                      const isPending = res.status === "PENDING";
                      const isConfirmed = res.status === "CONFIRMED";
                      const isCompleted = res.status === "COMPLETED";

                      let colorClass = "bg-slate-200 border-slate-300 text-slate-700";
                      if (isPending) colorClass = "bg-amber-100 border-amber-300 text-amber-800";
                      if (isConfirmed) colorClass = "bg-emerald-100 border-emerald-300 text-emerald-800";
                      if (isCompleted) colorClass = "bg-indigo-100 border-indigo-300 text-indigo-800";

                      return (
                        <div 
                          key={res.id}
                          className={`absolute top-1/2 -translate-y-1/2 h-[75%] rounded-md border shadow-sm px-2.5 py-1 text-[10px] font-bold leading-tight overflow-hidden truncate cursor-pointer hover:brightness-95 transition-all z-10 ${colorClass}`}
                          style={{
                            gridColumnStart: span.startCol,
                            gridColumnEnd: span.endCol,
                            marginLeft: "4px",
                            marginRight: "4px"
                          }}
                          title={`${res.client?.name} | ${new Date(res.checkIn).toLocaleDateString()} - ${new Date(res.checkOut).toLocaleDateString()}`}
                        >
                          <div className="truncate">{res.client?.name}</div>
                          <div className="font-normal opacity-80 text-[8px] mt-0.5">{res.status}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
