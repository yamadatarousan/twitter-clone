'use client';
import { useState } from 'react';

type Props = { onTweetPosted?: () => void };

const TweetForm = ({ onTweetPosted }: Props) => {
  const [content, setContent] = useState('');
  const [user_id, setUserId] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, user_id }),
      });
      if (!response.ok) throw new Error('Failed to create tweet');
      await response.json();
      setContent('');
      onTweetPosted?.();
    } catch (error) {
      console.error('Error creating tweet:', error);
    }
  };

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