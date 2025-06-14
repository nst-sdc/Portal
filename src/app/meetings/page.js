"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { meetingsService } from "@/lib/services/meetings";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiExternalLink,
  FiVideo
} from "react-icons/fi";

export default function MeetingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await meetingsService.getAllMeetings();
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMessage({ type: "error", text: "Failed to load meetings" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Check if user is authenticated
    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to schedule a meeting." });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          created_by: user.id,
          recipients: ["member@example.com"] // TODO recipients list
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage({ type: "success", text: "Meeting scheduled successfully!" });
      setForm({ title: "", date: "", time: "", location: "", link: "", description: "" });

      // Refresh meetings list and switch to list tab
      await fetchMeetings();
      setActiveTab("list");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (date, time) => {
    const meetingDateTime = new Date(`${date}T${time}`);
    return meetingDateTime > new Date();
  };

  const upcomingMeetings = meetings.filter(meeting =>
    isUpcoming(meeting.date, meeting.startTime)
  );

  const pastMeetings = meetings.filter(meeting =>
    !isUpcoming(meeting.date, meeting.startTime)
  );

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meetings</h1>
          <button
            onClick={() => setActiveTab("create")}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Schedule Meeting
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "list"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "upcoming"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Upcoming ({upcomingMeetings.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "past"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Past ({pastMeetings.length})
          </button>
        </div>
        {(activeTab === "list" || activeTab === "upcoming" || activeTab === "past") && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading meetings...</p>
              </div>
            ) : (
              <div>
                {(() => {
                  let displayMeetings = meetings;
                  if (activeTab === "upcoming") displayMeetings = upcomingMeetings;
                  if (activeTab === "past") displayMeetings = pastMeetings;

                  if (displayMeetings.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No meetings found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {activeTab === "upcoming" && "No upcoming meetings scheduled."}
                          {activeTab === "past" && "No past meetings found."}
                          {activeTab === "list" && "No meetings have been created yet."}
                        </p>
                        <button
                          onClick={() => setActiveTab("create")}
                          className="btn-primary"
                        >
                          Schedule Your First Meeting
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-4">
                      {displayMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="card p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{meeting.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {meeting.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isUpcoming(meeting.date, meeting.startTime) && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Upcoming
                                </span>
                              )}
                              {!isUpcoming(meeting.date, meeting.startTime) && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                  Past
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <FiCalendar className="mr-2" />
                              {formatDate(meeting.date)}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <FiClock className="mr-2" />
                              {formatTime(meeting.startTime)}
                              {meeting.duration && ` (${meeting.duration} min)`}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <FiMapPin className="mr-2" />
                              {meeting.location}
                            </div>
                          </div>

                          {meeting.meetingLink && (
                            <div className="mt-4">
                              <a
                                href={meeting.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary hover:underline"
                              >
                                <FiVideo className="mr-2" />
                                Join Meeting
                                <FiExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          )}

                          {meeting.attendanceOpen && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Attendance is open!</strong>
                                {meeting.attendanceCode && (
                                  <span className="ml-2">Code: <strong>{meeting.attendanceCode}</strong></span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Schedule a New Meeting</h2>
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
        )}
      </div>
    </>
  );
}
