import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Scale, MapPin, User, FileText, Calendar, Hash, 
  Briefcase, CheckCircle, AlertCircle, Building
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import subscriptionService from "../../../services/subscriptionService";
import { SELECT_OPTIONS } from "./selectOptions";

export default function CaseSubscriptionForm() {
  const { user } = useAuth();
  const isAdvocate = user?.role === "advocate";
  
  const [form, setForm] = useState({
    courtType: "",
    mode: isAdvocate ? "advocate" : "litigant",
    fields: {
      state: "", district: "", courtComplex: "", courtName: "",
      litigantName: "", caseType: "", caseNo: "", caseYear: ""
    }
  });
  
  const [ui, setUi] = useState({
    loading: false,
    message: { text: "", type: "" },
    available: { districts: [], complexes: [], courts: [] },
    hasCourtComplex: false,
    hasCourtName: false
  });

  // Update mode when user changes
  useEffect(() => {
    setForm(prev => ({ ...prev, mode: isAdvocate ? "advocate" : "litigant" }));
  }, [isAdvocate]);

  // Cascading dropdowns
  useEffect(() => {
    if (form.fields.state) {
      const districts = SELECT_OPTIONS.districts[form.fields.state] || [];
      setUi(prev => ({ 
        ...prev, 
        available: { ...prev.available, districts, complexes: [], courts: [] },
        hasCourtComplex: false,
        hasCourtName: false
      }));
      setForm(prev => ({ 
        ...prev, 
        fields: { ...prev.fields, district: "", courtComplex: "", courtName: "" } 
      }));
    }
  }, [form.fields.state]);

  useEffect(() => {
    if (form.fields.district) {
      const complexes = SELECT_OPTIONS.courtComplexes[form.fields.district] || [];
      const hasCourtComplex = complexes.length > 0;
      
      setUi(prev => ({ 
        ...prev, 
        available: { ...prev.available, complexes, courts: [] },
        hasCourtComplex,
        hasCourtName: false
      }));
      
      setForm(prev => ({ 
        ...prev, 
        fields: { 
          ...prev.fields, 
          courtComplex: hasCourtComplex ? "" : "N/A",
          courtName: "" 
        } 
      }));
    }
  }, [form.fields.district]);

  useEffect(() => {
    if (form.fields.courtComplex && form.fields.courtComplex !== "N/A") {
      const courts = SELECT_OPTIONS.courtNames[form.fields.courtComplex] || [];
      const hasCourtName = courts.length > 0;
      
      setUi(prev => ({ 
        ...prev, 
        available: { ...prev.available, courts },
        hasCourtName
      }));
      
      setForm(prev => ({ 
        ...prev, 
        fields: { 
          ...prev.fields, 
          courtName: hasCourtName ? "" : "N/A"
        } 
      }));
    }
  }, [form.fields.courtComplex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare fields for validation - remove "N/A" values for optional fields
    const submissionFields = { ...form.fields };
    if (submissionFields.courtComplex === "N/A") submissionFields.courtComplex = "";
    if (submissionFields.courtName === "N/A") submissionFields.courtName = "";
    
    const errors = subscriptionService.validateForm(form.courtType, submissionFields, form.mode);
    if (errors.length > 0) {
      setUi(prev => ({ ...prev, message: { text: errors[0], type: "error" } }));
      return;
    }

    setUi(prev => ({ ...prev, loading: true }));

    try {
      await subscriptionService.createSubscription(submissionFields, form.mode, user, form.courtType);
      
      setUi(prev => ({ 
        ...prev, 
        loading: false,
        message: { text: "✓ Subscription created successfully!", type: "success" } 
      }));
      
      // Reset form properly
      setForm({
        courtType: "",
        mode: isAdvocate ? "advocate" : "litigant",
        fields: { 
          state: "", district: "", courtComplex: "", courtName: "", 
          litigantName: "", caseType: "", caseNo: "", caseYear: ""
        }
      });
      setUi(prev => ({ 
        ...prev, 
        available: { districts: [], complexes: [], courts: [] },
        hasCourtComplex: false,
        hasCourtName: false
      }));
      
    } catch (error) {
      setUi(prev => ({ 
        ...prev, 
        loading: false,
        message: { text: error.message, type: "error" } 
      }));
    }
  };

  const showState = ["High Court", "District / Taluk Court"].includes(form.courtType);
  const showDistrict = form.courtType === "District / Taluk Court";
  const showCourtComplex = showDistrict && form.fields.district && ui.hasCourtComplex;
  const showCourtName = showCourtComplex && form.fields.courtComplex && ui.hasCourtName;

  // Show info message when court complex or court name are skipped
  const showSkippedMessage = showDistrict && form.fields.district && 
    (!ui.hasCourtComplex || !ui.hasCourtName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#0b1a2e] to-indigo-700 rounded-xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Case Subscription</h1>
            <p className="text-blue-100 mt-1">Track cases and receive timely updates</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {isAdvocate ? "👨‍💼 Advocate" : "👤 User"}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Message */}
          {ui.message.text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg flex items-center gap-3 ${
                ui.message.type === "success" 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {ui.message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{ui.message.text}</span>
            </motion.div>
          )}

          {/* Skipped Fields Info */}
          {showSkippedMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="font-medium">Note:</span>
              </div>
              <div className="mt-1">
                {!ui.hasCourtComplex && (
                  <p>• Court complex data not available for this district - skipping</p>
                )}
                {ui.hasCourtComplex && !ui.hasCourtName && (
                  <p>• Court name data not available for this complex - skipping</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Court Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Scale className="text-blue-600" size={18} />
              Court Type
            </label>
            <select
              value={form.courtType}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                courtType: e.target.value,
                fields: { ...prev.fields, state: "", district: "", courtComplex: "", courtName: "" }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select court type</option>
              {SELECT_OPTIONS.courtTypes?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Mode</label>
            <div className="flex gap-2 flex-wrap">
              {isAdvocate && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, mode: "advocate" }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.mode === "advocate" 
                      ? "bg-[#0b1a2e] text-white shadow-sm" 
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  By Case Number
                </button>
              )}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, mode: "litigant" }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.mode === "litigant" 
                    ? "bg-[#0b1a2e] text-white shadow-sm" 
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                By Litigant Name
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, mode: "dataset" }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.mode === "dataset" 
                    ? "bg-[#0b1a2e] text-white shadow-sm" 
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                By Case Details
              </button>
            </div>
          </div>

          {/* Location Fields */}
          {(showState || showDistrict || showCourtComplex || showCourtName) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {showState && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    State
                  </label>
                  <select
                    value={form.fields.state}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      fields: { ...prev.fields, state: e.target.value, district: "", courtComplex: "", courtName: "" } 
                    }))}
                    required={showState}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select state</option>
                    {SELECT_OPTIONS.states?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {showDistrict && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={form.fields.district}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      fields: { ...prev.fields, district: e.target.value, courtComplex: "", courtName: "" } 
                    }))}
                    required={showDistrict}
                    disabled={!ui.available.districts.length}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select district</option>
                    {ui.available.districts.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}

              {showCourtComplex && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Building size={16} className="text-blue-600" />
                    Court Complex
                  </label>
                  <select
                    value={form.fields.courtComplex}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      fields: { ...prev.fields, courtComplex: e.target.value, courtName: "" } 
                    }))}
                    required={showCourtComplex}
                    disabled={!ui.available.complexes.length}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select court complex</option>
                    {ui.available.complexes.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}

              {showCourtName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Building size={16} className="text-blue-600" />
                    Court Name
                  </label>
                  <select
                    value={form.fields.courtName}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      fields: { ...prev.fields, courtName: e.target.value } 
                    }))}
                    required={showCourtName}
                    disabled={!ui.available.courts.length}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select court name</option>
                    {ui.available.courts.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}

          {/* Dynamic Fields */}
          <motion.div
            key={form.mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {form.mode === "advocate" ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-blue-900">Advocate Subscription</p>
                    <p className="text-blue-700 text-sm">Linked to your account</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Enter case number"
                  value={form.fields.caseNo}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, fields: { ...prev.fields, caseNo: e.target.value } }));
                    console.log(form.fields.caseNo)}}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : form.mode === "litigant" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    Litigant Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter litigant name"
                    value={form.fields.litigantName}
                    onChange={(e) => setForm(prev => ({ ...prev, fields: { ...prev.fields, litigantName: e.target.value } }))}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Hash size={16} className="text-blue-600" />
                    Case Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter case number"
                    value={form.fields.caseNo}
                    onChange={(e) => setForm(prev => ({ ...prev, fields: { ...prev.fields, caseNo: e.target.value } }))}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Case Type
                  </label>
                  <select
                    value={form.fields.caseType}
                    onChange={(e) => setForm(prev => ({ ...prev, fields: { ...prev.fields, caseType: e.target.value } }))}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {SELECT_OPTIONS.caseTypes?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Hash size={16} className="text-blue-600" />
                    Case Number
                  </label>
                  <input
                    type="text"
                    placeholder="Case number"
                    value={form.fields.caseNo}
                    onChange={(e) => setForm(prev => ({ ...prev, fields: { ...prev.fields, caseNo: e.target.value } }))}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    Case Year
                  </label>
                  <input
                    type="number"
                    placeholder="Year"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.fields.caseYear}
                    onChange={(e) => setForm(prev => ({ ...prev, fields: { ...prev.fields, caseYear: e.target.value } }))}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={ui.loading}
            className="w-full bg-gradient-to-r from-[#0b1a2e] to-indigo-600 text-white p-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {ui.loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Subscription...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Scale size={20} />
                Add Case
              </div>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}