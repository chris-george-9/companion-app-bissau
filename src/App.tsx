import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Search, Phone, ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { Order } from './types';

// --- Components ---

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
  };

  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}

const OrderCard: React.FC<{ order: Order; onClick: () => void }> = ({ order, onClick }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">#{order.id}</p>
          <h3 className="font-semibold text-gray-900">From {order.sender_name}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <Package className="w-4 h-4 mr-2 text-gray-400" />
        <span>{order.items.length} items • {order.items.reduce((acc, item) => acc + item.qty, 0)} total qty</span>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
        <span className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Est: {new Date(order.estimated_delivery).toLocaleDateString()}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </motion.div>
  );
};

function TimelineStep({ active, completed, icon: Icon, title, date, last }: any) {
  return (
    <div className="relative flex pb-8 last:pb-0">
      {!last && (
        <div className={`absolute top-8 left-3.5 -ml-px h-full w-0.5 ${completed ? 'bg-emerald-500' : 'bg-gray-200'}`} />
      )}
      <div className={`relative flex h-7 w-7 flex-none items-center justify-center rounded-full ${active || completed ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-100 border border-gray-200'}`}>
        <Icon className={`h-4 w-4 ${active || completed ? 'text-white' : 'text-gray-400'}`} />
      </div>
      <div className="ml-4 flex-auto">
        <p className={`text-sm font-medium ${active || completed ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
        {date && <p className="text-xs text-gray-500 mt-0.5">{date}</p>}
      </div>
    </div>
  );
}

// --- Pages ---

function LoginPage({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin(phone);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nha Kinhon</h1>
          <p className="text-emerald-800 mt-2">Track your provisions from Europe</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-100/50"
        >
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative mb-6">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 123456789"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Track Orders'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Use <span className="font-mono text-gray-600">123456789</span> for demo
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Dashboard({ phone, onLogout, onSelectOrder }: { phone: string; onLogout: () => void; onSelectOrder: (order: Order) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?phone=${phone}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [phone]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">Welcome back</p>
          </div>
          <button onClick={onLogout} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
            Logout
          </button>
        </div>
        
        {/* Search Bar Placeholder */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search order ID..." 
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2">Orders sent to {phone} will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onClick={() => onSelectOrder(order)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderDetails({ order, onBack }: { order: Order; onBack: () => void }) {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintType, setComplaintType] = useState('delay');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          type: complaintType,
          description: complaintDesc
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowComplaintForm(false);
          setSubmitted(false);
          setComplaintDesc('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to determine step status
  const getStepStatus = (stepStatus: string) => {
    const statuses = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const stepIndex = statuses.indexOf(stepStatus);
    return {
      completed: currentIndex > stepIndex,
      active: currentIndex === stepIndex
    };
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-20 px-4 py-4 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="ml-2 font-semibold text-lg">Order Details</h1>
      </header>

      <main className="p-6 pb-24">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-500">From {order.sender_name}</p>
        </div>

        {/* Timeline */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Tracking History</h3>
          <div className="pl-2">
            <TimelineStep 
              icon={CheckCircle} 
              title="Order Placed" 
              date={new Date(order.created_at).toLocaleDateString()} 
              {...getStepStatus('pending')} 
            />
            <TimelineStep 
              icon={Package} 
              title="Processing" 
              {...getStepStatus('processing')} 
            />
            <TimelineStep 
              icon={Truck} 
              title="Shipped from Europe" 
              {...getStepStatus('shipped')} 
            />
            <TimelineStep 
              icon={Truck} 
              title="Out for Delivery" 
              {...getStepStatus('out_for_delivery')} 
            />
            <TimelineStep 
              icon={Home} 
              title="Delivered" 
              last={true}
              {...getStepStatus('delivered')} 
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Items</h3>
          <ul className="space-y-3">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-gray-900">x{item.qty}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        {!showComplaintForm ? (
          <button 
            onClick={() => setShowComplaintForm(true)}
            className="w-full flex items-center justify-center py-4 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Report an Issue
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 rounded-2xl p-6 border border-red-100"
          >
            <h3 className="font-semibold text-red-900 mb-4">Report Issue</h3>
            {submitted ? (
              <div className="text-center py-8 text-green-700">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p>Report submitted successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitComplaint}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-red-800 mb-1">Issue Type</label>
                  <select 
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full p-2 rounded-lg border-red-200 focus:ring-red-500 focus:border-red-500 bg-white"
                  >
                    <option value="delay">Delivery Delayed</option>
                    <option value="damaged">Damaged Items</option>
                    <option value="missing">Missing Items</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-red-800 mb-1">Description</label>
                  <textarea 
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    rows={3}
                    className="w-full p-2 rounded-lg border-red-200 focus:ring-red-500 focus:border-red-500 bg-white"
                    placeholder="Please describe the issue..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowComplaintForm(false)}
                    className="flex-1 py-2 text-sm font-medium text-red-700 hover:bg-red-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70"
                  >
                    {submitting ? 'Sending...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!userPhone) {
    return <LoginPage onLogin={setUserPhone} />;
  }

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <Dashboard 
      phone={userPhone} 
      onLogout={() => setUserPhone(null)} 
      onSelectOrder={setSelectedOrder} 
    />
  );
}
