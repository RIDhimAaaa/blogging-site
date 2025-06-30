import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const BlogCard = ({ blog }) => {
  const [authorProfile, setAuthorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Fetch author profile when card is hovered
  const fetchAuthorProfile = async () => {
    if (authorProfile || profileLoading) return; // Don't fetch if already loading or loaded
    
    // Try to get author info from blog data first
    const authorUsername = blog.author || 'Anonymous';
    const authorId = blog.author_id || blog.user_id;
    
    setProfileLoading(true);
    try {
      if (authorId) {
        // Try to fetch user profile
        const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/users/${authorId}`);
        setAuthorProfile(response.data);
      } else {
        throw new Error('No author ID available');
      }
    } catch (error) {
      console.error('Error fetching author profile:', error);
      // Create a fallback profile from available blog data
      setAuthorProfile({
        id: authorId || 'unknown',
        username: authorUsername,
        email: '',
        bio: 'This author prefers to keep their profile private.',
        avatar_url: null,
        total_blogs: 1,
        total_likes: blog.likes || 0,
        joined_date: blog.timestamp || blog.created_at
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch author profile and flip card
  const handleAuthorClick = async () => {
    if (!isFlipped && !authorProfile && !profileLoading) {
      await fetchAuthorProfile();
    }
    setIsFlipped(!isFlipped);
  };

  // Reset flip state when component unmounts or blog changes
  useEffect(() => {
    setIsFlipped(false);
    setAuthorProfile(null);
  }, [blog.id]);

  return (
    <StyledWrapper>
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-inner">
          {/* Front Side - Blog Post */}
          <div className="flip-card-front">
            <div className="blog-image">
              {blog.image_url ? (
                <img src={blog.image_url} alt={blog.title} />
              ) : (
                <div className="placeholder-image">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="blog-content">
              <h3 className="title">{truncateText(blog.title, 60)}</h3>
              <p className="content-preview">{truncateText(blog.content, 120)}</p>
              <div className="blog-meta">
                <p className="date">{getTimeAgo(blog.timestamp || blog.created_at)}</p>
                <div className="blog-stats">
                  <div className="stat">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{blog.views || 0}</span>
                  </div>
                  <div className="stat">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{blog.likes || 0}</span>
                  </div>
                </div>
              </div>
              <Link 
                to={`/blog/${blog.id}`} 
                className="read-more-btn"
              >
                Read Article
              </Link>
            </div>
            <button 
              onClick={handleAuthorClick}
              className="author-toggle-btn"
            >
              👤 View Author
            </button>
          </div>

          {/* Back Side - Author Profile */}
          <div className="flip-card-back">
            {profileLoading ? (
              <div className="loading-profile">
                <div className="loading-spinner">
                  <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p>Loading author...</p>
              </div>
            ) : authorProfile ? (
              <div className="author-profile">
                <div className="author-header">
                  <div className="author-avatar">
                    {authorProfile.avatar_url ? (
                      <img src={authorProfile.avatar_url} alt={authorProfile.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <h3 className="author-name">{authorProfile.username}</h3>
                    <p className="author-title">{authorProfile.title || 'Writer'}</p>
                  </div>
                </div>

                <div className="author-bio">
                  <p>{truncateText(authorProfile.bio || 'This author has not provided a bio yet.', 100)}</p>
                </div>

                <div className="author-stats">
                  <div className="stat-item">
                    <span className="stat-number">{authorProfile.total_blogs || 0}</span>
                    <span className="stat-label">Articles</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{authorProfile.total_likes || 0}</span>
                    <span className="stat-label">Likes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{authorProfile.followers || 0}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                </div>

                <div className="author-joined">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Joined {formatDate(authorProfile.joined_date || authorProfile.created_at)}</span>
                </div>

                <div className="profile-actions">
                  <Link 
                    to={`/profile/${authorProfile.id}`} 
                    className="view-profile-btn"
                  >
                    View Profile
                  </Link>
                  <button className="follow-btn">
                    Follow
                  </button>
                </div>
                
                <button 
                  onClick={handleAuthorClick}
                  className="back-to-article-btn"
                >
                  ← Back to Article
                </button>
              </div>
            ) : (
              <div className="profile-error">
                <div className="error-icon">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>Could not load author profile</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .flip-card {
    background-color: transparent;
    width: 300px;
    height: 400px;
    perspective: 1000px;
    font-family: sans-serif;
    margin: 0 auto;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    box-shadow: 0 8px 20px 0 rgba(103, 6, 38, 0.15);
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border: 2px solid #FFBDC5;
    border-radius: 1.5rem;
    overflow: hidden;
  }

  .flip-card-front {
    background: linear-gradient(135deg, #F2E0D2 0%, #FFBDC5 50%, #F2E0D2 100%);
    color: #670626;
    padding: 0;
  }

  .flip-card-back {
    background: linear-gradient(135deg, #670626 0%, #8B1538 50%, #670626 100%);
    color: white;
    transform: rotateY(180deg);
    padding: 20px;
    justify-content: flex-start;
  }

  /* Front Side - Blog Post Styles */
  .blog-image {
    height: 140px;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(45deg, #FFBDC5, #F2E0D2);
  }

  .blog-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-image {
    color: #670626;
    opacity: 0.6;
  }

  .blog-content {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: left;
  }

  .title {
    font-size: 1.1em;
    font-weight: 700;
    margin: 0 0 8px 0;
    line-height: 1.3;
    color: #670626;
  }

  .content-preview {
    font-size: 0.85em;
    color: #670626;
    opacity: 0.8;
    margin: 8px 0;
    line-height: 1.4;
  }

  .blog-meta {
    margin: 12px 0;
  }

  .date {
    font-size: 0.8em;
    color: #670626;
    opacity: 0.7;
    margin-bottom: 8px;
  }

  .blog-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8em;
    color: #670626;
    opacity: 0.7;
  }

  .read-more-btn {
    background: #670626;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85em;
    transition: all 0.3s ease;
    text-align: center;
    border: 2px solid transparent;
  }

  .read-more-btn:hover {
    background: white;
    color: #670626;
    border-color: #670626;
    transform: translateY(-1px);
  }

  .author-toggle-btn {
    background: #FFBDC5;
    color: #670626;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.8em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 8px 16px 16px 16px;
  }

  .author-toggle-btn:hover {
    background: #670626;
    color: white;
    transform: translateY(-1px);
  }

  .back-to-article-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.8em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 12px;
    width: 100%;
  }

  .back-to-article-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* Back Side - Author Profile Styles */
  .loading-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: white;
  }

  .loading-spinner {
    margin-bottom: 12px;
  }

  .author-profile {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .author-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .author-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .author-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .author-info {
    flex: 1;
    text-align: left;
  }

  .author-name {
    font-size: 1.1em;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: white;
  }

  .author-title {
    font-size: 0.8em;
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
  }

  .author-bio {
    margin-bottom: 16px;
    text-align: left;
  }

  .author-bio p {
    font-size: 0.8em;
    line-height: 1.4;
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .author-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
    padding: 12px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stat-number {
    font-size: 1.2em;
    font-weight: 700;
    color: white;
  }

  .stat-label {
    font-size: 0.7em;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 2px;
  }

  .author-joined {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 16px;
  }

  .profile-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }

  .view-profile-btn {
    flex: 1;
    background: #FFBDC5;
    color: #670626;
    padding: 8px 12px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.8em;
    text-align: center;
    transition: all 0.3s ease;
  }

  .view-profile-btn:hover {
    background: white;
    transform: translateY(-1px);
  }

  .follow-btn {
    flex: 1;
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8em;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .follow-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }

  .profile-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.7);
  }

  .error-icon {
    margin-bottom: 12px;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .flip-card {
      width: 280px;
      height: 380px;
    }
    
    .title {
      font-size: 1em;
    }
    
    .blog-image {
      height: 120px;
    }

    .author-avatar {
      width: 50px;
      height: 50px;
    }

    .author-name {
      font-size: 1em;
    }
  }
`;

export default BlogCard;
