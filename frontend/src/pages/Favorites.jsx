import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Loader2 } from 'lucide-react';
import AlternativeCard from '../components/AlternativeCard';

const Favorites = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/user/favorites');
                if (res.data.success) {
                    setFavorites(res.data.favorites);
                }
            } catch (error) {
                console.error("Favorites fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                            <Heart className="text-pink-500" /> My Saved Products
                        </h1>
                        <p className="text-gray-500 font-medium">Your curated list of safe and healthy food alternatives.</p>
                    </div>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((product) => (
                            <AlternativeCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="pt-20 text-center flex flex-col items-center">
                        <div className="bg-pink-50 p-6 rounded-full inline-block mb-6">
                            <Heart className="w-12 h-12 text-pink-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                            Scan a product or search through categories, and click the "Save to Favorites" button to build your personalized safety list!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
