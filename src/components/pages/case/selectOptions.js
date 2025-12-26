export const SELECT_OPTIONS = {
    courtTypes: ["High Court", "District / Taluk Court", "Supreme Court"],
    states: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Maharashtra'],
    caseTypes: ["Civil", "Criminal", "Family", "Commercial"],
    districts: {
        'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
        'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
        'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
        'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
        'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal']
    },
    courtComplexes: {
        // Karnataka
        'Bengaluru Urban': ['City Civil Court Complex', 'Magistrate Court Complex', 'Family Court Complex', 'Sessions Court Complex'],
        'Mysuru': ['District Court Complex', 'Magistrate Court Complex', 'Family Court Complex'],
        'Belagavi': ['District Court Complex', 'Civil Court Complex'],
        'Dharwad': ['District Court Complex', 'Civil Court Complex'],
        'Kalaburagi': ['District Court Complex', 'Civil Court Complex'],
        
        // Tamil Nadu
        'Chennai': ['City Civil Court Complex', 'Sessions Court Complex', 'Family Court Complex'],
        'Coimbatore': ['District Court Complex', 'Sessions Court Complex'],
        'Madurai': ['District Court Complex', 'Sessions Court Complex'],
        
        // Maharashtra
        'Mumbai City': ['City Civil and Sessions Court', 'Small Causes Court', 'Family Court'],
        'Pune': ['District Court Complex', 'Sessions Court Complex'],
        'Nagpur': ['District Court Complex', 'Sessions Court Complex'],
        
        // Kerala
        'Thiruvananthapuram': ['District Court Complex', 'Sessions Court Complex'],
        'Kochi': ['District Court Complex', 'Sessions Court Complex'],
        
        // Andhra Pradesh
        'Visakhapatnam': ['District Court Complex', 'Sessions Court Complex'],
        'Vijayawada': ['District Court Complex', 'Sessions Court Complex']
    },
    courtNames: {
        'City Civil Court Complex': ['Principal City Civil Court', 'Additional City Civil Court', 'Small Causes Court'],
        'Magistrate Court Complex': ['Chief Metropolitan Magistrate', 'Additional Chief Metropolitan Magistrate', 'Metropolitan Magistrate'],
        'Family Court Complex': ['Principal Family Court', 'Additional Family Court'],
        'Sessions Court Complex': ['Principal Sessions Court', 'Additional Sessions Court'],
        'District Court Complex': ['Principal District Court', 'Additional District Court', 'Civil Judge Court'],
        'Civil Court Complex': ['Principal Civil Court', 'Additional Civil Court', 'Munsiff Court'],
        'City Civil and Sessions Court': ['Principal City Civil and Sessions Court', 'Additional City Civil and Sessions Court'],
        'Small Causes Court': ['Court of Small Causes']
    }
}