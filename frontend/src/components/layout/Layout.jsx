import React from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:ml-0 bg-white">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

export default Layout;

