import React, { useState, useEffect } from 'react';
import { Phone } from '../types';

interface AdminDashboardProps {
  phones: Phone[];
  onAddPhone: (newPhone: Omit<Phone, 'id' | 'description'>) => Promise<void>;
  onUpdateStock: (phoneId: number, newStock: number) => void;
}

const initialFormState = {
  name: '',
  imageUrl: 'https://picsum.photos/seed/new/400/400',
  retailPrice: 0,
  wholesalePrice: 0,
  stock: 0,
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ phones, onAddPhone, onUpdateStock }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockLevels, setStockLevels] = useState<Record<number, string>>({});
   const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);


  useEffect(() => {
    // Initialize local stock levels from props
    const initialStock = phones.reduce((acc, phone) => {
      acc[phone.id] = String(phone.stock);
      return acc;
    }, {} as Record<number, string>);
    setStockLevels(initialStock);
  }, [phones]);


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'imageUrl' ? value : Number(value),
    }));
  };
  
  const handleStockChange = (phoneId: number, value: string) => {
    setStockLevels(prev => ({ ...prev, [phoneId]: value }));
  };

  const handleStockUpdate = (phoneId: number) => {
    const newStock = parseInt(stockLevels[phoneId], 10);
    if (!isNaN(newStock) && newStock >= 0) {
      onUpdateStock(phoneId, newStock);
    } else {
        // Optionally reset to original value if input is invalid
        const originalStock = phones.find(p => p.id === phoneId)?.stock ?? 0;
        setStockLevels(prev => ({...prev, [phoneId]: String(originalStock)}));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.retailPrice <= 0 || formData.stock < 0) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields with valid values.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
        await onAddPhone(formData);
        setFeedback({ type: 'success', message: `${formData.name} has been successfully added.`});
        setFormData(initialFormState);
    } catch (error) {
        setFeedback({ type: 'error', message: 'Failed to add the new phone. Please try again.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-50 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Product Form */}
            <div className="lg:col-span-1 bg-base-200 dark:bg-slate-800 p-6 rounded-xl shadow-lg h-fit border border-base-300/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-4">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Phone Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md focus:border-brand-primary focus:ring-brand-primary shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Image URL</label>
                        <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleFormChange} required className="mt-1 block w-full bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md focus:border-brand-primary focus:ring-brand-primary shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="retailPrice" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Retail Price</label>
                            <input type="number" name="retailPrice" id="retailPrice" value={formData.retailPrice} onChange={handleFormChange} required className="mt-1 block w-full bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md focus:border-brand-primary focus:ring-brand-primary shadow-sm" />
                        </div>
                         <div>
                            <label htmlFor="wholesalePrice" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Wholesale Price</label>
                            <input type="number" name="wholesalePrice" id="wholesalePrice" value={formData.wholesalePrice} onChange={handleFormChange} required className="mt-1 block w-full bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md focus:border-brand-primary focus:ring-brand-primary shadow-sm" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Stock</label>
                        <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleFormChange} required className="mt-1 block w-full bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md focus:border-brand-primary focus:ring-brand-primary shadow-sm" />
                    </div>
                    {feedback && (
                        <div className={`text-sm p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                           {feedback.message}
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-brand-gradient from-brand-primary to-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-wait">
                        {isSubmitting ? 'Adding...' : 'Add Product'}
                    </button>
                </form>
            </div>

            {/* Current Inventory Table */}
            <div className="lg:col-span-2 bg-base-200 dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-base-300/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-4">Current Inventory</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-base-300 dark:border-slate-700 text-sm text-text-secondary dark:text-slate-400">
                            <tr>
                                <th className="p-3 font-semibold">Product</th>
                                <th className="p-3 font-semibold">Retail Price</th>
                                <th className="p-3 font-semibold">Wholesale Price</th>
                                <th className="p-3 font-semibold w-48">Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phones.map(phone => (
                                <tr key={phone.id} className="border-b border-base-300/50 dark:border-slate-700/50">
                                    <td className="p-3 flex items-center space-x-3">
                                        <img src={phone.imageUrl} alt={phone.name} className="w-10 h-10 object-cover rounded-md" />
                                        <span className="font-medium text-text-primary dark:text-slate-50">{phone.name}</span>
                                    </td>
                                    <td className="p-3 text-text-secondary dark:text-slate-400">${phone.retailPrice.toFixed(2)}</td>
                                    <td className="p-3 text-text-secondary dark:text-slate-400">${phone.wholesalePrice.toFixed(2)}</td>
                                    <td className="p-3 text-text-secondary dark:text-slate-400">
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="number" 
                                                value={stockLevels[phone.id] || ''} 
                                                onChange={(e) => handleStockChange(phone.id, e.target.value)}
                                                className="w-20 bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md focus:border-brand-primary focus:ring-brand-primary shadow-sm text-sm p-2"
                                            />
                                            <button 
                                                onClick={() => handleStockUpdate(phone.id)}
                                                className="px-3 py-2 text-xs font-semibold text-brand-primary bg-violet-100 hover:bg-violet-200 dark:bg-slate-600 dark:text-slate-50 dark:hover:bg-slate-500 rounded-md transition-colors"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};