export function EmptyRow({ colSpan, message = "Không có dữ liệu" }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="!py-10 text-center !text-slate-400">
        {message}
      </td>
    </tr>
  );
}
