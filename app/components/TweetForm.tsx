'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

type Props = { onTweetPosted?: () => void };

const TweetForm = ({ onTweetPosted }: Props) => {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== 'authenticated' || !session?.user?.id) {
      console.error('No valid session or user ID', { status, session });
      return;
    }
    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, user_id: parseInt(session.user.id) }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to create tweet');
      }
      await response.json();
      setContent('');
      onTweetPosted?.();
    } catch (error) {
      console.error('Error creating tweet:', error);
    }
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p className="text-red-500">Please log in to tweet</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full p-2 border rounded-md"
        rows={4}
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
        Tweet
      </button>
    </form>
  );
};

export default TweetForm;