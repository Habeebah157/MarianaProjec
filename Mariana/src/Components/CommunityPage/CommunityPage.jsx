import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Users, MessageCircle, Heart, Bookmark } from 'lucide-react';
import PrayerTime from '../PrayerTime/PrayerTime';
import { fetchCommunityPosts } from '../../api/communityApi'; // Make sure this exists


const CommunityPage = () => {
  const { name } = useParams();
  const { state } = useLocation();
  const communityName = name || 'Gwinnett';

  const communityId = state?.communityId || "Loading...";
  // const description = state?.description || "No description available.";

  // 🔷 Mock community data — replace later with real API
  const community = {
    description: 'A welcoming Muslim community focused on faith, family, and service.',
    membersCount: 1528,
    onlineMembers: 47,
    accentColor: 'blue',
    rules: [
      { title: 'Be Respectful', description: 'Treat everyone with kindness and respect.' },
      { title: 'No Spam', description: 'Avoid promotional content or repeated posts.' },
      { title: 'Stay On Topic', description: 'Keep discussions relevant to the community.' },
    ],
  };

  const [posts, setPosts] = useState([]); // Will store fetched posts
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [animatedCount, setAnimatedCount] = useState(0);

  // Animate member count
  useEffect(() => {
    const target = community.membersCount;
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= target) {
        setAnimatedCount(target);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Fetch real posts
  useEffect(() => {
    setLoadingPosts(true);
    setPostsError(null);
    fetchCommunityPosts(communityId)
      .then((data) => {
        setPosts(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setPostsError(err.message);
        setPosts([]); // Show empty list on error
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }, [communityName]);

  const toggleLike = (id) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleBookmark = (id) => {
    setBookmarkedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{communityName} Community</h1>
              <p className="text-lg text-gray-600 mb-4">{community.description}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{formatNumber(animatedCount)}</span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{community.onlineMembers} online</span>
                </div>
              </div>

              <button
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  joined
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={() => setJoined(!joined)}
              >
                {joined ? 'Leave Community' : 'Join Community'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Community Posts</h2>
            </div>

            {/* Show loading */}
            {loadingPosts ? (
              <p className="text-center text-gray-500">Loading posts...</p>
            ) : postsError ? (
              <p className="text-center text-red-500">Error: {postsError}</p>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.body}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      By: <strong>{post.user_name || 'Anonymous'}</strong> •{' '}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                            likedPosts.has(post.id)
                              ? 'bg-red-100 text-red-600'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          {post.likes || 0}
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments || 0}
                        </button>
                      </div>
                      <button
                        onClick={() => toggleBookmark(post.id)}
                        className={`p-2 rounded-full transition-colors ${
                          bookmarkedPosts.has(post.id)
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PrayerTime />

            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Rules</h3>
              {community.rules.length > 0 ? (
                <div className="space-y-3">
                  {community.rules.map((rule, i) => (
                    <div key={i} className="border-l-3 border-blue-400 pl-3">
                      <h4 className="font-medium text-gray-800">{rule.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No rules available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;