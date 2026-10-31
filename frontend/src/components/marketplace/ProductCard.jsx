import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles, Sliders, ArrowRight, MessageSquare, MapPin, ShieldCheck, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = ({ product, onViewDetails, onContactSupplier }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, role, getOrCreateConversationForProduct } = useAuth();
  const isWishlisted = wishlist.includes(product.id);

  const handleDirectChat = () => {
    if (onContactSupplier) {
      onContactSupplier(product);
    } else {
      const conv = getOrCreateConversationForProduct(product);
      navigate(`/${role}/messages/${conv.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:border-[#FF7138]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Product Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // Fallback image in case of external network block
              e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Top Pill Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
            <Badge variant="orange" size="xs">
              Demo Record
            </Badge>
            {product.customizationAvailable && (
              <Badge variant="teal" size="xs">
                AI Customizable
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 shadow-md scale-110'
                : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* MOQ Bottom Strip */}
          <div className="absolute bottom-2 left-2.5 bg-[#111111]/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
            MOQ: {product.moq} units
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs font-mono text-[#858585]">
            <span className="truncate max-w-[65%] text-[#FF7138] font-medium">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="font-bold text-[#111111]">{product.manufacturer.rating}</span>
              <span className="text-[10px] text-[#858585]">({product.manufacturer.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-sm font-bold font-heading text-[#111111] line-clamp-2 hover:text-[#FF7138] cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Price Range */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-extrabold font-heading text-[#111111]">
              {product.priceINR}
            </span>
            <span className="text-[10px] text-[#858585] font-mono">/ unit</span>
          </div>

          {/* 3 Key Technical Specifications */}
          <div className="bg-[#F5F5F3] p-2.5 rounded-xl space-y-1 text-[11px] font-mono text-[#111111]/80">
            {product.specifications.slice(0, 3).map((spec, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] truncate">
                <span className="text-[#858585] truncate">{spec.label}:</span>
                <span className="font-semibold text-[#111111] truncate ml-1">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Manufacturer Snippet */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#858585]">
            <div className="truncate max-w-[70%]">
              <span className="block font-medium text-[#111111] truncate">{product.manufacturer.name}</span>
              <span className="flex items-center gap-1 text-[10px]">
                <MapPin size={10} className="text-[#FF7138] shrink-0" />
                <span className="truncate">{product.manufacturer.location}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#20B8A5] font-semibold bg-[#20B8A5]/10 px-1.5 py-0.5 rounded">
              {product.manufacturer.responseRate} resp.
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
            className="w-full text-xs"
          >
            View Details
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/customize/${product.id}`)}
            leftIcon={<Sliders size={12} />}
            className="w-full text-xs"
          >
            Customize
          </Button>
        </div>

        <button
          type="button"
          onClick={handleDirectChat}
          className="w-full py-1.5 text-center text-xs font-mono text-[#858585] hover:text-[#FF7138] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MessageSquare size={12} className="text-[#FF7138]" />
          <span>Chat with Manufacturer</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

