'use client';
import { useState, useEffect } from 'react';
import TweetForm from '../components/TweetForm';

export default function TweetPage() {
  const [tweets, setTweets] = useState<{ id: number; content: string; created_at: string }[]>([]);
  const [refresh, setRefresh] = useState(0);

  // ツイート取得
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

  // TweetFormから更新通知
  const handleTweetPosted = () => setRefresh((prev) => prev + 1);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Post a Tweet</h1>
      <TweetForm onTweetPosted={handleTweetPosted} />
      <div className="mt-4 space-y-2">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="p-2 border rounded-md">
            <p>{tweet.content}</p>
            <p className="text-sm text-gray-500">{new Date(tweet.created_at).toLocaleString()}</p>
            <button
                onClick={async () => {
                    await fetch('/api/tweets', { method: 'DELETE', body: JSON.stringify({ id: tweet.id }) });
                    setRefresh((prev) => prev + 1);
                }}
                className="text-red-500"
            >
                Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}