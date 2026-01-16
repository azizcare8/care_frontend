"use client";
import React from "react";

export default function AdminTable({ 
  title = "Data Table", 
  data = [], 
  columns = [], 
  isLoading = false,
  onRowClick = null,
  actions = []
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">{title}</h2>
        <div className="text-center py-8 text-gray-500 text-sm md:text-base">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4">{title}</h2>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide"
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={onRowClick ? "hover:bg-gray-50 cursor-pointer" : ""}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 break-words"
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full ${
                            action.variant === 'danger'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : action.variant === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`border border-gray-200 rounded-lg p-4 shadow-sm ${
              onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
            }`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="mb-3 last:mb-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {column.header}
                </div>
                <div className="text-sm text-gray-900 break-words">
                  {column.render ? column.render(row[column.key], row) : row[column.key] || 'N/A'}
                </div>
              </div>
            ))}
            {actions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                        action.variant === 'danger'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : action.variant === 'warning'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


