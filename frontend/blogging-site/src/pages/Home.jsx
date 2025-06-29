import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blogs from your backend API
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.BLOGS);
        // Ensure blogs is always an array
        const blogsData = response.data;
        if (Array.isArray(blogsData)) {
          setBlogs(blogsData);
        } else if (blogsData && Array.isArray(blogsData.blogs)) {
          setBlogs(blogsData.blogs);
        } else {
          console.warn('Unexpected API response format:', blogsData);
          setBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]); // Ensure blogs is an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#670626] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Our Blog
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Discover amazing stories and insights from our community
          </p>
          <Link 
            to="/write" 
            className="bg-[#FFBDC5] text-[#670626] px-8 py-3 rounded-lg font-semibold hover:bg-[#F2E0D2] transition duration-300 inline-block"
          >
            Start Writing
          </Link>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest Posts</h2>
        
        {blogs.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-xl">No blogs found. Be the first to write one!</p>
            <Link 
              to="/write" 
              className="mt-4 inline-block bg-[#670626] text-white px-6 py-2 rounded-lg hover:bg-[#4a0419] transition duration-300"
            >
              Write Your First Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 border border-[#F2E0D2]">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content?.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {blog.author || 'Anonymous'}
                    </span>
                    <Link 
                      to={`/blog/${blog.id}`} 
                      className="text-[#670626] hover:text-[#4a0419] font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
