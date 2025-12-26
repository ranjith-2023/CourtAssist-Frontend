import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, Search, RefreshCw, AlertCircle, X, Check,
  Scale, MapPin, User, FileText, Calendar, Hash, Building
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import subscriptionService from "../../../services/subscriptionService";

export default function CaseSubscriptionList() {
  const { user } = useAuth();
  const [state, setState] = useState({
    subscriptions: [],
    loading: true,
    error: "",
    search: "",
    selected: [],
    deleteConfirm: null // { id: null, type: 'single' | 'bulk' }
  });

  const loadSubscriptions = async () => {
    if (!user?.userId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: "" }));
      const data = await subscriptionService.getUserSubscriptions(user.userId);
      setState(prev => ({ ...prev, subscriptions: data, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [user?.userId]);

  // Delete confirmation handlers
  const showDeleteConfirm = (id = null) => {
    setState(prev => ({ 
      ...prev, 
      deleteConfirm: { 
        id, 
        type: id ? 'single' : 'bulk',
        count: id ? 1 : state.selected.length
      } 
    }));
  };

  const hideDeleteConfirm = () => {
    setState(prev => ({ ...prev, deleteConfirm: null }));
  };

  const confirmDelete = async () => {
    if (!state.deleteConfirm) return;

    try {
      if (state.deleteConfirm.type === 'single') {
        await subscriptionService.deleteSubscription(state.deleteConfirm.id);
        setState(prev => ({
          ...prev,
          subscriptions: prev.subscriptions.filter(sub => sub.id !== state.deleteConfirm.id),
          deleteConfirm: null
        }));
      } else {
        // Bulk delete
        await Promise.all(
          state.selected.map(id => subscriptionService.deleteSubscription(id))
        );
        setState(prev => ({
          ...prev,
          subscriptions: prev.subscriptions.filter(sub => !state.selected.includes(sub.id)),
          selected: [],
          deleteConfirm: null
        }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, deleteConfirm: null }));
    }
  };

  // Selection handlers
  const toggleSelection = (id) => {
    setState(prev => ({
      ...prev,
      selected: prev.selected.includes(id) 
        ? prev.selected.filter(subId => subId !== id)
        : [...prev.selected, id]
    }));
  };

  const toggleSelectAll = () => {
    setState(prev => ({
      ...prev,
      selected: prev.selected.length === filteredSubs.length ? [] : filteredSubs.map(sub => sub.id)
    }));
  };

  // Filter logic - simplified without type filtering
  const filteredSubs = state.subscriptions.filter(sub => {
    const searchLower = state.search.toLowerCase();
    const matchesSearch = !state.search || 
      sub.caseNo?.toLowerCase().includes(searchLower) ||
      sub.litigantName?.toLowerCase().includes(searchLower) ||
      sub.advocateName?.toLowerCase().includes(searchLower) ||
      sub.courtType?.toLowerCase().includes(searchLower) ||
      sub.state?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (state.error && state.subscriptions.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{state.error}</p>
        </div>
        <button
          onClick={loadSubscriptions}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {state.deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={20} />
                  Confirm Deletion
                </h3>
                <button
                  onClick={hideDeleteConfirm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                {state.deleteConfirm.type === 'single' 
                  ? "Are you sure you want to delete this subscription? This action cannot be undone."
                  : `Are you sure you want to delete ${state.deleteConfirm.count} subscription(s)? This action cannot be undone.`
                }
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={hideDeleteConfirm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete {state.deleteConfirm.count > 1 && `(${state.deleteConfirm.count})`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Subscriptions</h2>
          <p className="text-gray-600 mt-1">Manage your case tracking subscriptions</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            {state.subscriptions.length} active
          </span>
          <button 
            onClick={loadSubscriptions}
            className="p-2 bg-gray-100 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh subscriptions"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by case number, name, or location..."
            value={state.search}
            onChange={e => setState(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredSubs.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className={`p-1 rounded transition-colors ${
                state.selected.length === filteredSubs.length 
                  ? 'text-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {state.selected.length === filteredSubs.length ? (
                <Check size={20} className="bg-indigo-600 text-white rounded" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded" />
              )}
            </button>
            <span className="text-sm text-gray-600">
              {state.selected.length} of {filteredSubs.length} selected
            </span>
          </div>
          
          {state.selected.length > 0 && (
            <button
              onClick={() => showDeleteConfirm()}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
            >
              <Trash2 size={16} />
              Delete Selected ({state.selected.length})
            </button>
          )}
        </div>
      )}

      {/* Subscription List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredSubs.map((subscription) => (
            <SubscriptionCard 
              key={subscription.id} 
              subscription={subscription} 
              onDelete={() => showDeleteConfirm(subscription.id)}
              isSelected={state.selected.includes(subscription.id)}
              onSelect={() => toggleSelection(subscription.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSubs.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300"
        >
          <Scale className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {state.subscriptions.length === 0 
              ? "Get started by creating a new case subscription." 
              : "Try adjusting your search criteria."}
          </p>
        </motion.div>
      )}

      {/* Error Banner */}
      {state.error && state.subscriptions.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-center gap-3">
          <AlertCircle className="text-yellow-500" size={20} />
          <div className="flex-1">
            <p className="text-yellow-700 text-sm">{state.error}</p>
          </div>
          <button
            onClick={loadSubscriptions}
            className="text-yellow-700 underline text-sm"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// Enhanced Subscription Card Component
function SubscriptionCard({ subscription, onDelete, isSelected, onSelect }) {
  const [showDetails, setShowDetails] = useState(false);

  // Get all non-empty fields for display
  const getDisplayFields = () => {
    const fields = [
      { icon: Scale, label: "Court Type", value: subscription.courtType },
      { icon: Hash, label: "Case Number", value: subscription.caseNo },
      { icon: User, label: "Advocate", value: subscription.advocateName },
      { icon: User, label: "Litigant", value: subscription.litigantName },
      { icon: FileText, label: "Case Type", value: subscription.caseType },
      { icon: Calendar, label: "Case Year", value: subscription.caseYear },
      { icon: MapPin, label: "State", value: subscription.state },
      { icon: MapPin, label: "District", value: subscription.district },
      { icon: Building, label: "Court Complex", value: subscription.courtComplex },
      { icon: Building, label: "Court Name", value: subscription.courtName },
    ];

    return fields.filter(field => field.value && field.value.toString().trim() !== "");
  };

  const displayFields = getDisplayFields();
  const hasDetails = displayFields.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Selection Checkbox */}
          <button 
            onClick={onSelect}
            className={`flex-shrink-0 mt-1 p-1 rounded transition-colors ${
              isSelected ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isSelected ? (
              <Check size={20} className="bg-indigo-600 text-white rounded" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {subscription.courtType || 'Court Subscription'}
              </span>
              {subscription.status && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscription.status}
                </span>
              )}
            </div>

            {/* Key Fields - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
              {subscription.caseNo && (
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-400 flex-shrink-0" />
                  <span>Case: {subscription.caseNo}</span>
                </div>
              )}
              {subscription.advocateName && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400 flex-shrink-0" />
                  <span>Advocate: {subscription.advocateName}</span>
                </div>
              )}
              {subscription.litigantName && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400 flex-shrink-0" />
                  <span>Litigant: {subscription.litigantName}</span>
                </div>
              )}
            </div>

            {/* Expandable Details */}
            {hasDetails && (
              <div className="border-t pt-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                  <motion.span
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                        {displayFields.map((field, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <field.icon size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-500">{field.label}:</span>
                            <span className="text-gray-700">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete subscription"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}