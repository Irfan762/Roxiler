'use client';
import { cn } from '../../lib/utils';
export function Table({ columns = [], data = [], loading = false, emptyMessage = 'No data available', onSort, sortKey, sortOrder, onRowClick, }) {
    const safeData = data || [];
    return (<div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => {
            const isActiveSort = sortKey === col.key && col.sortable;
            return (<th key={col.key} className={cn('px-4 py-3.5 text-left font-semibold text-gray-600', col.sortable && 'cursor-pointer select-none hover:bg-gray-100', col.className)} onClick={() => col.sortable && onSort?.(col.key)}>
                    <span className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && (<span className="text-xs">
                          {isActiveSort ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>)}
                    </span>
                  </th>);
        })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (<tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"/>
                    Loading...
                  </div>
                </td>
              </tr>) : safeData.length === 0 ? (<tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>) : (safeData.map((row) => (<tr key={row.id} className={cn('transition-colors hover:bg-gray-50', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(row)}>
                  {columns.map((col) => (<td key={col.key} className={cn('px-4 py-3 text-gray-700', col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>))}
                </tr>)))}
          </tbody>
        </table>
      </div>
    </div>);
}
