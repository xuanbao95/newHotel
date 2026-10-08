"use client";

import { SHIFT_HOURS } from "@/lib/data";
import type { Staff } from "@/lib/types";
import { Button } from "./Button";
import { EmptyRow } from "./EmptyRow";

interface StaffTableProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export function StaffTable({ staff, onEdit, onDelete }: StaffTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col">Tên</th>
            <th scope="col">Chức vụ</th>
            <th scope="col">SĐT</th>
            <th scope="col">Ca</th>
            <th scope="col">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staff.length === 0 && <EmptyRow colSpan={5} message="Chưa có nhân viên" />}
          {staff.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50/60">
              <td className="font-medium !text-slate-900">{s.name}</td>
              <td>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{s.role}</span>
              </td>
              <td>{s.phone}</td>
              <td>
                {s.shift} <span className="text-xs text-slate-400">{SHIFT_HOURS[s.shift]}</span>
              </td>
              <td>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(s)}>
                    Sửa
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(s)}>
                    Xoá
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
