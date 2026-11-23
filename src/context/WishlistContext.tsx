import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import WishlistService from '../services/WishlistService';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: Set<number>;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setWishlistIds(new Set());
      return;
    }
    const fetchWishlistIds = async () => {
      try {
        const response = await WishlistService.getWishlistIds();
        setWishlistIds(new Set(response.data));
      } catch (err) {
        console.error('Failed to fetch wishlist ids', err);
      }
    };
    fetchWishlistIds();
  }, [isLoggedIn]);

  const isWishlisted = useCallback((productId: number) => wishlistIds.has(productId), [wishlistIds]);

  const toggleWishlist = useCallback(async (productId: number) => {
    const alreadyWishlisted = wishlistIds.has(productId);
    // Optimistic update - reverted below if the request fails
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (alreadyWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      if (alreadyWishlisted) {
        await WishlistService.removeFromWishlist(productId);
      } else {
        await WishlistService.addToWishlist(productId);
      }
    } catch (err) {
      console.error('Failed to update wishlist', err);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (alreadyWishlisted) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  }, [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
