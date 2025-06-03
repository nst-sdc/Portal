"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { 
  FiUsers, 
  FiCode, 
  FiAward, 
  FiCalendar, 
  FiGithub, 
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiMapPin
} from "react-icons/fi";

// Mock data for dashboard
const mockUserData = {
  id: 1,
  name: "John Doe",
  avatar: "https://i.pravatar.cc/150?img=1",
  batch: "2023",
  rewardPoints: 850,
  githubUsername: "johndoe",
  role: "Student",
  isAdmin: true
};

const mockStats = {
  totalStudents: 42,
  totalProjects: 15,
  activeProjects: 8,
  upcomingMeetings: 3,
  myProjects: 4,
  myRewardPoints: 850,
  recentAttendance: "90%"
};

const mockProjects = [
  { id: 1, name: "AI Chat Assistant", role: "Developer", status: "Active", progress: 75 },
  { id: 2, name: "Student Portal", role: "Lead Developer", status: "Active", progress: 60 },
  { id: 3, name: "Mobile App", role: "Contributor", status: "Planning", progress: 20 }
];

const mockMeetings = [
  { 
    id: 1, 
    title: "Weekly Standup", 
    date: "2025-06-04", 
    time: "15:00", 
    location: "Room 302",
    attendanceOpen: true
  },
  { 
    id: 2, 
    title: "Project Planning", 
    date: "2025-06-07", 
    time: "10:00", 
    location: "Zoom",
    attendanceOpen: false
  }
];

const mockRecentActivity = [
  { 
    id: 1, 
    type: "project_contribution", 
    project: "AI Chat Assistant", 
    action: "Merged PR: Fix authentication bug", 
    points: 50, 
    date: "2025-06-02" 
  },
  { 
    id: 2, 
    type: "meeting_attendance", 
    meeting: "Weekly Standup", 
    action: "Attended meeting", 
    points: 10, 
    date: "2025-05-28" 
  },
  { 
    id: 3, 
    type: "issue_solved", 
    project: "Student Portal", 
    action: "Solved issue: UI responsiveness", 
    points: 30, 
    date: "2025-05-25" 
  }
];

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setUserData(mockUserData);
        setStats(mockStats);
        setProjects(mockProjects);
        setMeetings(mockMeetings);
        setRecentActivity(mockRecentActivity);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          
          {/* Projects skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/5 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          
          {/* Meetings skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/5 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          
          {/* Activity skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening in the NST Dev Club
          </p>
        </div>
        
        {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">My Reward Points</h3>
            <div className="p-2 bg-primary/10 text-primary rounded-full">
              <FiAward size={20} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.myRewardPoints}</p>
              <Link href={`/students/${userData?.id}`} className="text-sm text-primary hover:underline flex items-center mt-2">
                View breakdown <FiArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Recent attendance: {stats?.recentAttendance}
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">My Projects</h3>
            <div className="p-2 bg-primary/10 text-primary rounded-full">
              <FiCode size={20} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.myProjects}</p>
              <Link href="/projects?myProjects=true" className="text-sm text-primary hover:underline flex items-center mt-2">
                View my projects <FiArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats?.activeProjects} active in total
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Upcoming Meetings</h3>
            <div className="p-2 bg-primary/10 text-primary rounded-full">
              <FiCalendar size={20} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.upcomingMeetings}</p>
              <Link href="/meetings" className="text-sm text-primary hover:underline flex items-center mt-2">
                View schedule <FiArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Next: {meetings[0]?.date ? formatDate(meetings[0]?.date) : "None"}
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Club Members</h3>
            <div className="p-2 bg-primary/10 text-primary rounded-full">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.totalStudents}</p>
              <Link href="/students" className="text-sm text-primary hover:underline flex items-center mt-2">
                View all members <FiArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats?.totalProjects} total projects
            </div>
          </div>
        </div>
      </div>
      
      {/* My Projects */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <Link href="/projects?myProjects=true" className="text-primary hover:underline flex items-center">
            View all <FiArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map(project => (
              <div key={project.id} className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Role: {project.role}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'Active' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium mb-1">
                      {project.progress}% Complete
                    </div>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/projects/${project.id}`} 
                    className="text-sm text-primary hover:underline flex items-center justify-end"
                  >
                    View project details <FiArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You're not part of any projects yet</p>
              <Link href="/projects/new" className="btn-primary inline-flex items-center">
                Create a new project <FiArrowRight className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Meetings */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
          <Link href="/meetings" className="text-primary hover:underline flex items-center">
            View all <FiArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {meetings.length > 0 ? (
            meetings.map(meeting => (
              <div key={meeting.id} className="card p-6">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg mb-2">{meeting.title}</h3>
                  {meeting.attendanceOpen && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                      Attendance Open
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiClock className="mr-2" />
                    <span>{meeting.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="mr-2" />
                    <span>{meeting.location}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/meetings#meeting-${meeting.id}`} 
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    View details <FiArrowRight size={14} className="ml-1" />
                  </Link>
                  
                  {meeting.attendanceOpen && (
                    <button className="btn-primary btn-sm">
                      Mark Attendance
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming meetings scheduled</p>
              {userData?.isAdmin && (
                <Link href="/meetings/new" className="btn-primary inline-flex items-center">
                  Schedule a meeting <FiArrowRight className="ml-2" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
        </div>
        
        <div className="card">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.map(activity => (
                <div key={activity.id} className="p-4 flex items-start">
                  <div className={`p-2 rounded-full mr-4 ${
                    activity.type === 'project_contribution' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : activity.type === 'meeting_attendance'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    {activity.type === 'project_contribution' && <FiCode size={18} />}
                    {activity.type === 'meeting_attendance' && <FiCalendar size={18} />}
                    {activity.type === 'issue_solved' && <FiCheckCircle size={18} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.type === 'project_contribution' && `Project: ${activity.project}`}
                          {activity.type === 'meeting_attendance' && `Meeting: ${activity.meeting}`}
                          {activity.type === 'issue_solved' && `Project: ${activity.project}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.date)}
                        </span>
                        <span className="text-sm font-medium text-primary mt-1">
                          +{activity.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Admin Quick Actions - Only shown to admins */}
      {userData?.isAdmin && (
        <div className="mt-8 card p-6">
          <h2 className="text-xl font-bold mb-4">Admin Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/projects/new" className="btn-secondary flex items-center justify-center">
              <FiCode className="mr-2" /> New Project
            </Link>
            <Link href="/meetings/new" className="btn-secondary flex items-center justify-center">
              <FiCalendar className="mr-2" /> Schedule Meeting
            </Link>
            <Link href="/students" className="btn-secondary flex items-center justify-center">
              <FiUsers className="mr-2" /> Manage Students
            </Link>
            <Link href="/projects" className="btn-secondary flex items-center justify-center">
              <FiGithub className="mr-2" /> All Projects
            </Link>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
