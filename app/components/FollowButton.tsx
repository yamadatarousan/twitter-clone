'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type Props = { followeeId: number; onFollowChange: () => void };

export default function FollowButton({ followeeId, onFollowChange }: Props) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/follows?followee_id=${followeeId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setIsFollowing(data.isFollowing));
    }
  }, [session, followeeId]);

  const handleFollow = async () => {
    if (!session?.user?.id) return;
    const method = isFollowing ? 'DELETE' : 'POST';
    const response = await fetch('/api/follows', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followee_id: followeeId }),
      credentials: 'include',
    });
    if (response.ok) {
      setIsFollowing(!isFollowing);
      onFollowChange();
    }
  };

  if (!session || parseInt(session.user.id) === followeeId) return null;

  return (
    <button
      onClick={handleFollow}
      className={`px-3 py-1 rounded-md text-sm ${
        isFollowing ? 'bg-gray-300' : 'bg-blue-500 text-white'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}