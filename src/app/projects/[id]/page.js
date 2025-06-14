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
  FiExternalLink,
  FiPlus,
  FiX,
  FiUserPlus
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { projectsService } from "@/lib/services/projects";
import { studentsService } from "@/lib/services/students";

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
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);

        // Fetch project details
        const projectData = await projectsService.getProjectById(params.id);
        setProject(projectData);

        // Fetch project members
        const members = await projectsService.getProjectMembers(params.id);
        setProjectMembers(members);

        // Fetch available students for assignment
        const students = await studentsService.getAllStudents();
        setAvailableStudents(students);

      } catch (error) {
        console.error('Error fetching project data:', error);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProjectData();
    }
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

  const handleAssignStudent = async (studentId, role = 'member') => {
    try {
      setAssigningStudent(true);

      await projectsService.assignStudentToProject(params.id, studentId, role);

      // Refresh project members
      const updatedMembers = await projectsService.getProjectMembers(params.id);
      setProjectMembers(updatedMembers);

      setShowAssignModal(false);

      // Show success message
      const studentName = availableStudents.find(s => s.id === studentId)?.name || 'Student';
      alert(`${studentName} successfully assigned as ${role}!`);
    } catch (error) {
      console.error('Error assigning student:', error);

      // Show specific error message
      let errorMessage = 'Failed to assign student to project';
      if (error.message.includes('already a member')) {
        errorMessage = 'This student is already an active member of this project';
      } else if (error.message.includes('constraint')) {
        errorMessage = 'Invalid role selected. Please try again.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'This student is already associated with this project';
      }

      alert(errorMessage);
    } finally {
      setAssigningStudent(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await projectsService.removeMemberFromProject(params.id, memberId);

      // Refresh project members
      const updatedMembers = await projectsService.getProjectMembers(params.id);
      setProjectMembers(updatedMembers);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member from project');
    }
  };

  // Filter out students who are already members
  const availableStudentsForAssignment = availableStudents.filter(
    student => !projectMembers.some(member => member.userId === student.id)
  );

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
              {project.longDescription || project.description}
            </p>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Project Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty:</span>
                    <span className="ml-2 font-medium">{project.difficultyLevel}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Max Members:</span>
                    <span className="ml-2 font-medium">{project.maxMembers}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Members:</span>
                    <span className="ml-2 font-medium">{projectMembers.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Links</h3>
                <div className="space-y-2">
                  {project.repoUrl && (
                    <div>
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <FiGithub className="mr-2" /> View on GitHub
                      </a>
                    </div>
                  )}
                  {project.liveUrl && (
                    <div>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <FiExternalLink className="mr-2" /> View Live Demo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-medium mb-3">Timeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium">{formatDate(project.updatedAt)}</p>
                </div>
                {project.startDate && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <p className="font-medium">{formatDate(project.startDate)}</p>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                    <p className="font-medium">{formatDate(project.endDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contributors" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Members</h2>
              {user && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="btn-primary flex items-center"
                >
                  <FiUserPlus className="mr-2" />
                  Assign Student
                </button>
              )}
            </div>

            {projectMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="mx-auto h-12 w-12 mb-4" />
                <p>No members assigned to this project yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                        {member.githubUsername && (
                          <p className="text-xs text-gray-500">@{member.githubUsername}</p>
                        )}
                      </div>
                    </div>
                    {user && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove member"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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

      {/* Student Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assign Student to Project</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {availableStudentsForAssignment.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available students to assign.</p>
                <p className="text-sm mt-2">All students are already members of this project.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableStudentsForAssignment.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.batch} • {student.rewardPoints} points
                        </p>
                        {student.githubUsername && (
                          <p className="text-xs text-gray-500">@{student.githubUsername}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssignStudent(student.id, 'member')}
                        disabled={assigningStudent}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        Member
                      </button>
                      <button
                        onClick={() => handleAssignStudent(student.id, 'contributor')}
                        disabled={assigningStudent}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                      >
                        Contributor
                      </button>
                      <button
                        onClick={() => handleAssignStudent(student.id, 'lead')}
                        disabled={assigningStudent}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
