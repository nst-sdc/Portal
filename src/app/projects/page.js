"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { FiFilter, FiSearch, FiGithub, FiStar, FiCode, FiUsers, FiRefreshCw } from "react-icons/fi";
import { projectsService } from '@/lib/services/projects';
import { useAuth } from '@/contexts/AuthContext';

export default function Projects() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyUserProjects, setShowOnlyUserProjects] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check URL parameters for initial filters
  useEffect(() => {
    const myProjectsParam = searchParams.get('myProjects');
    if (myProjectsParam === 'true') {
      setShowOnlyUserProjects(true);
    }
    
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTags([tagParam]);
    }
    
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const filters = {
          search: searchTerm,
          userId: showOnlyUserProjects ? user?.id : null,
          techStack: selectedTags
        };

        const projectsData = await projectsService.getAllProjects(filters);
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Refresh projects data
  const refreshProjects = async () => {
    try {
      setIsRefreshing(true);
      const filters = {
        search: searchTerm,
        userId: showOnlyUserProjects ? user?.id : null,
        techStack: selectedTags
      };

      const projectsData = await projectsService.getAllProjects(filters);
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter projects based on search term, selected tags, and user projects filter
  useEffect(() => {
    let result = [...projects];

    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((project) =>
        selectedTags.some((tag) => project.tags.includes(tag))
      );
    }

    if (showOnlyUserProjects) {
      result = result.filter((project) => project.isUserProject);
    }

    setFilteredProjects(result);
  }, [searchTerm, selectedTags, showOnlyUserProjects, projects]);

  // Get all unique tags from projects
  const allTags = [...new Set(projects.flatMap((project) => project.tags))];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Update URL with current filters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (showOnlyUserProjects) {
      params.set('myProjects', 'true');
    }
    
    if (selectedTags.length === 1) {
      params.set('tag', selectedTags[0]);
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [showOnlyUserProjects, selectedTags, searchTerm]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams();
  }, [showOnlyUserProjects, selectedTags, searchTerm, updateUrlParams]);

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and collaborate on projects within the NST Dev Club
          </p>
          {error && (
            <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={refreshProjects}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            href="/projects/new"
            className="btn-primary"
          >
            Create New Project
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={showOnlyUserProjects}
                onChange={() => setShowOnlyUserProjects(!showOnlyUserProjects)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">My Projects</span>
            </label>
          </div>
        </div>

        {/* Tags filter */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <FiFilter className="mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className="card hover:shadow-lg transition-shadow duration-300 h-full">
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
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
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiStar className="mr-1" />
                    <span className="mr-3">{project.stars}</span>
                    <FiCode className="mr-1" />
                    <span className="mr-3">{project.forks}</span>
                    <FiUsers className="mr-1" />
                    <span>{project.contributors}</span>
                  </div>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiGithub className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            No projects found matching your criteria
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
    </>
  );
}
