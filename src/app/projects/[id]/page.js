"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  FiGithub, 
  FiStar, 
  FiCode, 
  FiUsers, 
  FiArrowLeft, 
  FiCalendar, 
  FiEdit3,
  FiExternalLink
} from "react-icons/fi";

// Mock data for projects (in a real app, this would come from an API)
const mockProjects = [
  {
    id: 1,
    name: "Student Management System",
    description: "A comprehensive system to manage student records, attendance, and performance.",
    longDescription: "The Student Management System is designed to streamline administrative tasks related to student data management. It provides features for tracking attendance, managing grades, scheduling classes, and generating reports. The system is built with a modern tech stack including React for the frontend, Node.js for the backend, and MongoDB for data storage.",
    tags: ["React", "Node.js", "MongoDB"],
    stars: 24,
    forks: 8,
    contributors: 5,
    owner: "john_doe",
    repoUrl: "https://github.com/nst-dev-club/student-management",
    demoUrl: "https://student-management-demo.vercel.app",
    isUserProject: true,
    createdAt: "2023-09-15T10:30:00Z",
    updatedAt: "2024-05-20T14:45:00Z",
    contributors: [
      { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1", role: "Lead Developer" },
      { id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2", role: "Frontend Developer" },
      { id: 3, name: "Alex Wong", avatar: "https://i.pravatar.cc/150?img=3", role: "Backend Developer" },
      { id: 4, name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=4", role: "UI/UX Designer" },
      { id: 5, name: "Mike Brown", avatar: "https://i.pravatar.cc/150?img=5", role: "Database Engineer" },
    ],
    readme: `# Student Management System

## Overview
A comprehensive system to manage student records, attendance, and performance.

## Features
- Student registration and profile management
- Attendance tracking with reports
- Grade management and performance analytics
- Course scheduling and management
- Parent-teacher communication portal

## Tech Stack
- Frontend: React.js with Material UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Deployment: Docker, AWS

## Getting Started
1. Clone the repository
2. Install dependencies with \`npm install\`
3. Set up environment variables
4. Run the development server with \`npm run dev\`

## Contributing
We welcome contributions! Please see our contributing guidelines for more details.`,
  },
  // More project data would be here...
];

export default function ProjectDetail() {
  const params = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      // In a real app, you would fetch data from an API
      setTimeout(() => {
        const foundProject = mockProjects.find(p => p.id === parseInt(params.id));
        setProject(foundProject || null);
        setIsLoading(false);
      }, 1000);
    };

    fetchProject();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            Project not found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-500">
            The project you are looking for does not exist or has been removed.
          </p>
          <Link href="/projects" className="mt-4 btn-primary inline-block">
            <FiArrowLeft className="inline mr-2" /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <Link href="/projects" className="inline-flex items-center text-primary hover:underline mb-6">
        <FiArrowLeft className="mr-2" /> Back to Projects
      </Link>

      {/* Project header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {project.isUserProject && (
          <Link
            href={`/projects/${project.id}/edit`}
            className="mt-4 md:mt-0 btn-primary"
          >
            <FiEdit3 className="mr-2 inline" /> Edit Project
          </Link>
        )}
      </div>

      {/* Project stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex flex-col items-center">
          <FiStar className="text-yellow-500 mb-2 h-6 w-6" />
          <span className="text-2xl font-bold">{project.stars}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Stars</span>
        </div>
        <div className="card p-4 flex flex-col items-center">
          <FiCode className="text-green-500 mb-2 h-6 w-6" />
          <span className="text-2xl font-bold">{project.forks}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Forks</span>
        </div>
        <div className="card p-4 flex flex-col items-center">
          <FiUsers className="text-blue-500 mb-2 h-6 w-6" />
          <span className="text-2xl font-bold">{project.contributors.length}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Contributors</span>
        </div>
        <div className="card p-4 flex flex-col items-center">
          <FiCalendar className="text-purple-500 mb-2 h-6 w-6" />
          <span className="text-2xl font-bold">{formatDate(project.createdAt).split(' ')[0]}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Created</span>
        </div>
      </div>

      {/* Project tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("contributors")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "contributors"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Contributors
          </button>
          <button
            onClick={() => setActiveTab("readme")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "readme"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            README
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {project.longDescription}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Repository</h3>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <FiGithub className="mr-2" /> View on GitHub
                </a>
              </div>
              {project.demoUrl && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Live Demo</h3>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <FiExternalLink className="mr-2" /> View Demo
                  </a>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contributors" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Contributors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.contributors.map((contributor) => (
                <div key={contributor.id} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{contributor.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{contributor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "readme" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">README</h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                {project.readme}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
