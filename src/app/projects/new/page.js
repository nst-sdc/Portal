"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiGithub, FiLink, FiPlus, FiX, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { projectsService } from "@/lib/services/projects";

export default function NewProject() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    repoUrl: "",
    demoUrl: "",
    tags: [],
    numericId: "1000827853"
  });
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});

  // Check if user is admin
  const isAdmin = user?.is_admin || false;

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.push('/projects');
    }
  }, [isAdmin, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Short description is required";
    }
    
    if (!formData.repoUrl.trim()) {
      newErrors.repoUrl = "Repository URL is required";
    } else if (!isValidUrl(formData.repoUrl)) {
      newErrors.repoUrl = "Please enter a valid URL";
    }
    
    if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
      newErrors.demoUrl = "Please enter a valid URL";
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({
        ...errors,
        form: "You must be logged in to create a project."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare project data for API
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        long_description: formData.longDescription.trim(),
        tech_stack: formData.tags,
        github_repo_url: formData.repoUrl.trim(),
        live_demo_url: formData.demoUrl.trim() || null,
        status: 'planning',
        difficulty_level: 'intermediate',
        priority: 'medium',
        is_public: true,
        max_members: 5,
        created_by: user.id,
        numeric_id: parseInt(formData.numericId, 10)
      };

      // Create project using the projects service
      const newProject = await projectsService.createProject(projectData, user.id);

      // Redirect to the new project page
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error("Error submitting project:", error);
      setErrors({
        ...errors,
        form: error.message || "Failed to submit project. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {!isAdmin ? (
        <div className="text-center py-12">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can create new projects.
          </p>
          <Link href="/projects" className="mt-4 inline-flex items-center text-primary hover:underline">
            <FiArrowLeft className="mr-2" /> Back to Projects
          </Link>
        </div>
      ) : (
        <>
          <Link href="/projects" className="inline-flex items-center text-primary hover:underline mb-6">
            <FiArrowLeft className="mr-2" /> Back to Projects
          </Link>

          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
            
            {errors.form && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="card p-6">
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-900`}
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-900`}
                  placeholder="Brief description (displayed in project cards)"
                  maxLength={120}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.description.length}/120 characters
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  rows={5}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-900"
                  placeholder="Provide a detailed description of your project"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository URL *
                </label>
                <div className="flex items-center">
                  <div className="mr-2 text-gray-500">
                    <FiGithub />
                  </div>
                  <input
                    type="url"
                    id="repoUrl"
                    name="repoUrl"
                    value={formData.repoUrl}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${errors.repoUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-900`}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                {errors.repoUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.repoUrl}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Demo URL (optional)
                </label>
                <div className="flex items-center">
                  <div className="mr-2 text-gray-500">
                    <FiLink />
                  </div>
                  <input
                    type="url"
                    id="demoUrl"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${errors.demoUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-900`}
                    placeholder="https://your-demo-site.com"
                  />
                </div>
                {errors.demoUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.demoUrl}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="numericId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numeric ID
                </label>
                <input
                  type="number"
                  id="numericId"
                  name="numericId"
                  value={formData.numericId}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-900"
                  placeholder="Enter numeric ID"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags *
                </label>
                <div className={`flex items-center p-2 border ${errors.tags ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md bg-white dark:bg-gray-900`}>
                  <div className="flex flex-wrap gap-2 mr-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        <span className="text-xs mr-1">{tag}</span>
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 outline-none bg-transparent"
                    placeholder={formData.tags.length === 0 ? "Add technologies used (e.g. React, Node.js)" : "Add more tags..."}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!currentTag.trim()}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <FiPlus />
                  </button>
                </div>
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Press Enter or click the plus icon to add a tag
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
