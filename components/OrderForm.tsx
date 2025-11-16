import React from 'react';
import { CartItem, OrderType, DeliveryOption } from '../types';

interface OrderFormProps {
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  deliveryOption: DeliveryOption;
  setDeliveryOption: (option: DeliveryOption) => void;
  onUpdateQuantity: (phoneId: number, newQuantity: number) => void;
  onClearCart: () => void;
  totalPrice: number;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

const OrderTypeToggle: React.FC<{ orderType: OrderType; setOrderType: (type: OrderType) => void; }> = ({ orderType, setOrderType }) => {
    return (
        <div className="flex bg-base-100 dark:bg-slate-700/50 border border-base-300 dark:border-slate-700 rounded-lg p-1">
            <button 
                onClick={() => setOrderType(OrderType.Retail)}
                className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${orderType === OrderType.Retail ? 'bg-brand-gradient from-brand-primary to-brand-secondary text-white shadow' : 'text-text-secondary dark:text-slate-300 hover:bg-base-100 dark:hover:bg-slate-600'}`}
            >
                Retail
            </button>
            <button 
                onClick={() => setOrderType(OrderType.Wholesale)}
                className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${orderType === OrderType.Wholesale ? 'bg-brand-gradient from-brand-primary to-brand-secondary text-white shadow' : 'text-text-secondary dark:text-slate-300 hover:bg-base-100 dark:hover:bg-slate-600'}`}
            >
                Wholesale
            </button>
        </div>
    );
};

const QuantityStepper: React.FC<{
  quantity: number;
  onUpdate: (newQuantity: number) => void;
}> = ({ quantity, onUpdate }) => {
  return (
    <div className="flex items-center">
      <button
        onClick={() => onUpdate(quantity - 1)}
        className="w-7 h-7 flex items-center justify-center bg-base-100 dark:bg-slate-700 rounded-md text-text-secondary dark:text-slate-300 hover:bg-base-300 dark:hover:bg-slate-600 transition-colors border border-base-300 dark:border-slate-600"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="w-10 text-center font-medium text-text-primary dark:text-slate-50" aria-live="polite">{quantity}</span>
      <button
        onClick={() => onUpdate(quantity + 1)}
        className="w-7 h-7 flex items-center justify-center bg-base-100 dark:bg-slate-700 rounded-md text-text-secondary dark:text-slate-300 hover:bg-base-300 dark:hover:bg-slate-600 transition-colors border border-base-300 dark:border-slate-600"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};


const CartItemRow: React.FC<{ item: CartItem; orderType: OrderType; onUpdateQuantity: (id: number, quantity: number) => void; }> = ({ item, orderType, onUpdateQuantity }) => {
    const price = orderType === OrderType.Retail ? item.retailPrice : item.wholesalePrice;
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
                <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg mr-4"/>
                <div>
                    <p className="font-semibold text-text-primary dark:text-slate-50">{item.name}</p>
                    <p className="text-text-secondary dark:text-slate-400 text-sm">${price.toFixed(2)} each</p>
                </div>
            </div>
            <QuantityStepper quantity={item.quantity} onUpdate={(newQuantity) => onUpdateQuantity(item.id, newQuantity)} />
        </div>
    );
};

export const OrderForm: React.FC<OrderFormProps> = ({
  cart,
  orderType,
  setOrderType,
  deliveryOption,
  setDeliveryOption,
  onUpdateQuantity,
  onClearCart,
  totalPrice,
  onPlaceOrder,
  isPlacingOrder
}) => {
  return (
    <div className="bg-base-200 dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-base-300/50 dark:border-slate-700/50">
      <h2 className="text-2xl font-bold text-text-primary dark:text-slate-50 mb-4 border-b border-base-300 dark:border-slate-700 pb-3">Your Order</h2>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-2">Order Type</label>
        <OrderTypeToggle orderType={orderType} setOrderType={setOrderType} />
      </div>

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
        {cart.length === 0 ? (
          <p className="text-text-secondary dark:text-slate-400 text-center py-8">Your cart is empty.</p>
        ) : (
          cart.map(item => <CartItemRow key={item.id} item={item} orderType={orderType} onUpdateQuantity={onUpdateQuantity} />)
        )}
      </div>
       {cart.length > 0 && (
          <div className="text-right mb-4 pr-2">
            <button onClick={onClearCart} className="text-sm font-medium text-text-secondary dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">Clear Cart</button>
          </div>
        )}

      <div className="mb-5">
         <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-2">Delivery Option</label>
         <div className="space-y-3">
             {Object.values(DeliveryOption).map(option => (
                 <label key={option} className={`flex items-center p-4 bg-base-100 dark:bg-slate-700/50 rounded-lg cursor-pointer transition-all border-2 ${deliveryOption === option ? 'border-brand-primary bg-violet-50 dark:bg-slate-700' : 'border-base-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                     <input type="radio" name="delivery" value={option} checked={deliveryOption === option} onChange={() => setDeliveryOption(option)} className="sr-only"/>
                      <div className="w-5 h-5 border-2 border-slate-400 dark:border-slate-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          {deliveryOption === option && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full"></div>}
                      </div>
                     <span className="font-medium text-text-primary dark:text-slate-200">{option}</span>
                 </label>
             ))}
         </div>
      </div>
      
      <div className="border-t border-base-300 dark:border-slate-700 pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-text-secondary dark:text-slate-400">
          <span>Subtotal</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-text-primary dark:text-slate-50 text-xl">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <button
        onClick={onPlaceOrder}
        disabled={cart.length === 0 || isPlacingOrder}
        className="w-full mt-6 bg-brand-gradient from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 flex items-center justify-center"
      >
        {isPlacingOrder ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Placing Order...
          </>
        ) : 'Place Order'}
      </button>
    </div>
  );
};