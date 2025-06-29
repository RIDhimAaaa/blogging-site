import React, { useState } from 'react';
import axios from 'axios';

const WriteBlog = () => {
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setBlogData({
      ...blogData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!blogData.title.trim() || !blogData.content.trim()) {
      setError('Title and content are required');
      setLoading(false);
      return;
    }

    try {
      // Convert tags string to array
      const tagsArray = blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const blogPayload = {
        title: blogData.title,
        content: blogData.content,
        tags: tagsArray
      };

      // Replace with your actual backend URL
      const response = await axios.post('http://localhost:5000/api/blogs', blogPayload);
      
      setSuccess('Blog published successfully!');
      setBlogData({ title: '', content: '', tags: '' });
      
      // Optionally redirect to the blog detail page
      setTimeout(() => {
        window.location.href = `/blog/${response.data.id}`;
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to publish blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h1 className="text-2xl font-bold text-white">Write a New Blog</h1>
            <p className="text-blue-100 mt-1">Share your thoughts with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={blogData.title}
                onChange={handleChange}
                placeholder="Enter an engaging title for your blog"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={blogData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas (e.g., technology, programming, web)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Tags help readers discover your content
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={blogData.content}
                onChange={handleChange}
                placeholder="Write your blog content here..."
                rows="20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum 100 characters recommended for a good blog post
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-500">
                {blogData.content.length} characters
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  onClick={() => setBlogData({ title: '', content: '', tags: '' })}
                >
                  Clear
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                >
                  {loading ? 'Publishing...' : 'Publish Blog'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Tips</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Start with an engaging title that captures the essence of your blog
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Use clear, concise language and break up text with paragraphs
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Add relevant tags to help readers discover your content
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Proofread your content before publishing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
