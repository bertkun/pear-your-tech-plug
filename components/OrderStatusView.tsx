import React from 'react';
import { Order, OrderStatus, OrderStatusUpdate } from '../types';
import { ClipboardListIcon, PackageIcon, TruckIcon, CheckCircleIcon } from './icons/StatusIcons';

interface OrderStatusViewProps {
  order: Order;
  updates: OrderStatusUpdate[];
  onNewOrder: () => void;
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  [OrderStatus.Placed]: <ClipboardListIcon />,
  [OrderStatus.Processing]: <PackageIcon />,
  [OrderStatus.Packaged]: <PackageIcon />,
  [OrderStatus.Shipped]: <TruckIcon />,
  [OrderStatus.Delivered]: <CheckCircleIcon />,
};

const getStatusColor = (status: OrderStatus, isLast: boolean, isCompleted: boolean) => {
    if (status === OrderStatus.Delivered) return 'text-brand-secondary'; // Pink
    if (isLast) return 'text-brand-primary'; // Purple
    if (isCompleted) return 'text-blue-500';
    return 'text-text-secondary dark:text-slate-400';
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({ order, updates, onNewOrder }) => {
  const latestStatus = updates[updates.length - 1];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-brand-gradient from-brand-primary to-brand-secondary p-0.5 rounded-xl shadow-lg">
        <div className="bg-base-200 dark:bg-slate-800 p-8 rounded-lg text-center">
            <h1 className="text-3xl font-bold text-text-primary dark:text-slate-50 mb-2">Thank You For Your Order!</h1>
            <p className="text-text-secondary dark:text-slate-400 mb-4">Order ID: <span className="font-mono text-brand-primary">{order.id}</span></p>
            <p className={`text-lg font-semibold ${getStatusColor(latestStatus.status, true, false)}`}>{latestStatus.status}</p>
        </div>
      </div>


      <div className="my-10">
        <div className="relative pl-8">
          {updates.map((update, index) => {
            const isLast = index === updates.length - 1;
            const isCompleted = index < updates.length - 1;
            const colorClass = getStatusColor(update.status, isLast, isCompleted);

            return (
              <div key={index} className="flex items-start mb-10 animate-slide-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                 {/* Timeline Line */}
                {!isLast && <div className="absolute left-[45px] top-12 bottom-0 w-0.5 bg-base-300 dark:bg-slate-700"></div>}
                
                {/* Status Icon */}
                <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-base-100 dark:bg-slate-900">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-base-200 dark:bg-slate-800 border-2 border-base-300 dark:border-slate-700 ${colorClass}`}>
                     {statusIcons[update.status]}
                  </div>
                </div>

                <div className="ml-6 flex-grow">
                  <h4 className="font-bold text-lg text-text-primary dark:text-slate-50">{update.status}</h4>
                  <p className="text-text-secondary dark:text-slate-400 text-sm mt-1">{update.message}</p>
                  <p className="text-xs text-text-secondary/70 dark:text-slate-500 mt-2">{update.timestamp.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {latestStatus.status === OrderStatus.Delivered && (
        <div className="text-center animate-fade-in">
            <button onClick={onNewOrder} className="bg-brand-gradient from-brand-primary to-brand-secondary text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300">
                Place Another Order
            </button>
        </div>
      )}
    </div>
  );
};