"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { activeBooking, buildInvoice, nextBookingId } from "@/lib/hotel";
import { createInitialState } from "@/lib/data";
import type {
  Booking,
  BookingStatus,
  Guest,
  HotelState,
  Room,
  RoomFlag,
  RoomType,
  ServiceName,
  Shift,
  Staff,
  StaffRole,
  StayType,
  WeekSchedule,
} from "@/lib/types";
import { addDays, todayISO } from "@/lib/utils";

type Action =
  | { type: "hydrate"; state: HotelState }
  | { type: "addBooking"; booking: Booking }
  | { type: "checkInBooking"; room: number; today: string }
  | { type: "checkOut"; room: number; today: string }
  | { type: "setRoomFlag"; room: number; flag: RoomFlag }
  | { type: "cancelBooking"; id: string }
  | { type: "addService"; id: string; service: ServiceName }
  | { type: "addStaff"; staff: Staff }
  | { type: "updateStaff"; staff: Staff }
  | { type: "deleteStaff"; id: number }
  | { type: "setShift"; day: number; shift: number; staffId: number | null };

function reducer(state: HotelState, action: Action): HotelState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "addBooking":
      return {
        ...state,
        bookings: [
          ...state.bookings.filter((b) => b.id !== action.booking.id),
          action.booking,
        ],
        rooms:
          action.booking.status === "Đang ở"
            ? state.rooms.map((r) =>
                r.number === action.booking.room ? { ...r, flag: "" } : r
              )
            : state.rooms,
      };

    case "checkInBooking": {
      const b = activeBooking(state.bookings, action.room);
      if (!b) return state;
      return {
        ...state,
        bookings: state.bookings.map((x) =>
          x.id === b.id
            ? { ...x, status: "Đang ở", checkIn: x.checkIn > action.today ? action.today : x.checkIn }
            : x
        ),
        rooms: state.rooms.map((r) =>
          r.number === action.room ? { ...r, flag: "" } : r
        ),
      };
    }

    case "checkOut": {
      const b = activeBooking(state.bookings, action.room);
      if (!b || b.status !== "Đang ở") return state;
      return {
        ...state,
        bookings: state.bookings.map((x) =>
          x.id === b.id ? { ...x, status: "Đã trả", paidOn: action.today } : x
        ),
        rooms: state.rooms.map((r) =>
          r.number === action.room ? { ...r, flag: "Đang dọn" } : r
        ),
      };
    }

    case "setRoomFlag":
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.number === action.room ? { ...r, flag: action.flag } : r
        ),
      };

    case "cancelBooking":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.id && b.status === "Đã đặt" ? { ...b, status: "Đã huỷ" } : b
        ),
      };

    case "addService":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.id ? { ...b, services: [...b.services, action.service] } : b
        ),
      };

    case "addStaff":
      return { ...state, staff: [...state.staff, action.staff] };

    case "updateStaff":
      return {
        ...state,
        staff: state.staff.map((s) => (s.id === action.staff.id ? action.staff : s)),
      };

    case "deleteStaff":
      return {
        ...state,
        staff: state.staff.filter((s) => s.id !== action.id),
        schedule: state.schedule.map((day) => day.map((v) => (v === action.id ? null : v))),
      };

    case "setShift":
      return {
        ...state,
        schedule: state.schedule.map((day, d) =>
          d === action.day ? day.map((v, s) => (s === action.shift ? action.staffId : v)) : day
        ),
      };

    default:
      return state;
  }
}

export interface WalkInInput extends Guest {
  checkOut: string;
  stayType?: StayType;
  checkInTime?: string;
  checkOutTime?: string;
  hours?: number;
}

export interface NewBookingInput extends Omit<Guest, "guests"> {
  room: number;
  checkIn: string;
  checkOut: string;
  guests?: number;
  stayType?: StayType;
  checkInTime?: string;
  checkOutTime?: string;
  hours?: number;
}

interface HotelContextValue extends HotelState {
  ready: boolean;
  today: string;
  createBooking: (input: NewBookingInput) => Booking;
  checkIn: (room: number, walkIn?: WalkInInput) => void;
  checkOut: (room: number) => void;
  markCleaned: (room: number) => void;
  setMaintenance: (room: number, on: boolean) => void;
  cancelBooking: (id: string) => void;
  addService: (bookingId: string, service: ServiceName) => void;
  addStaff: (staff: Omit<Staff, "id">) => void;
  updateStaff: (staff: Staff) => void;
  deleteStaff: (id: number) => void;
  setShift: (day: number, shift: number, staffId: number | null) => void;
  resetData: () => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

const INITIAL_STATE = createInitialState(todayISO());

function parseBookingStatus(dbStatus: string): BookingStatus {
  if (dbStatus === "CHECKED_IN") return "Đang ở";
  if (dbStatus === "CHECKED_OUT") return "Đã trả";
  if (dbStatus === "CANCELLED") return "Đã huỷ";
  return "Đã đặt";
}

function parseRoomFlag(dbStatus: string): RoomFlag {
  if (dbStatus === "CLEANING") return "Đang dọn";
  if (dbStatus === "MAINTENANCE") return "Bảo trì";
  return "";
}

export function HotelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [ready, setReady] = useState(true);
  const [today, setToday] = useState(todayISO());
  const stateRef = useRef(state);
  stateRef.current = state;

  // 1. Tải dữ liệu từ Supabase API routes
  const fetchAllData = useCallback(async () => {
    try {
      const [roomsRes, bookingsRes, staffRes, shiftsRes] = await Promise.all([
        fetch("/api/rooms", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/staff", { cache: "no-store" }),
        fetch("/api/shifts", { cache: "no-store" }),
      ]);

      const [roomsData, bookingsData, staffData, shiftsData] = await Promise.all([
        roomsRes.ok ? roomsRes.json() : { rooms: [] },
        bookingsRes.ok ? bookingsRes.json() : { bookings: [] },
        staffRes.ok ? staffRes.json() : { staff: [] },
        shiftsRes.ok ? shiftsRes.json() : { shifts: [] },
      ]);

      // Map Rooms
      const rooms: Room[] = (roomsData.rooms || []).map((r: any) => ({
        number: Number(r.roomNumber),
        type: (r.type || "Đơn") as RoomType,
        flag: parseRoomFlag(r.status),
      }));

      // Map Bookings
      const bookings: Booking[] = (bookingsData.bookings || []).map((b: any) => {
        let noteObj: Record<string, any> = {};
        try {
          if (b.note && b.note.startsWith("{")) noteObj = JSON.parse(b.note);
        } catch {}

        const services: ServiceName[] = (b.BookingService || []).flatMap((s: any) =>
          Array(s.quantity || 1).fill(s.serviceName as ServiceName)
        );

        return {
          id: noteObj.customId || `DP${String(b.id).padStart(3, "0")}`,
          room: b.Room?.roomNumber || 0,
          name: b.guestName || "Khách",
          phone: b.guestPhone || "",
          cccd: noteObj.cccd || "",
          guests: noteObj.guests || 1,
          checkIn: b.checkInAt ? b.checkInAt.split("T")[0] : "",
          checkOut: b.checkOutAt ? b.checkOutAt.split("T")[0] : "",
          stayType: noteObj.stayType,
          checkInTime: noteObj.checkInTime,
          checkOutTime: noteObj.checkOutTime,
          hours: noteObj.hours,
          status: parseBookingStatus(b.status),
          services,
          paidOn: b.actualCheckOut ? b.actualCheckOut.split("T")[0] : undefined,
        };
      });

      // Map Staff
      const staff: Staff[] = (staffData.staff || []).map((s: any) => ({
        id: s.id,
        name: s.fullName,
        role: (s.role === "ADMIN" ? "Quản lý" : "Lễ tân") as StaffRole,
        phone: s.phone || "",
        shift: "Sáng" as Shift,
      }));

      // Map Shift schedule (7 ngày x 3 ca)
      const schedule: WeekSchedule = Array.from({ length: 7 }, () => [null, null, null]);
      (shiftsData.shifts || []).forEach((sh: any) => {
        const d = new Date(sh.date);
        const dayIdx = (d.getDay() + 6) % 7; // T2 = 0, CN = 6
        const shiftIdx = sh.shift === "SANG" ? 0 : sh.shift === "CHIEU" ? 1 : 2;
        if (schedule[dayIdx]) {
          schedule[dayIdx][shiftIdx] = sh.employeeId;
        }
      });

      if (rooms.length > 0) {
        const nextState: HotelState = {
          rooms,
          bookings,
          staff: staff.length > 0 ? staff : stateRef.current.staff,
          schedule,
        };
        dispatch({ type: "hydrate", state: nextState });
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu từ server:", err);
    } finally {
      setReady(true);
    }
  }, []);

  // Khởi động khi app mount
  useEffect(() => {
    setToday(todayISO());
    fetchAllData();
  }, [fetchAllData]);

  // 2. Supabase Realtime Subscription thay thế StorageEvent
  useEffect(() => {
    let channel: any = null;
    try {
      channel = supabase
        .channel("hotel-realtime-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "Room" }, () => fetchAllData())
        .on("postgres_changes", { event: "*", schema: "public", table: "Booking" }, () => fetchAllData())
        .on("postgres_changes", { event: "*", schema: "public", table: "BookingService" }, () => fetchAllData())
        .on("postgres_changes", { event: "*", schema: "public", table: "Employee" }, () => fetchAllData())
        .on("postgres_changes", { event: "*", schema: "public", table: "Shift" }, () => fetchAllData())
        .subscribe();
    } catch (err) {
      console.warn("Realtime error:", err);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [fetchAllData]);

  // 3. Implement actions tương thích 100% UI
  const createBooking = useCallback(
    (input: NewBookingInput): Booking => {
      const bookingId = nextBookingId(stateRef.current.bookings);
      const booking: Booking = {
        id: bookingId,
        room: input.room,
        name: input.name.trim(),
        phone: input.phone.trim(),
        cccd: input.cccd.trim(),
        guests: input.guests ?? 1,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        stayType: input.stayType ?? "daily",
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        hours: input.hours,
        status: "Đã đặt",
        services: [],
      };

      // Optimistic update
      dispatch({ type: "addBooking", booking });

      // Call API
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      }).catch((e) => console.error("Create booking failed", e));

      return booking;
    },
    []
  );

  const checkIn = useCallback(
    (room: number, walkIn?: WalkInInput) => {
      const t = today || todayISO();
      const existing = activeBooking(stateRef.current.bookings, room);

      if (existing) {
        dispatch({ type: "checkInBooking", room, today: t });
        fetch(`/api/bookings/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check-in", today: t }),
        }).catch((e) => console.error("Check-in existing booking failed", e));
        return;
      }

      if (!walkIn) return;
      const stayType: StayType = walkIn.stayType ?? "daily";
      const bookingId = nextBookingId(stateRef.current.bookings);
      const booking: Booking = {
        id: bookingId,
        room,
        name: walkIn.name.trim(),
        phone: walkIn.phone.trim(),
        cccd: walkIn.cccd.trim(),
        guests: walkIn.guests || 1,
        checkIn: t,
        checkOut: stayType === "hourly" ? t : walkIn.checkOut > t ? walkIn.checkOut : addDays(1, t),
        stayType,
        checkInTime: walkIn.checkInTime,
        checkOutTime: walkIn.checkOutTime,
        hours: walkIn.hours,
        status: "Đang ở",
        services: [],
      };

      dispatch({ type: "addBooking", booking });

      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      }).catch((e) => console.error("Walk-in check-in failed", e));
    },
    [today]
  );

  const checkOut = useCallback(
    (room: number) => {
      const t = today || todayISO();
      const b = activeBooking(stateRef.current.bookings, room);
      const r = stateRef.current.rooms.find((x) => x.number === room);

      if (b && r) {
        const invoice = buildInvoice(b, r, t);
        dispatch({ type: "checkOut", room, today: t });

        fetch(`/api/bookings/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check-out", totalPrice: invoice.total, today: t }),
        }).catch((e) => console.error("Check-out failed", e));
      }
    },
    [today]
  );

  const markCleaned = useCallback((room: number) => {
    dispatch({ type: "setRoomFlag", room, flag: "" });
    fetch(`/api/rooms/${room}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: "" }),
    }).catch((e) => console.error("Mark cleaned failed", e));
  }, []);

  const setMaintenance = useCallback((room: number, on: boolean) => {
    const flag: RoomFlag = on ? "Bảo trì" : "";
    dispatch({ type: "setRoomFlag", room, flag });
    fetch(`/api/rooms/${room}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag }),
    }).catch((e) => console.error("Set maintenance failed", e));
  }, []);

  const cancelBooking = useCallback((id: string) => {
    dispatch({ type: "cancelBooking", id });
    fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    }).catch((e) => console.error("Cancel booking failed", e));
  }, []);

  const addService = useCallback((bookingId: string, service: ServiceName) => {
    dispatch({ type: "addService", id: bookingId, service });
    fetch(`/api/bookings/${bookingId}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service }),
    }).catch((e) => console.error("Add service failed", e));
  }, []);

  const addStaff = useCallback((staffInput: Omit<Staff, "id">) => {
    const tempId = stateRef.current.staff.reduce((m, s) => Math.max(m, s.id), 0) + 1;
    const newStaff = { ...staffInput, id: tempId };
    dispatch({ type: "addStaff", staff: newStaff });

    fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffInput),
    }).then(fetchAllData).catch((e) => console.error("Add staff failed", e));
  }, [fetchAllData]);

  const updateStaff = useCallback((staff: Staff) => {
    dispatch({ type: "updateStaff", staff });
    fetch("/api/staff", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staff),
    }).catch((e) => console.error("Update staff failed", e));
  }, []);

  const deleteStaff = useCallback((id: number) => {
    dispatch({ type: "deleteStaff", id });
    fetch(`/api/staff?id=${id}`, {
      method: "DELETE",
    }).catch((e) => console.error("Delete staff failed", e));
  }, []);

  const setShift = useCallback((day: number, shift: number, staffId: number | null) => {
    dispatch({ type: "setShift", day, shift, staffId });
    fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, shift, staffId }),
    }).catch((e) => console.error("Set shift failed", e));
  }, []);

  const resetData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  const value = useMemo<HotelContextValue>(
    () => ({
      ...state,
      ready,
      today,
      createBooking,
      checkIn,
      checkOut,
      markCleaned,
      setMaintenance,
      cancelBooking,
      addService,
      addStaff,
      updateStaff,
      deleteStaff,
      setShift,
      resetData,
    }),
    [
      state,
      ready,
      today,
      createBooking,
      checkIn,
      checkOut,
      markCleaned,
      setMaintenance,
      cancelBooking,
      addService,
      addStaff,
      updateStaff,
      deleteStaff,
      setShift,
      resetData,
    ]
  );

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel(): HotelContextValue {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel phải được dùng bên trong <HotelProvider>");
  return ctx;
}
