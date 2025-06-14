"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { FiSearch, FiFilter, FiGithub, FiAward, FiMail, FiRefreshCw } from "react-icons/fi";
import { studentsService } from '@/lib/services/students';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [sortBy, setSortBy] = useState("rewardPoints");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial data and URL parameters
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        const batch = params.get('batch');
        if (search) setSearchTerm(search);
        if (batch) setSelectedBatch(batch);

        // Fetch students data
        const filters = {
          search: search || '',
          batch: batch || ''
        };

        const studentsData = await studentsService.getAllStudents(filters);

        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Refresh students data
  const refreshStudents = async () => {
    try {
      setIsRefreshing(true);
      const filters = {
        search: searchTerm,
        batch: selectedBatch
      };

      const studentsData = await studentsService.getAllStudents(filters);

      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      console.error('Error refreshing students:', err);
      setError('Failed to refresh students. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get all unique batches from students
  const batches = [...new Set(students.map((student) => student.batch))];

  // Filter and sort students
  useEffect(() => {
    let result = [...students];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.githubUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by batch
    if (selectedBatch) {
      result = result.filter((student) => student.batch === selectedBatch);
    }

    // Sort students
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    setFilteredStudents(result);
  }, [searchTerm, selectedBatch, sortBy, sortOrder, students]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Set sort by and handle sort order
  const handleSortBy = (field) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder("desc"); // Default to descending when changing sort field
    }
  };

  // Update URL with current filters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (selectedBatch) {
      params.set('batch', selectedBatch);
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (sortBy !== 'rewardPoints') {
      params.set('sortBy', sortBy);
    }
    
    if (sortOrder !== 'desc') {
      params.set('sortOrder', sortOrder);
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedBatch, searchTerm, sortBy, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams();
  }, [selectedBatch, searchTerm, sortBy, sortOrder, updateUrlParams]);

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Students</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and discover talented students in the NST Dev Club
          </p>
          {error && (
            <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={refreshStudents}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, GitHub username, or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Batch:</span>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
                <div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <Link href={`/students/${student.id}`} key={student.id}>
              <div className="card hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="flex items-center mb-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Batch {student.batch}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-1">
                    <FiGithub className="mr-2" />
                    <span>{student.githubUsername}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <FiMail className="mr-2" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {student.topLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reward Points</span>
                    <span 
                      className="flex items-center text-amber-600 dark:text-amber-400 font-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSortBy("rewardPoints");
                      }}
                    >
                      <FiAward className="mr-1" />
                      {student.rewardPoints}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, (student.rewardPoints / 500) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="font-semibold text-base">{student.projectCount}</span>
                    <span>Projects</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="font-semibold text-base">{student.prsMerged}</span>
                    <span>PRs Merged</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="font-semibold text-base">{student.issuesRaised}</span>
                    <span>Issues Raised</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="font-semibold text-base">{student.issuesSolved}</span>
                    <span>Issues Solved</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            No students found matching your criteria
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
