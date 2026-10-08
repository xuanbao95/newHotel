"use client";

import { useHotel } from "@/context/HotelProvider";
import { SHIFTS, SHIFT_HOURS, WEEK_DAYS } from "@/lib/data";

export function ShiftGrid() {
  const { schedule, staff, setShift } = useHotel();

  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col">Ca</th>
            {WEEK_DAYS.map((d) => (
              <th key={d} scope="col" className="text-center">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {SHIFTS.map((shift, si) => (
            <tr key={shift}>
              <th scope="row" className="!normal-case !tracking-normal">
                <span className="block text-sm font-semibold text-slate-900">{shift}</span>
                <span className="block text-xs font-normal text-slate-400">{SHIFT_HOURS[shift]}</span>
              </th>
              {WEEK_DAYS.map((day, di) => {
                const value = schedule[di]?.[si] ?? null;
                return (
                  <td key={day} className="!px-2">
                    <select
                      className="input min-w-[9rem] !py-1.5 !text-xs"
                      aria-label={`${day} ca ${shift}`}
                      value={value ?? ""}
                      onChange={(e) => setShift(di, si, e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">—</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
