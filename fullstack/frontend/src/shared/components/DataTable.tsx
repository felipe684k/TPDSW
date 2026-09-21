import React from 'react';
import { theme } from '../../utils/theme';

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
    <div className={theme.table.wrapper}>
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <div className="text-xs font-semibold text-slate-700">{title}</div>
        {totalCount !== undefined && (
          <span className="text-2xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono">
            Total: {totalCount}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-3 ${theme.table.header} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={theme.table.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className={theme.table.row}>
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-3 text-xs ${col.className || theme.table.cellText} ${
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
