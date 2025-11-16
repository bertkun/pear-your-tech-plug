import React from 'react';
import { Phone, OrderType } from '../types';

interface PhoneCardProps {
  phone: Phone;
  orderType: OrderType;
  onAddToCart: (phone: Phone, quantity: number) => void;
  isLoadingDescription: boolean;
}

export const PhoneCard: React.FC<PhoneCardProps> = ({ phone, orderType, onAddToCart, isLoadingDescription }) => {
  const price = orderType === OrderType.Retail ? phone.retailPrice : phone.wholesalePrice;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert(`Navigating to details for ${phone.name}.\n(This is a placeholder for the product detail view.)`);
  };

  return (
    <div className="group bg-base-200 dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10 hover:-translate-y-1 flex flex-col animate-fade-in border border-base-300/50 dark:border-slate-700/50">
      <div className="overflow-hidden">
        {/* Make the image a clickable link to a placeholder detail view */}
        <a 
          href={`#product/${phone.id}`} 
          onClick={handleImageClick}
          aria-label={`View details for ${phone.name}`}
          className="cursor-pointer"
        >
          <img className="w-full h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" src={phone.imageUrl} alt={phone.name} />
        </a>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">{phone.name}</h3>
        {isLoadingDescription ? (
             <div className="h-6 bg-base-300/50 dark:bg-slate-700/50 rounded animate-pulse w-full"></div>
        ) : (
            <p className="text-text-secondary dark:text-slate-400 text-sm mb-4 flex-grow">{phone.description}</p>
        )}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-brand-secondary">${price.toFixed(2)}</span>
            <span className="text-xs text-text-secondary dark:text-slate-300 bg-base-100 dark:bg-slate-700 px-2 py-1 rounded-full border border-base-300/50 dark:border-slate-600">
              {phone.stock} in stock
            </span>
          </div>
          <button
            onClick={() => onAddToCart(phone, 1)}
            className="w-full bg-brand-gradient from-brand-primary to-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:opacity-90 hover:shadow-lg hover:shadow-brand-secondary/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};