'use client';
import TweetForm from '../components/TweetForm';

export default function TweetPage() {
    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Post a Tweet</h1>
            <TweetForm />
        </div>
    );
} 