"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function MeetingsPage() {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    link: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recipients: ["member@example.com"] }), // TODO recipients list
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage({ type: "success", text: "Meeting scheduled and emails sent!" });
      setForm({ title: "", date: "", time: "", location: "", link: "", description: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Schedule a Meeting</h1>
        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Location (Room or Online)</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Online Link (optional)</label>
            <input
              name="link"
              value={form.link}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-6 py-2"
            >
              {submitting ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
