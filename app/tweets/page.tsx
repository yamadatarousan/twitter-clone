'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TweetForm from '../components/TweetForm';
import FollowButton from '../components/FollowButton';

export default function TweetPage() {
  const { data: session, status } = useSession();
  const [tweets, setTweets] = useState<
    { id: number; content: string; created_at: string; user_id: number; email: string }[]
  >([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function fetchTweets() {
      if (status !== 'authenticated' || !session?.user?.id) {
        console.log('Session not authenticated:', { status, session });
        return;
      }
      try {
        const res = await fetch('/api/tweets', { credentials: 'include' });
        if (res.ok) {
          setTweets(await res.json());
        } else {
          console.error('Fetch tweets failed:', res.status, await res.json());
        }
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    }
    fetchTweets();
  }, [refresh, status, session]);

  const handleTweetPosted = () => setRefresh((prev) => prev + 1);
  const handleFollowChange = () => setRefresh((prev) => prev + 1);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p className="text-red-500">Please log in</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Post a Tweet</h1>
      <TweetForm onTweetPosted={handleTweetPosted} />
      <div className="mt-4 space-y-2">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="p-2 border rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{tweet.email}</p>
                <p>{tweet.content}</p>
              </div>
              <FollowButton followeeId={tweet.user_id} onFollowChange={handleFollowChange} />
            </div>
            <p className="text-sm text-gray-500">{new Date(tweet.created_at).toLocaleString()}</p>
            {session?.user?.id === tweet.user_id.toString() && (
              <button
                onClick={async () => {
                  await fetch('/api/tweets', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: tweet.id }),
                    credentials: 'include',
                  });
                  setRefresh((prev) => prev + 1);
                }}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}