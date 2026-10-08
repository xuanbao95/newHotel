"use client";

import { useState, type FormEvent } from "react";
import { SHIFTS, SHIFT_HOURS, STAFF_ROLES } from "@/lib/data";
import type { Shift, Staff, StaffRole } from "@/lib/types";
import { Button } from "./Button";
import { Field } from "./Field";

type StaffInput = Omit<Staff, "id">;

const EMPTY: StaffInput = { name: "", role: "Lễ tân", phone: "", shift: "Sáng" };

interface StaffFormProps {
  initial?: StaffInput;
  submitLabel?: string;
  onSubmit: (staff: StaffInput) => void;
  onCancel?: () => void;
  /** Bố cục: một hàng ngang (thêm mới) hoặc lưới 2 cột (trong modal) */
  layout?: "inline" | "stacked";
}

export function StaffForm({ initial = EMPTY, submitLabel = "Thêm", onSubmit, onCancel, layout = "inline" }: StaffFormProps) {
  const [form, setForm] = useState<StaffInput>(initial);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    onSubmit({ ...form, name: form.name.trim(), phone: form.phone.trim() });
    if (layout === "inline") setForm(EMPTY);
  };

  return (
    <form
      onSubmit={submit}
      className={
        layout === "inline"
          ? "grid items-end gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[2fr,1.5fr,1.5fr,1.5fr,auto]"
          : "grid gap-4 sm:grid-cols-2"
      }
    >
      <Field label="Tên">
        <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Chức vụ">
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
          {STAFF_ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Field>
      <Field label="SĐT">
        <input className="input" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Field>
      <Field label="Ca">
        <select className="input" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as Shift })}>
          {SHIFTS.map((s) => (
            <option key={s} value={s}>
              {s} ({SHIFT_HOURS[s]})
            </option>
          ))}
        </select>
      </Field>
      <div className={layout === "inline" ? "" : "flex gap-2 sm:col-span-2"}>
        <Button type="submit" className={layout === "inline" ? "w-full" : ""}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
        )}
      </div>
    </form>
  );
}
