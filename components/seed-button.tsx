"use client";

import { Button } from "./ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SeedButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    if (!session) {
      alert("Please login first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/seed", { 
        method: "POST",
        credentials: "include",
      });
      
      if (res.ok) {
        setDone(true);
        setTimeout(() => window.location.reload(), 500);
      } else {
        alert("Seed failed: " + (await res.text()));
      }
    } catch (error) {
      console.error(error);
      alert("Error seeding data");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <span className="text-green-600">✅ Data seeded!</span>;

  return (
    <Button onClick={handleSeed} disabled={loading || !session} variant="outline">
      {loading ? "Seeding..." : "🌱 Seed Data"}
    </Button>
  );
}