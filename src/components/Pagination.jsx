import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-black">
            Page <span className="text-primary">{page}</span> of <span className="text-primary">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft size={16} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              // Show only a few pages if there are many
              if (
                totalPages > 7 &&
                pageNumber !== 1 &&
                pageNumber !== totalPages &&
                (pageNumber < page - 1 || pageNumber > page + 1)
              ) {
                if (pageNumber === page - 2 || pageNumber === page + 2) {
                  return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-slate-200 bg-white text-sm font-medium text-slate-700">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold ${
                    page === pageNumber
                      ? 'z-10 bg-primary border-primary text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
