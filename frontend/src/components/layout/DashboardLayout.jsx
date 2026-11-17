'use client';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
export function DashboardLayout({ title, subtitle, actions, children, }) {
    return (<div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar title={title} subtitle={subtitle} actions={actions}/>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>);
}
