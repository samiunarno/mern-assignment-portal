import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NotificationContainer from './Notification';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <NotificationContainer />
      <Footer />
    </div>
  );
};

export default Layout;