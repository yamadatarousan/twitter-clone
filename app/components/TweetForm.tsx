'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

type Props = { onTweetPosted?: () => void };

const TweetForm = ({ onTweetPosted }: Props) => {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }
    
    setIsSubmitting(true);
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
      
      setContent('');
      onTweetPosted?.();
    } catch (error) {
      console.error('Error creating tweet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="h-24 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (!session || !session.user?.id) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center">Please log in to tweet</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={4}
        required
        disabled={isSubmitting}
      />
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-6 py-2 rounded-full font-medium text-white
            ${isSubmitting 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 transition duration-200'
            }
          `}
        >
          {isSubmitting ? 'Posting...' : 'Tweet'}
        </button>
      </div>
    </form>
  );
};

export default TweetForm;