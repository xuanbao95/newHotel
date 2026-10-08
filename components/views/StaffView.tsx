"use client";

import { useState } from "react";
import { useHotel } from "@/context/HotelProvider";
import type { Staff } from "@/lib/types";
import { Modal } from "../Modal";
import { PageHeader } from "../PageHeader";
import { Section } from "../Section";
import { ShiftGrid } from "../ShiftGrid";
import { StaffForm } from "../StaffForm";
import { StaffTable } from "../StaffTable";

export function StaffView() {
  const { staff, addStaff, updateStaff, deleteStaff } = useHotel();
  const [editing, setEditing] = useState<Staff | null>(null);

  const handleDelete = (s: Staff) => {
    if (window.confirm(`Xoá ${s.name}?`)) deleteStaff(s.id);
  };

  return (
    <div className="grid gap-6">
      <PageHeader title="Nhân viên" description="Sáng 6h–14h · Chiều 14h–22h · Đêm 22h–6h" />

      <Section title="Danh sách nhân viên" description={`${staff.length} người`}>
        <StaffTable staff={staff} onEdit={setEditing} onDelete={handleDelete} />
      </Section>

      <Section title="Thêm nhân viên">
        <StaffForm onSubmit={addStaff} />
      </Section>

      <Section title="Lịch ca tuần" description="Chọn nhân viên cho từng ca, thay đổi được lưu ngay.">
        <ShiftGrid />
      </Section>

      <Modal open={editing !== null} onClose={() => setEditing(null)} eyebrow="Nhân viên" title="Sửa thông tin">
        {editing && (
          <StaffForm
            key={editing.id}
            layout="stacked"
            initial={{ name: editing.name, role: editing.role, phone: editing.phone, shift: editing.shift }}
            submitLabel="Lưu"
            onCancel={() => setEditing(null)}
            onSubmit={(data) => {
              updateStaff({ ...data, id: editing.id });
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
