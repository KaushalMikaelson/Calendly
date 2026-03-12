import React, { useState } from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-x-auto">
      <div className="flex min-w-max w-full h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-white min-w-0" style={{ minWidth: 600 }}>
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
