import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-500/30 selection:text-red-200">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
}
