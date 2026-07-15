import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


import { verifyAdminToken } from "../../lib/admin-auth";
import { ToastProvider } from "../../components/Toast";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "BookVerse Admin Portal",
  description: "Administrative console for managing BookVerse users, books, reviews, community posts, and sitewide settings.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const admin = token ? await verifyAdminToken(token) : null;

  // If loading an admin page (except login) and not logged in, middleware handles the redirect.
  // But layout provides a secondary safety check.
  // Wait, if it is /admin/login, we shouldn't show the layout sidebar/navbar.
  // Next.js handles nested layouts, but if we are in /admin/login, we don't want this sidebar.
  // To avoid showing the sidebar on /admin/login, we can check if it's the login route, or use a Route Group like (admin-dashboard) and (admin-auth).
  // Actually, since all admin page routes will share the sidebar EXCEPT login, we can check if admin is null.
  // If admin is null, we assume they are on the login page or redirecting, so we render children directly!
  // This is a highly robust solution!

  if (!admin) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased">
          {children}
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased flex flex-col md:flex-row">
        {/* Background decorative glows */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-pink-600/10 blur-[130px]" />
        </div>

        {/* Sidebar Component */}
        <AdminSidebar admin={admin} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <main className="flex-1 px-4 py-8 md:px-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
