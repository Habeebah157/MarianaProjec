import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Calendar, Award, TrendingUp, MessageCircle, Heart, Share2, Bookmark, ChevronDown, Star, Bell, Settings, Search } from 'lucide-react';
import PrayerTime from '../PrayerTime/PrayerTime';
const CommunityPage = () => {
  const { name } = useParams();
  const communityName = name || 'Gwinnett'; 

  const communityData = {
    Gwinnett: {
      description: 'Subreddit of Gwinnett County, GA.',
      members: '47k',
      membersCount: 47000,
      onlineMembers: '2.3k',
      category: 'Local Community',
      established: '2019',
      moderators: ['admin1', 'localmod', 'gwinnett_helper'],
      backgroundGradient: 'from-blue-600 via-purple-600 to-indigo-700',
      accentColor: 'blue',
      rules: [
        { title: 'Be respectful to all members', description: 'Treat everyone with kindness and respect' },
        { title: 'No spam or self-promotion', description: 'Keep content relevant and valuable' },
        { title: 'Stay on topic', description: 'Focus on Gwinnett County related discussions' },
      ],
      updates: [
        {
          id: 1,
          title: 'Gwinnett Summer Festival Announced',
          date: '2025-08-01',
          summary: 'Join us for fun, food, and fireworks at the annual Gwinnett Summer Festival!',
          likes: 234,
          comments: 45,
          category: 'Event'
        },
        {
          id: 2,
          title: 'New Community Moderators',
          date: '2025-07-15',
          summary: 'Welcoming three new moderators to help keep the community safe and friendly.',
          likes: 156,
          comments: 23,
          category: 'Announcement'
        },
        {
          id: 3,
          title: 'Road Construction Updates',
          date: '2025-07-10',
          summary: 'Important updates about ongoing road construction projects in the area.',
          likes: 89,
          comments: 67,
          category: 'News'
        },
      ],
    },
    Django: {
      description: 'Web development with Django.',
      members: '151k',
      membersCount: 151000,
      onlineMembers: '5.7k',
      category: 'Programming',
      established: '2015',
      moderators: ['django_expert', 'webdev_pro', 'python_guru'],
      backgroundGradient: 'from-green-600 via-emerald-600 to-teal-700',
      accentColor: 'green',
      rules: [
        { title: 'Ask clear questions', description: 'Provide context and code examples' },
        { title: 'No piracy or illegal content', description: 'Keep discussions legal and ethical' },
        { title: 'Use proper tags', description: 'Help others find relevant content' },
      ],
      updates: [
        {
          id: 1,
          title: 'Django 5.0 Released!',
          date: '2025-07-20',
          summary: 'The latest major release of Django is here with async support and more.',
          likes: 892,
          comments: 156,
          category: 'Release'
        },
        {
          id: 2,
          title: 'Best Practices Guide Updated',
          date: '2025-07-18',
          summary: 'Community-driven best practices guide has been updated with new patterns.',
          likes: 445,
          comments: 78,
          category: 'Guide'
        },
      ],
    },
    AndroidDev: {
      description: 'Android development community.',
      members: '257k',
      membersCount: 257000,
      onlineMembers: '8.1k',
      category: 'Mobile Development',
      established: '2014',
      moderators: ['android_pro', 'kotlin_dev', 'mobile_expert'],
      backgroundGradient: 'from-orange-600 via-red-600 to-pink-700',
      accentColor: 'orange',
      rules: [
        { title: 'No irrelevant content', description: 'Keep posts Android development related' },
        { title: 'Use spoiler tags if needed', description: 'Mark sensitive content appropriately' },
        { title: 'Help others when you can', description: 'Share knowledge and support fellow developers' },
      ],
      updates: [
        {
          id: 1,
          title: 'Kotlin Coroutines Tutorial Series',
          date: '2025-07-18',
          summary: 'A new series covering async programming in Kotlin has started.',
          likes: 567,
          comments: 89,
          category: 'Tutorial'
        },
      ],
    },
  };

  const community = communityData[communityName] || {
    description: 'This community does not exist in our data.',
    members: '0',
    membersCount: 0,
    onlineMembers: '0',
    category: 'Unknown',
    established: 'Unknown',
    moderators: [],
    backgroundGradient: 'from-gray-600 to-gray-700',
    accentColor: 'gray',
    rules: [],
    updates: [],
  };

  const [joined, setJoined] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [animatedCount, setAnimatedCount] = useState(0);

  // Animate member count on load
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
  }, [community.membersCount]);

  const handleJoinToggle = () => setJoined(!joined);

  const toggleLike = (id) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleBookmark = (id) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
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
      {/* Simple Header */}
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
                onClick={handleJoinToggle}
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
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Community Updates */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Community Updates</h2>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {community.updates.length > 0 ? (
                <div className="space-y-4">
                  {community.updates.map((update) => (
                    <div
                      key={update.id}
                      className="bg-white border rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                community.accentColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                community.accentColor === 'green' ? 'bg-green-100 text-green-700' :
                                community.accentColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {update.category}
                              </span>
                              <time className="text-sm text-gray-500">{update.date}</time>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{update.title}</h3>
                            <p className="text-gray-600">{update.summary}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleLike(update.id)}
                              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                                likedPosts.has(update.id)
                                  ? (community.accentColor === 'blue' ? 'bg-blue-100 text-blue-600' :
                                     community.accentColor === 'green' ? 'bg-green-100 text-green-600' :
                                     community.accentColor === 'orange' ? 'bg-orange-100 text-orange-600' :
                                     'bg-gray-100 text-gray-600')
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.has(update.id) ? 'fill-current' : ''}`} />
                              {update.likes + (likedPosts.has(update.id) ? 1 : 0)}
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 text-gray-600 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              {update.comments}
                            </button>
                          </div>
                          <button
                            onClick={() => toggleBookmark(update.id)}
                            className={`p-2 rounded transition-colors ${
                              bookmarkedPosts.has(update.id)
                                ? (community.accentColor === 'blue' ? 'bg-blue-100 text-blue-600' :
                                   community.accentColor === 'green' ? 'bg-green-100 text-green-600' :
                                   community.accentColor === 'orange' ? 'bg-orange-100 text-orange-600' :
                                   'bg-gray-100 text-gray-600')
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarkedPosts.has(update.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No updates at the moment.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
                <PrayerTime />
                
            </div>

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
