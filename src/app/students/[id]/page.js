"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  FiArrowLeft, 
  FiGithub, 
  FiMail, 
  FiMessageSquare, 
  FiAward, 
  FiStar, 
  FiCode, 
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiGitPullRequest,
  FiLightbulb
} from "react-icons/fi";

// Mock data for students (in a real app, this would come from an API)
const mockStudents = [
  {
    id: 1,
    name: "John Doe",
    batch: "2023",
    email: "john.doe@example.com",
    githubUsername: "johndoe",
    discordUsername: "johndoe#1234",
    avatar: "https://i.pravatar.cc/150?img=1",
    topLanguages: [
      { name: "JavaScript", percentage: 45 },
      { name: "Python", percentage: 30 },
      { name: "React", percentage: 25 }
    ],
    rewardPoints: 320,
    projectCount: 5,
    issuesRaised: 12,
    issuesSolved: 8,
    prsMerged: 15,
    projectIdeas: 3,
    bio: "Full-stack developer with a passion for building user-friendly web applications. Experienced in JavaScript, Python, and React.",
    projects: [
      { id: 1, name: "Student Management System", role: "Lead Developer", repoUrl: "https://github.com/nst-dev-club/student-management" },
      { id: 4, name: "Study Group Finder", role: "Frontend Developer", repoUrl: "https://github.com/nst-dev-club/study-group-finder" },
      { id: 6, name: "Campus Marketplace", role: "Backend Developer", repoUrl: "https://github.com/nst-dev-club/campus-marketplace" }
    ],
    githubActivity: [
      { date: "2024-05-28", commits: 8, type: "commit" },
      { date: "2024-05-25", commits: 5, type: "commit" },
      { date: "2024-05-22", commits: 12, type: "commit" },
      { date: "2024-05-20", commits: 3, type: "commit" },
      { date: "2024-05-18", commits: 7, type: "commit" },
      { date: "2024-05-15", commits: 9, type: "commit" },
      { date: "2024-05-12", commits: 4, type: "commit" }
    ],
    rewardBreakdown: [
      { category: "Issues Raised", points: 60, formula: "12 issues × 5 points" },
      { category: "Issues Solved", points: 80, formula: "8 issues × 10 points" },
      { category: "PRs Merged", points: 150, formula: "15 PRs × 10 points" },
      { category: "Project Ideas", points: 30, formula: "3 ideas × 10 points" }
    ]
  },
  // More student data would be here...
];

export default function StudentDetail() {
  const params = useParams();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStudent = async () => {
      // In a real app, you would fetch data from an API
      setTimeout(() => {
        const foundStudent = mockStudents.find(s => s.id === parseInt(params.id));
        setStudent(foundStudent || null);
        setIsLoading(false);
      }, 1000);
    };

    fetchStudent();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            Student not found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-500">
            The student you are looking for does not exist or has been removed.
          </p>
          <Link href="/students" className="mt-4 btn-primary inline-block">
            <FiArrowLeft className="inline mr-2" /> Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <Link href="/students" className="inline-flex items-center text-primary hover:underline mb-6">
        <FiArrowLeft className="mr-2" /> Back to Students
      </Link>

      {/* Student header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img
            src={student.avatar}
            alt={student.name}
            className="h-32 w-32 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Batch {student.batch}</p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
              {student.bio}
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiGithub className="mr-2" />
                <a 
                  href={`https://github.com/${student.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {student.githubUsername}
                </a>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiMail className="mr-2" />
                <a 
                  href={`mailto:${student.email}`}
                  className="hover:text-primary"
                >
                  {student.email}
                </a>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiMessageSquare className="mr-2" />
                <span>{student.discordUsername}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-col items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FiAward className="h-6 w-6 mr-2" />
                <span className="text-3xl font-bold">{student.rewardPoints}</span>
              </div>
              <p className="text-amber-800 dark:text-amber-300 text-sm mt-1">Reward Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "projects"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "github"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            GitHub Activity
          </button>
          <button
            onClick={() => setActiveTab("rewards")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "rewards"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Reward Points
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Student Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stats */}
              <div>
                <h3 className="text-lg font-medium mb-4">Activity Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                      <FiFileText className="mr-2 text-blue-500" />
                      <span className="font-medium">Projects</span>
                    </div>
                    <p className="text-2xl font-bold">{student.projectCount}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                      <FiAlertCircle className="mr-2 text-yellow-500" />
                      <span className="font-medium">Issues Raised</span>
                    </div>
                    <p className="text-2xl font-bold">{student.issuesRaised}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                      <FiCheckCircle className="mr-2 text-green-500" />
                      <span className="font-medium">Issues Solved</span>
                    </div>
                    <p className="text-2xl font-bold">{student.issuesSolved}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                      <FiGitPullRequest className="mr-2 text-purple-500" />
                      <span className="font-medium">PRs Merged</span>
                    </div>
                    <p className="text-2xl font-bold">{student.prsMerged}</p>
                  </div>
                </div>
              </div>
              
              {/* Top Languages */}
              <div>
                <h3 className="text-lg font-medium mb-4">Top Languages</h3>
                <div className="space-y-4">
                  {student.topLanguages.map((language) => (
                    <div key={language.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{language.name}</span>
                        <span className="text-gray-700 dark:text-gray-300">{language.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${language.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent Projects */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Projects</h3>
                <button
                  onClick={() => setActiveTab("projects")}
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {student.projects.slice(0, 3).map((project) => (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium mb-2">{project.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.role}</p>
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiGithub className="mr-1" /> View Repository
                      </a>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Projects</h2>
            {student.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {student.projects.map((project) => (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow h-full">
                      <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                          {project.role}
                        </span>
                      </div>
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-auto flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiGithub className="mr-2" /> View on GitHub
                      </a>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No projects found for this student.</p>
            )}
          </div>
        )}

        {activeTab === "github" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">GitHub Activity</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Commit Activity</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {student.githubActivity.map((activity, index) => (
                    <div key={index} className="flex flex-col items-center min-w-[50px]">
                      <div 
                        className="w-8 h-8 rounded-sm mb-1 flex items-center justify-center"
                        style={{ 
                          backgroundColor: `rgba(59, 130, 246, ${Math.min(1, activity.commits / 10)})`,
                          color: activity.commits > 5 ? 'white' : 'black'
                        }}
                      >
                        {activity.commits}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Top Languages</h3>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {student.topLanguages.map((language) => (
                      <div key={language.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{language.name}</span>
                          <span className="text-gray-700 dark:text-gray-300">{language.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${language.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Contribution Stats</h3>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{student.issuesRaised}</div>
                      <p className="text-gray-600 dark:text-gray-400">Issues Raised</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">{student.issuesSolved}</div>
                      <p className="text-gray-600 dark:text-gray-400">Issues Solved</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{student.prsMerged}</div>
                      <p className="text-gray-600 dark:text-gray-400">PRs Merged</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{student.projectIdeas}</div>
                      <p className="text-gray-600 dark:text-gray-400">Project Ideas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <a
                href={`https://github.com/${student.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center"
              >
                <FiGithub className="mr-2" /> View Full GitHub Profile
              </a>
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Reward Points Breakdown</h2>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Total Reward Points</h3>
                <div className="flex items-center text-amber-600 dark:text-amber-400 text-2xl font-bold">
                  <FiAward className="mr-2" />
                  {student.rewardPoints}
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-amber-500 h-4 rounded-full"
                  style={{ width: `${Math.min(100, (student.rewardPoints / 500) * 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-right">
                {student.rewardPoints} / 500 points
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Calculation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {student.rewardBreakdown.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.category === "Issues Raised" && <FiAlertCircle className="text-yellow-500 mr-2" />}
                          {item.category === "Issues Solved" && <FiCheckCircle className="text-green-500 mr-2" />}
                          {item.category === "PRs Merged" && <FiGitPullRequest className="text-purple-500 mr-2" />}
                          {item.category === "Project Ideas" && <FiLightbulb className="text-blue-500 mr-2" />}
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{item.points}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.formula}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400">
                      {student.rewardPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Reward System Rules</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <FiAlertCircle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Issues Raised:</strong> 5 points per issue</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Issues Solved:</strong> 10 points per issue</span>
                  </li>
                  <li className="flex items-start">
                    <FiGitPullRequest className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>PRs Merged:</strong> 10 points per PR</span>
                  </li>
                  <li className="flex items-start">
                    <FiLightbulb className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Project Ideas:</strong> 10 points per idea</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
