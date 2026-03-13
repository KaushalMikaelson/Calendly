import React, { useState } from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      <div className="flex w-full h-full relative">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-white min-w-0">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
