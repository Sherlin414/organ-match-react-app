import { Navbar } from './Navbar';

export function DashboardLayout({ links, children }) {
  return (
    <div className="app-shell">
      <Navbar links={links} />
      <main className="page-content">{children}</main>
    </div>
  );
}
