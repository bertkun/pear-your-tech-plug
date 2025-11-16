import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { PhoneCard } from './components/PhoneCard';
import { OrderForm } from './components/OrderForm';
import { OrderStatusView } from './components/OrderStatusView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { HeroSection } from './components/HeroSection';
import { ProductFilters } from './components/ProductFilters';
import { generateOrderStatusUpdate } from './services/geminiService';
import { Phone, CartItem, OrderType, DeliveryOption, Order, OrderStatus, OrderStatusUpdate } from './types';
import { API_BASE_URL } from './config';

type ViewMode = 'customer' | 'adminLogin' | 'adminDashboard';
type Theme = 'light' | 'dark';

const ConnectionErrorDisplay = () => (
    <div className="mt-8 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-r-lg" role="alert">
        <p className="font-bold text-lg">Connection Error</p>
        <p className="mt-1">Could not connect to the PEAR server.</p>
        <p className="mt-3">
            This usually means the backend server is not running. Please follow the setup instructions in the
            <code className="bg-red-200 dark:bg-red-800/50 font-mono p-1 mx-1 rounded text-sm">backend/README.md</code>
            file and restart the server.
        </p>
        <p className="mt-3 text-sm">
            Once the server is running, <a href="#" onClick={() => window.location.reload()} className="underline font-medium hover:text-red-600 dark:hover:text-red-100">refresh this page</a>.
        </p>
    </div>
);


const App: React.FC = () => {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Retail);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>(DeliveryOption.Standard);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderUpdates, setOrderUpdates] = useState<OrderStatusUpdate[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  // Sorting and Filtering State
  const [sortOption, setSortOption] = useState('name-asc');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        setIsLoading(true);
        setConnectionError(false);
        const response = await fetch(`${API_BASE_URL}/api/phones`);
        if (!response.ok) {
          throw new Error('Failed to fetch phones from the server.');
        }
        const data: Phone[] = await response.json();
        setPhones(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhones();
  }, []);
  
  const handleAddNewPhone = async (newPhoneData: Omit<Phone, 'id' | 'description'>) => {
    const response = await fetch(`${API_BASE_URL}/api/phones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPhoneData),
    });
    const newPhone: Phone = await response.json();
    setPhones(prevPhones => [...prevPhones, newPhone]);
  };

  const handleUpdateStock = async (phoneId: number, newStock: number) => {
     try {
        const response = await fetch(`${API_BASE_URL}/api/phones/${phoneId}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock }),
        });
        if (!response.ok) {
            throw new Error('Failed to update stock.');
        }
        const updatedPhone: Phone = await response.json();
        setPhones(prevPhones => 
          prevPhones.map(phone => 
            phone.id === phoneId ? updatedPhone : phone
          )
        );
     } catch (error) {
         console.error("Error updating stock:", error);
         // Optionally revert UI or show error message
     }
  };

  const handleAddToCart = useCallback((phone: Phone, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === phone.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === phone.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...phone, quantity }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((phoneId: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== phoneId);
      }
      return prevCart.map(item =>
        item.id === phoneId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = orderType === OrderType.Retail ? item.retailPrice : item.wholesalePrice;
      return total + price * item.quantity;
    }, 0);
  }, [cart, orderType]);
  
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: cart,
      orderType,
      deliveryOption,
      totalPrice,
      createdAt: new Date(),
    };
    
    setCurrentOrder(newOrder);

    const initialUpdate: OrderStatusUpdate = {
        status: OrderStatus.Placed,
        message: `Your order #${newOrder.id} has been successfully placed. We're getting it ready for you.`,
        timestamp: new Date(),
    };
    setOrderUpdates([initialUpdate]);

    const statusesToUpdate: OrderStatus[] = [
      OrderStatus.Processing,
      OrderStatus.Packaged,
      OrderStatus.Shipped,
      OrderStatus.Delivered,
    ];

    let delay = 3000;
    for (const status of statusesToUpdate) {
      await new Promise(resolve => setTimeout(resolve, delay));
      const message = await generateOrderStatusUpdate(status);
      setOrderUpdates(prev => [...prev, { status, message, timestamp: new Date() }]);
      delay += Math.random() * 2000 + 2000;
    }
    
    setIsPlacingOrder(false);
  };
  
  const handleNewOrder = () => {
    setCurrentOrder(null);
    setOrderUpdates([]);
    setCart([]);
  };

  const filteredAndSortedPhones = useMemo(() => {
    let result = [...phones];

    if (showInStockOnly) {
      result = result.filter(phone => phone.stock > 0);
    }

    result.sort((a, b) => {
      const priceA = orderType === OrderType.Retail ? a.retailPrice : a.wholesalePrice;
      const priceB = orderType === OrderType.Retail ? b.retailPrice : b.wholesalePrice;
      switch (sortOption) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [phones, sortOption, showInStockOnly, orderType]);

  const renderContent = () => {
    switch(viewMode) {
      case 'adminLogin':
        return <AdminLogin onLoginSuccess={() => setViewMode('adminDashboard')} />;
      case 'adminDashboard':
        return <AdminDashboard phones={phones} onAddPhone={handleAddNewPhone} onUpdateStock={handleUpdateStock} />;
      case 'customer':
      default:
        return currentOrder ? (
          <OrderStatusView order={currentOrder} updates={orderUpdates} onNewOrder={handleNewOrder} />
        ) : (
          <>
            <HeroSection />
            <div id="products" className="flex flex-col lg:flex-row lg:space-x-12 pt-12">
              <div className="lg:w-2/3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-text-primary dark:text-slate-50 mb-2 tracking-tight">Discover Your Next Device</h2>
                        <p className="text-lg text-text-secondary dark:text-slate-400">Premium technology, unparalleled prices.</p>
                    </div>
                </div>
                <ProductFilters
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    showInStockOnly={showInStockOnly}
                    setShowInStockOnly={setShowInStockOnly}
                />
                
                {connectionError ? (
                  <ConnectionErrorDisplay />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="bg-base-200 dark:bg-slate-800 rounded-xl shadow-lg p-5 animate-pulse">
                              <div className="h-56 bg-base-300/50 dark:bg-slate-700/50 rounded-md mb-4"></div>
                              <div className="h-6 bg-base-300/50 dark:bg-slate-700/50 rounded w-3/4 mb-3"></div>
                              <div className="h-4 bg-base-300/50 dark:bg-slate-700/50 rounded w-full mb-4"></div>
                              <div className="h-4 bg-base-300/50 dark:bg-slate-700/50 rounded w-1/2 mb-5"></div>
                              <div className="h-10 bg-base-300/50 dark:bg-slate-700/50 rounded-md"></div>
                          </div>
                      ))
                    ) : (
                      filteredAndSortedPhones.map(phone => (
                          <PhoneCard
                            key={phone.id}
                            phone={phone}
                            orderType={orderType}
                            onAddToCart={handleAddToCart}
                            isLoadingDescription={isLoading}
                          />
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                <div className="sticky top-28">
                  <OrderForm 
                    cart={cart}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    deliveryOption={deliveryOption}
                    setDeliveryOption={setDeliveryOption}
                    onUpdateQuantity={handleUpdateQuantity}
                    onClearCart={clearCart}
                    totalPrice={totalPrice}
                    onPlaceOrder={handlePlaceOrder}
                    isPlacingOrder={isPlacingOrder}
                  />
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={toggleTheme} 
      />
      <main className="container mx-auto p-6 lg:p-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;