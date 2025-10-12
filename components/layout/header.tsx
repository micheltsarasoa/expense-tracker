"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              💰 Expense Tracker
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {session?.user?.name}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}