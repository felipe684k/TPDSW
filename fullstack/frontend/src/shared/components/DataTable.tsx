import React from 'react';

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title: string;
  totalCount?: number;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, title, totalCount, emptyMessage = 'No hay datos disponibles.' }: DataTableProps<T>) {
  return (
    <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
        <div className="text-xs font-semibold text-slate-300">{title}</div>
        {totalCount !== undefined && (
          <span className="text-2xs text-slate-400 bg-[#1c1d24] border border-slate-800 px-2 py-0.5 rounded font-mono">
            Total: {totalCount}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#17181e] border-b border-slate-800">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-xs text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#17181e] transition-colors">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-3 text-xs ${col.className || 'text-slate-400'} ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {col.render ? col.render(item) : col.accessor ? String(item[col.accessor]) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
