import React from "react";

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="col-span-9 space-y-3">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}