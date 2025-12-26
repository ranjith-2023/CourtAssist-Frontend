import { request } from './httpClient';

// Court type mappings
const COURT_LEVEL_MAP = {
  "High Court": "HIGH_COURT",
  "District / Taluk Court": "DISTRICT_COURT", 
  "Supreme Court": "SUPREME_COURT"
};

const COURT_DISPLAY_MAP = {
  "HIGH_COURT": "High Court",
  "DISTRICT_COURT": "District / Taluk Court",
  "SUPREME_COURT": "Supreme Court"
};

class SubscriptionService {
  // Fixed field mapping with proper courtLevel handling
  static mapSubscriptionData(formData, mode, user, courtType) {
    const basePayload = {
      userId: user?.userId,
      courtLevel: COURT_LEVEL_MAP[courtType], // Fixed: use courtType parameter
      state: formData.state || null,
      district: formData.district || null,
      courtComplex: formData.courtComplex || null,
      courtName: formData.courtName || null,
      caseNo: formData.caseNo // Fixed: caseNo instead of caseNumber
    };

    switch (mode) {
      case "advocate":
        return { 
          ...basePayload, 
          advocateName: user?.advocateName || user?.username 
        };
      case "litigant":
        return { 
          ...basePayload, 
          litigantName: formData.litigantName 
        };
      case "dataset":
        return { 
          ...basePayload, 
          caseType: formData.caseType, 
          caseYear: formData.caseYear ? parseInt(formData.caseYear) : null 
        };
      default:
        return basePayload;
    }
  }

  // Enhanced API call with courtType parameter
  static async createSubscription(formData, mode, user, courtType) {
    try {
      const payload = this.mapSubscriptionData(formData, mode, user, courtType);
      const endpoint = this.getEndpoint(mode);
      
      console.log('Creating subscription with payload:', payload); // Debug log
      
      const response = await request(endpoint, {
        method: 'POST',
        body: payload
      });
      
      return response;
    } catch (error) {
      console.error('Subscription creation error:', error); // Debug log
      throw new Error(error.message || `Failed to create ${mode} subscription`);
    }
  }

  static getEndpoint(mode) {
    const endpoints = {
      advocate: '/subscriptions/advocate',
      litigant: '/subscriptions/litigant',
      dataset: '/subscriptions/case-details'
    };
    return endpoints[mode] || endpoints.litigant;
  }

  // Enhanced subscription fetching with field mapping
  static async getUserSubscriptions(userId) {
    try {
      const response = await request(`/subscriptions/user/${userId}`);
      const subscriptions = Array.isArray(response) ? response : [response];
      console.log('Fetched subscriptions:', subscriptions); // Debug log
      // Map backend fields to frontend display fields
      return subscriptions.map(sub => ({
        id: sub.id,
        subscriptionType: sub.subscriptionType,
        courtType: COURT_DISPLAY_MAP[sub.courtLevel] || sub.courtLevel,
        state: sub.state,
        district: sub.district,
        courtComplex: sub.courtComplex,
        courtName: sub.courtName,
        caseType: sub.caseType,
        caseNo: sub.caseNo,
        caseYear: sub.caseYear,
        advocateName: sub.advocateName,
        litigantName: sub.litigantName,
        status: sub.status || 'active'
      }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw new Error(error.message || 'Failed to fetch subscriptions');
    }
  }

  static async deleteSubscription(subscriptionId) {
    try {
      return await request(`/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to delete subscription');
    }
  }

  // Enhanced validation
  static validateForm(courtType, formData, mode) {
    const errors = [];
    
    if (!courtType) errors.push("Please select a court type");
    if (!formData.caseNo) errors.push("Case number is required"); // Fixed: caseNo
    
    // Validate location fields based on court type
    if (courtType === "District / Taluk Court") {
      if (!formData.state) errors.push("State is required for District/Taluk courts");
      if (!formData.district) errors.push("District is required for District/Taluk courts");
      if (!formData.courtComplex) errors.push("Court complex is required for District/Taluk courts");
      if (!formData.courtName) errors.push("Court name is required for District/Taluk courts");
    } else if (courtType === "High Court") {
      if (!formData.state) errors.push("State is required for High Court");
    }
    
    if (mode === "litigant" && !formData.litigantName) {
      errors.push("Litigant name is required");
    }
    
    if (mode === "dataset") {
      if (!formData.caseType) errors.push("Case type is required");
      if (!formData.caseYear) errors.push("Case year is required");
    }
    
    return errors;
  }
}

export default SubscriptionService;