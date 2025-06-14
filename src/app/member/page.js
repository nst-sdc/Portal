"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { FiCode, FiStar, FiAward } from "react-icons/fi";

// Mock API fetch
const fetchMemberData = async () => {
  return new Promise((res) =>
    setTimeout(() =>
      res({
        name: "John Doe",
        devCoins: 280,
        projects: [
          {
            id: 1,
            title: "Club Website Revamp",
            description: "Redesign landing page and integrate CMS.",
            stars: 120,
          },
          {
            id: 2,
            title: "Attendance Bot",
            description: "Discord bot to track meeting attendance.",
            stars: 85,
          },
        ],
      }),
      500
    )
  );
};

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {data.name}</h1>

        {/* Dev Coins */}
        <div className="card flex items-center mb-8">
          <FiAward className="h-8 w-8 accent-emerald mr-4" />
          <div>
            <p className="text-lg font-medium">Dev Coins</p>
            <p className="text-2xl font-bold">{data.devCoins}</p>
          </div>
        </div>

        {/* Assigned Projects */}
        <h2 className="text-2xl font-semibold mb-4">Assigned Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {data.projects.map((p) => (
            <div key={p.id} className="card">
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <FiCode className="mr-2" /> {p.title}
              </h3>
              <p className="text-gray-400 mb-4">{p.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <FiStar className="mr-1" /> {p.stars}
                </span>
                <Link href={`/projects/${p.id}`} className="text-primary hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
