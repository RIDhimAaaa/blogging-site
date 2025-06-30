import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import BlogCard from '../components/BlogCard';
import RotatingText from '../components/RotatingText';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Fetch blogs from your backend API
    const fetchBlogs = async () => {
      try {
        console.log('Fetching blogs from:', API_ENDPOINTS.BLOGS);
        const response = await axios.get(API_ENDPOINTS.BLOGS);
        console.log('Blogs API response:', response.data);
        
        // Handle the paginated response from backend
        const blogsData = response.data;
        if (blogsData && Array.isArray(blogsData.blogs)) {
          // Backend returns { blogs: [...], pagination: {...} }
          setBlogs(blogsData.blogs);
        } else if (Array.isArray(blogsData)) {
          // Fallback: direct array
          setBlogs(blogsData);
        } else {
          console.warn('Unexpected API response format:', blogsData);
          setBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
        setBlogs([]); // Ensure blogs is an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F2E0D2' }}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 mx-auto mb-4" style={{ color: '#670626' }}>
              <svg fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-xl" style={{ color: '#670626' }}>Loading amazing stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2E0D2' }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-16 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: '#FFBDC5' }}></div>
          <div className="absolute top-32 right-20 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: '#670626' }}></div>
          <div className="absolute bottom-28 left-1/4 w-18 h-18 rounded-full opacity-20" style={{ backgroundColor: '#FFBDC5' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-5xl md:text-7xl font-extrabold mr-3" style={{ color: '#670626' }}>
              Type N
            </h1>
            <RotatingText
              texts={['Tell', 'Tale', 'Tea']}
              mainClassName="px-4 py-2 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#FFBDC5', color: '#670626' }}
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.03}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              rotationInterval={2500}
              elementLevelClassName="text-5xl md:text-7xl font-extrabold"
            />
          </div>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: '#670626' }}>
            Where every <strong>Type</strong> has a story to <strong>Tell</strong>, every <strong>Tale</strong> finds its voice, and every cup of <strong>Tea</strong> inspires great writing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/write"
                  className="px-8 py-4 rounded-xl text-white font-semibold text-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#670626' }}
                >
                  Write Your Story
                </Link>
                <p className="self-center text-lg" style={{ color: '#670626' }}>
                  Welcome back, <span className="font-semibold">{user?.username}</span>!
                </p>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-4 rounded-xl text-white font-semibold text-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#670626' }}
                >
                  Start Writing
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl font-semibold text-lg border-2 hover:shadow-lg transition duration-300"
                  style={{ color: '#670626', borderColor: '#670626' }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#670626' }}>
              Featured Stories
            </h2>
            <p className="text-lg" style={{ color: '#670626' }}>
              Discover the latest and most engaging content from our community
            </p>
          </div>

          {error && (
            <div className="text-center mb-8">
              <div className="inline-block bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {blogs.length === 0 && !error ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#FFBDC5' }}>
                <svg className="w-12 h-12" style={{ color: '#670626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#670626' }}>
                No Stories Yet
              </h3>
              <p className="text-lg mb-8" style={{ color: '#670626' }}>
                Be the first to share your amazing story with the world!
              </p>
              {isAuthenticated && (
                <Link
                  to="/write"
                  className="px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition duration-300"
                  style={{ backgroundColor: '#670626' }}
                >
                  Write the First Story
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

          {blogs.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/blogs"
                className="px-8 py-3 rounded-lg border-2 font-semibold hover:shadow-lg transition duration-300"
                style={{ color: '#670626', borderColor: '#670626' }}
              >
                View All Stories
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl p-12 shadow-2xl" style={{ backgroundColor: 'white', border: '3px solid #FFBDC5' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#670626' }}>
              Ready to Share Your Story?
            </h2>
            <p className="text-lg mb-8" style={{ color: '#670626' }}>
              Join our community of writers and share your unique perspective with the world.
            </p>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl text-white font-semibold text-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#670626' }}
              >
                Join Our Community
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
