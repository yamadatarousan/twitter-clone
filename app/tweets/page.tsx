'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TweetForm from '../components/TweetForm';

type Tweet = {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  user_email: string;
  username: string | null;
};

export default function TweetPage() {
  const { data: session, status } = useSession();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function fetchTweets() {
      try {
        const res = await fetch('/api/tweets');
        if (res.ok) setTweets(await res.json());
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    }
    fetchTweets();
  }, [refresh]);

  const handleTweetPosted = () => setRefresh((prev) => prev + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Timeline</h1>
        <TweetForm onTweetPosted={handleTweetPosted} />
      </div>
      
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {session?.user?.id === tweet.user_id.toString() ? (
                    <>
                      <span className="font-medium text-gray-900">
                        {tweet.username || 'You'} 
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {tweet.username || `User #${tweet.user_id}`}
                      <span className="text-xs text-gray-500 ml-2">(ID: {tweet.user_id})</span>
                    </span>
                  )}
                </div>
                <p className="text-gray-800 text-lg">{tweet.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(tweet.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {session?.user?.id === tweet.user_id.toString() && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this tweet?')) {
                      await fetch('/api/tweets', { 
                        method: 'DELETE', 
                        body: JSON.stringify({ id: tweet.id }) 
                      });
                      setRefresh((prev) => prev + 1);
                    }
                  }}
                  className="ml-4 text-red-500 hover:text-red-600 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}