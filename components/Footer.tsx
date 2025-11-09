import React from 'react';
import { BookOpenIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <div className="flex justify-center items-center space-x-2 mb-2">
            <BookOpenIcon className="w-6 h-6 text-primary"/>
            <span className="font-bold text-foreground">Assignment Portal</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} MERN Assignment Portal. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;