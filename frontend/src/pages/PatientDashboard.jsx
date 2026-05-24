import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AppointmentModal from '../components/AppointmentModal';
import { 
  Bell, 
  Settings, 
  Plus, 
  Search, 
  HelpCircle, 
  Layout, 
  Calendar,
  User, 
  FileText, 
  Activity,
  Heart,
  TrendingUp,
  Clock,
  QrCode,
  CheckCircle,
  XCircle,
  UserCheck,
  Download
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, token, logout, setUser } = useAuth();
  const { showNotification } = useNotification();

  // Tab mapping: overview=Dashboard, profile=Patient, history=Appointment, records=Report
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New features states
  const [layoutDensity, setLayoutDensity] = useState('spacious');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Support ticket form states
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState('General Help');
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  // Patient Profile Editing States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileAge, setProfileAge] = useState('');
  const [profileGender, setProfileGender] = useState('Male');
  const [profileContact, setProfileContact] = useState('');
  const [profileBloodGroup, setProfileBloodGroup] = useState('Unknown');
  const [profileAllergies, setProfileAllergies] = useState('');
  const [profileEmergencyName, setProfileEmergencyName] = useState('');
  const [profileEmergencyPhone, setProfileEmergencyPhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileHeight, setProfileHeight] = useState('');
  const [profileWeight, setProfileWeight] = useState('');
  const [profileHistory, setProfileHistory] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Synchronize profile data on user state load
  useEffect(() => {
    if (user?.profile) {
      setProfileAge(user.profile.age || '');
      setProfileGender(user.profile.gender || 'Male');
      setProfileContact(user.profile.contactNumber || '');
      setProfileBloodGroup(user.profile.bloodGroup || 'Unknown');
      setProfileAllergies(user.profile.allergies?.join(', ') || '');
      setProfileEmergencyName(user.profile.emergencyContactName || '');
      setProfileEmergencyPhone(user.profile.emergencyContactPhone || '');
      setProfileAddress(user.profile.address || '');
      setProfileHeight(user.profile.height || '');
      setProfileWeight(user.profile.weight || '');
      setProfileHistory(user.profile.medicalHistory?.join(', ') || '');
    }
  }, [user]);

  // Submit profile details to the API
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: profileAge,
          gender: profileGender,
          contactNumber: profileContact,
          bloodGroup: profileBloodGroup,
          allergies: profileAllergies,
          emergencyContactName: profileEmergencyName,
          emergencyContactPhone: profileEmergencyPhone,
          address: profileAddress,
          height: profileHeight,
          weight: profileWeight,
          medicalHistory: profileHistory
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prevUser => ({
          ...prevUser,
          profile: data.user.profile
        }));
        showNotification('Patient demographic and clinical details updated successfully!', 'success');
        setIsEditingProfile(false);
      } else {
        showNotification(data.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showNotification('Server connection issue. Could not save profile changes.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadPdf = (rec) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      showNotification('Popup blocked. Please allow popups for downloading PDF records.', 'error');
      return;
    }
    
    const htmlContent = `
      <html>
        <head>
          <title>MediSync Clinical Report - ${rec.diagnosis}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #2563eb;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .title-badge {
              background-color: rgba(37, 99, 235, 0.1);
              color: #2563eb;
              font-size: 12px;
              font-weight: 800;
              padding: 6px 12px;
              border-radius: 12px;
              text-transform: uppercase;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 30px;
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .meta-item {
              font-size: 14px;
            }
            .meta-label {
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              font-size: 11px;
              display: block;
              margin-bottom: 4px;
            }
            .meta-value {
              font-weight: 600;
              color: #0f172a;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 800;
              color: #475569;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 12px;
              letter-spacing: 0.05em;
            }
            .section-content {
              font-size: 15px;
              color: #1e293b;
              margin: 0;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              font-size: 12px;
              color: #64748b;
              text-align: center;
            }
            .signature-area {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              font-size: 14px;
            }
            .signature-line {
              border-top: 1px dashed #cbd5e1;
              width: 200px;
              text-align: center;
              padding-top: 8px;
              margin-top: 40px;
              color: #64748b;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #2563eb; margin-right: 8px; vertical-align: middle;">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              MediSync EMR Portal
            </div>
            <div class="title-badge">Clinical Record</div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Patient Name</span>
              <span class="meta-value">${user?.name || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date of Consultation</span>
              <span class="meta-value">${new Date(rec.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Attending Clinician</span>
              <span class="meta-value">Dr. ${rec.doctor?.name || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Primary Diagnosis</span>
              <span class="meta-value" style="color: #2563eb;">${rec.diagnosis || 'N/A'}</span>
            </div>
          </div>

          ${rec.symptoms ? `
            <div class="section">
              <div class="section-title">Symptoms & Clinical Presentation</div>
              <p class="section-content">${rec.symptoms}</p>
            </div>
          ` : ''}

          ${rec.prescription ? `
            <div class="section">
              <div class="section-title">Prescriptions & Dosage Regimen</div>
              <p class="section-content" style="color: #10b981; font-weight: 600;">${rec.prescription}</p>
            </div>
          ` : ''}

          ${rec.treatmentPlan ? `
            <div class="section">
              <div class="section-title">Treatment Plan & Medical Advice</div>
              <p class="section-content">${rec.treatmentPlan}</p>
            </div>
          ` : ''}

          <div class="signature-area">
            <div>
              <div class="signature-line">Patient Signature</div>
            </div>
            <div>
              <div class="signature-line">Attending Clinician Signature</div>
            </div>
          </div>

          <div class="footer">
            <p>This is a secure electronic health record generated by the MediSync Clinical Care Portal.</p>
            <p>&copy; ${new Date().getFullYear()} MediSync Inc. All rights reserved.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Notifications state
  const [notificationsList, setNotificationsList] = useState([]);

  // Theme color preset selection
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('medisync-theme-color') || '#2563eb';
  });

  // Apply theme color selection to custom CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', themeColor);
    // Apply 10% opacity for glow variant
    const glowColor = themeColor.startsWith('#') 
      ? `rgba(${parseInt(themeColor.slice(1, 3), 16)}, ${parseInt(themeColor.slice(3, 5), 16)}, ${parseInt(themeColor.slice(5, 7), 16)}, 0.1)`
      : 'rgba(37, 99, 235, 0.1)';
    document.documentElement.style.setProperty('--primary-glow', glowColor);
    localStorage.setItem('medisync-theme-color', themeColor);
  }, [themeColor]);

  // Dynamically compile notifications list from live patient records
  useEffect(() => {
    const list = [
      { id: 'welcome', text: 'Welcome to MediSync! Your clinical folder is active and secure.', time: 'System Initialized', type: 'system' }
    ];
    
    // Add pending appointments
    appointments.filter(a => a.status === 'pending').forEach((a) => {
      list.push({
        id: `pending-${a._id}`,
        text: `Appointment request with Dr. ${a.doctor?.name || 'Practitioner'} is pending confirmation.`,
        time: new Date(a.createdAt || Date.now()).toLocaleDateString(),
        type: 'appointment'
      });
    });

    // Add confirmed appointments
    appointments.filter(a => a.status === 'confirmed').forEach((a) => {
      list.push({
        id: `confirmed-${a._id}`,
        text: `Confirmed appointment with Dr. ${a.doctor?.name || 'Practitioner'} for ${a.day} at ${a.timeRange}.`,
        time: 'Scheduled',
        type: 'confirmed'
      });
    });

    // Add medical records upload notifications
    medicalRecords.slice(0, 3).forEach((r) => {
      list.push({
        id: `record-${r._id}`,
        text: `New Electronic Health Report uploaded for Diagnosis: "${r.diagnosis}".`,
        time: new Date(r.createdAt || Date.now()).toLocaleDateString(),
        type: 'record'
      });
    });

    setNotificationsList(list);
  }, [appointments, medicalRecords]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      showNotification('Failed to retrieve appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(`${API_URL}/records/my-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMedicalRecords(data.records);
      }
    } catch (err) {
      showNotification('Failed to retrieve EMR logs', 'error');
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/doctor/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      // Fail silently for secondary clinician info widgets
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchMedicalRecords();
    fetchDoctors();
  }, [token]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Appointment cancelled successfully', 'success');
        fetchAppointments();
      } else {
        showNotification(data.message || 'Failed to cancel appointment', 'error');
      }
    } catch (err) {
      showNotification('Error processing cancellation request', 'error');
    }
  };

  // Compute stats
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  // Upcoming confirmed consultation
  const upcomingAppointment = appointments
    .filter(a => a.status === 'confirmed' && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  // Get unique doctors from patient's appointments
  const myDoctorsMap = {};
  appointments.forEach(apt => {
    if (apt.doctor && apt.doctor._id) {
      myDoctorsMap[apt.doctor._id] = apt.doctor;
    }
  });
  const myDoctors = Object.values(myDoctorsMap);

  // Compute monthly stats for the last 6 months based on medical records
  const getMonthlyStats = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      last6Months.push({ monthIndex: m, name: months[m], count: 0 });
    }
    
    medicalRecords.forEach(rec => {
      const date = new Date(rec.createdAt);
      const monthIdx = date.getMonth();
      const bucket = last6Months.find(b => b.monthIndex === monthIdx);
      if (bucket) {
        bucket.count += 1;
      }
    });
    return last6Months;
  };
  const monthlyStats = getMonthlyStats();
  const maxCount = Math.max(...monthlyStats.map(s => s.count), 1);

  const getPersonalizedAdvice = () => {
    const history = user?.profile?.medicalHistory || [];
    if (history.includes('Hypertension')) {
      return {
        title: 'Hypertension Care Plan',
        text: 'Reduce sodium intake (< 1,500mg/day), monitor BP daily, and maintain a light daily walking routine.',
        badge: 'Hypertension'
      };
    }
    if (history.includes('Diabetes')) {
      return {
        title: 'Diabetes Wellness Advice',
        text: 'Limit refined sugars and carbs, monitor blood glucose levels regularly, and stay active.',
        badge: 'Diabetes'
      };
    }
    return {
      title: 'Daily Wellness Recommendation',
      text: 'Stay hydrated, aim for 7-8 hours of sleep, and schedule routine clinical checkups.',
      badge: 'General Care'
    };
  };
  const advice = getPersonalizedAdvice();

  const getBmiDetails = () => {
    const h = Number(user?.profile?.height);
    const w = Number(user?.profile?.weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    let status = 'Normal weight';
    let color = 'var(--success-color)';
    let bg = 'rgba(16, 185, 129, 0.1)';
    if (bmi < 18.5) {
      status = 'Underweight';
      color = '#eab308';
      bg = 'rgba(234, 179, 8, 0.1)';
    } else if (bmi >= 25 && bmi < 30) {
      status = 'Overweight';
      color = '#f97316';
      bg = 'rgba(249, 115, 22, 0.1)';
    } else if (bmi >= 30) {
      status = 'Obese';
      color = 'var(--error-color)';
      bg = 'rgba(239, 68, 68, 0.1)';
    }
    return { bmi, status, color, bg };
  };

  const getCardStyle = (extraStyles = {}) => {
    return {
      padding: layoutDensity === 'compact' ? '0.8rem 1rem' : '1.25rem 1.5rem',
      minHeight: layoutDensity === 'compact' ? '120px' : '180px',
      transition: 'all 0.2s ease-in-out',
      ...extraStyles
    };
  };

  return (
    <div className="dashboard-frame">
      {/* 1. Navbar Clean - Exactly matching layout headers */}
      <nav className="navbar-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={32} style={{ color: 'var(--primary-color)' }} />
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Medi<span style={{ color: 'var(--primary-color)' }}>Sync</span>
          </span>
        </div>

        {/* Center Pill Navigation */}
        <div className="nav-pill-container">
          <button 
            className={`nav-pill ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-pill ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Patient
          </button>
          <button 
            className={`nav-pill ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Appointment
          </button>
          <button 
            className={`nav-pill ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            Report
          </button>
        </div>

        {/* Right side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="btn-pill" 
            style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Dashboard Preferences"
          >
            <Settings size={18} />
          </button>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-pill" 
              style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Recent Notifications"
            >
              <Bell size={18} />
              {notificationsList.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '50%'
                }} />
              )}
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '42px',
                right: '0px',
                width: '320px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                padding: '1rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Recent Notifications</span>
                  <span 
                    onClick={() => setShowNotifications(false)} 
                    style={{ fontSize: '0.75rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Close
                  </span>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notificationsList.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '1rem 0', textAlign: 'center' }}>No notifications found.</p>
                  ) : (
                    notificationsList.map(n => (
                      <div key={n.id} style={{ padding: '0.65rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.78rem', margin: '0 0 0.25rem 0', fontWeight: 500, lineHeight: 1.3, color: 'var(--text-primary)' }}>{n.text}</p>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={logout} 
            className="btn-pill" 
            style={{ fontWeight: 700, borderColor: 'rgba(239, 68, 68, 0.25)', color: 'var(--error-color)' }}
            title="Log Out of Portal"
          >
            Exit Portal
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
            </div>
          </div>
        </div>
      </nav>

      {/* Main body wrapper */}
      <div className="page-container" style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'overview' ? (
          <>
            {/* Subheader Greeting and Action row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '-0.02em', margin: 0 }}>
                  Good Morning, {user?.name?.split(' ')[0] || 'Selena'}!
                </h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => setShowSearchModal(true)} 
                  className="btn-pill"
                  title="Search Doctors or Records"
                >
                  <Search size={14} /> Search
                </button>
                <button 
                  onClick={() => setShowSupportModal(true)} 
                  className="btn-pill"
                  title="MediSync Customer Care"
                >
                  <HelpCircle size={14} /> Support
                </button>
                <button 
                  onClick={() => {
                    const nextDensity = layoutDensity === 'spacious' ? 'compact' : 'spacious';
                    setLayoutDensity(nextDensity);
                    showNotification(`Switched dashboard layout to ${nextDensity} mode.`, 'success');
                  }} 
                  className={`btn-pill ${layoutDensity === 'compact' ? 'active' : ''}`}
                  style={{
                    backgroundColor: layoutDensity === 'compact' ? 'var(--primary-glow)' : 'transparent',
                    color: layoutDensity === 'compact' ? 'var(--primary-color)' : 'var(--text-primary)',
                    borderColor: layoutDensity === 'compact' ? 'var(--primary-color)' : 'var(--border-color)',
                  }}
                  title="Toggle Display Density"
                >
                  <Layout size={14} /> {layoutDensity === 'spacious' ? 'Compact' : 'Spacious'} Layout
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn-pill btn-pill-primary"
                >
                  <Plus size={14} /> Book Visit
                </button>
              </div>
            </div>

            {/* Row 1 Grid: [Health Report Pending] [News Card] [Health Trend] [Checkup progress] */}
            <div className="youcare-grid">
              
              {/* 1. Clinical Health Reports */}
              <div className="youcare-card" onClick={() => setActiveTab('records')} style={getCardStyle({ cursor: 'pointer' })}>
                <div className="youcare-card-header">
                  <span className="youcare-card-title" style={{ fontSize: '0.95rem', fontWeight: 800 }}>Clinical Health Reports</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', backgroundColor: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '4px' }}>View All</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{medicalRecords.length}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Finalized Reports</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    {appointments.filter(a => a.status === 'confirmed').length} Active Visits
                  </span>
                  <span style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    {appointments.filter(a => a.status === 'pending').length} Pending
                  </span>
                </div>
                {/* Latest Diagnostic Entry Preview */}
                <div style={{ 
                  marginTop: '0.8rem', 
                  padding: '0.6rem 0.8rem', 
                  backgroundColor: 'var(--bg-tertiary)', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  textAlign: 'left'
                }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Latest Diagnosis
                  </span>
                  {medicalRecords.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {medicalRecords[0].diagnosis}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                          {new Date(medicalRecords[0].createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                        Dr. {medicalRecords[0].doctor?.name || 'Practitioner'}
                      </p>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No EMR reports logged yet.
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Today's Info News (Solid Blue Card) */}
              <div className="youcare-card" style={getCardStyle({ 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
              })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Heart size={16} fill="white" stroke="none" />
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    padding: '3px 10px', 
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {upcomingAppointment ? 'Upcoming Visit' : advice.badge}
                  </span>
                </div>
                
                <div style={{ marginTop: '0.8rem', marginBottom: '0.8rem', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
                    {upcomingAppointment ? 'Next Consultation' : advice.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.95, lineHeight: '1.4', fontWeight: 500 }}>
                    {upcomingAppointment ? (
                      `You have a confirmed visit scheduled with Dr. ${upcomingAppointment.doctor?.name || 'Practitioner'} on ${new Date(upcomingAppointment.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})} at ${upcomingAppointment.timeSlot}.`
                    ) : (
                      advice.text
                    )}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ height: '3px', flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '2px' }} />
                  <div style={{ height: '3px', flex: 1, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                  <div style={{ height: '3px', flex: 1, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                </div>
              </div>

              {/* 3. Health Trend Chart */}
              <div className="youcare-card" onClick={() => setActiveTab('history')} style={getCardStyle({ cursor: 'pointer' })}>
                <div className="youcare-card-header">
                  <span className="youcare-card-title">Completed Consultations</span>
                  <span style={{ color: 'var(--text-muted)' }}>...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    {appointments.filter(a => a.status === 'completed').length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    / {appointments.length} Total Visits
                  </span>
                </div>
                {/* Upward trending sparkline SVG */}
                <div style={{ height: '70px', marginTop: '0.5rem' }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,28 L20,24 L40,16 L60,18 L80,8 L100,4" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" />
                    <path d="M0,28 L20,24 L40,16 L60,18 L80,8 L100,4 L100,30 L0,30 Z" fill="url(#blue-gradient)" opacity="0.06" />
                    <defs>
                      <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary-color)" />
                        <stop offset="100%" stopColor="white" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* 4. Checkup progress */}
              <div className="youcare-card" onClick={() => setActiveTab('history')} style={getCardStyle({ cursor: 'pointer' })}>
                <div className="youcare-card-header">
                  <span className="youcare-card-title">Checkup Progress</span>
                  <span style={{ color: 'var(--text-muted)' }}>...</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {appointments.slice(0, 2).map((apt, idx) => (
                    <div key={apt._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        <span>Dr. {apt.doctor?.name || 'Doctor'} ({new Date(apt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})})</span>
                        <span style={{ 
                          textTransform: 'capitalize', 
                          color: apt.status === 'completed' ? 'var(--success-color)' : apt.status === 'confirmed' ? 'var(--info-color)' : apt.status === 'cancelled' ? 'var(--error-color)' : 'var(--warning-color)' 
                        }}>{apt.status}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ 
                          width: apt.status === 'completed' ? '100%' : apt.status === 'confirmed' ? '70%' : '25%',
                          backgroundColor: apt.status === 'completed' ? 'var(--success-color)' : apt.status === 'confirmed' ? 'var(--info-color)' : apt.status === 'cancelled' ? 'var(--error-color)' : 'var(--warning-color)'
                        }} />
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                          <span>No consultations scheduled</span>
                          <span>0%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: '0%' }} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Row 2 Grid: [Medical Information] [Patient health report (Bars)] [My Doctor list] */}
            <div className="youcare-grid-bottom">

              {/* 5. Medical Information */}
              <div className="youcare-card" onClick={() => setActiveTab('profile')} style={getCardStyle({ cursor: 'pointer' })}>
                <div className="youcare-card-header">
                  <span className="youcare-card-title">Medical Information</span>
                  <span 
                    onClick={() => setActiveTab('profile')}
                    style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', cursor: 'pointer' }}
                  >See Details</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.9rem', marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-glow)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      <User size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{user?.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patient ({user?.profile?.gender || 'N/A'})</span>
                    </div>
                  </div>
                  
                  {/* Styled QR Code Mockup */}
                  <div style={{ color: 'var(--text-primary)', opacity: 0.8 }} title="Clinical Identification Token">
                    <QrCode size={40} strokeWidth={1.5} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', textAlign: 'left' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Medical History</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user?.profile?.medicalHistory?.join(', ') || 'No chronic history'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Latest Prescription</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '140px' }} title={medicalRecords[0]?.prescription}>
                      {medicalRecords[0]?.prescription || 'No active prescriptions'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Allergies</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No allergies present</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Primary Physician</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {myDoctors[0]?.name ? `Dr. ${myDoctors[0].name}` : (doctors[0]?.user?.name ? `Dr. ${doctors[0].user.name}` : 'Not assigned')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Patient health report (Bar chart) */}
              <div className="youcare-card" onClick={() => setActiveTab('records')} style={getCardStyle({ cursor: 'pointer' })}>
                <div className="youcare-card-header">
                  <span className="youcare-card-title">Monthly Health Reports</span>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} /> Normal
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} /> Logged
                    </span>
                  </div>
                </div>

                {/* Vertical Bar Chart */}
                <div style={{ 
                  height: '115px', 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-between', 
                  paddingTop: '0.5rem',
                  borderBottom: '1px dashed var(--border-color)'
                }}>
                  {monthlyStats.map((stat, idx) => {
                    const heightPercent = stat.count > 0 ? (stat.count / maxCount) * 80 : 10;
                    const hasData = stat.count > 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14%' }} title={`${stat.count} reports in ${stat.name}`}>
                        <div style={{ 
                          width: '18px', 
                          height: `${heightPercent}px`, 
                          background: hasData ? 'linear-gradient(to top, var(--primary-color), #60a5fa)' : '#e2e8f0', 
                          borderRadius: '4px',
                          transition: 'height 0.3s ease'
                        }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7. My Doctor List */}
              <div className="youcare-card" style={getCardStyle()}>
                <div className="youcare-card-header">
                  <span className="youcare-card-title">My Doctors</span>
                  <span 
                    onClick={() => setIsModalOpen(true)}
                    style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', cursor: 'pointer' }}
                  >Book Appointment</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {myDoctors.slice(0, 3).map((doc) => (
                    <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-glow)',
                        color: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {doc.name ? doc.name[0] : 'D'}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dr. {doc.name}</h5>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.profile?.specialization || 'General Practitioner'} • MediSync</span>
                      </div>
                    </div>
                  ))}
                  {myDoctors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No consultations scheduled yet.</p>
                      <span 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', cursor: 'pointer', display: 'inline-block', marginTop: '0.5rem' }}
                      >
                        Find a doctor &rarr;
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : activeTab === 'profile' ? (
          /* Profile Details (Patient Tab) */
          <div className="youcare-card" style={{ maxWidth: '750px', margin: '0 auto', width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>
                  Personal Demographic & Health Folder
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Manage emergency details, clinical stats, and chronic health info.
                </p>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn-pill btn-pill-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                >
                  Edit Demographics
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Age (Years) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="150"
                      value={profileAge}
                      onChange={(e) => setProfileAge(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Biological Sex *</label>
                    <select
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Blood Group</label>
                    <select
                      value={profileBloodGroup}
                      onChange={(e) => setProfileBloodGroup(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Height (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={profileHeight}
                      onChange={(e) => setProfileHeight(e.target.value)}
                      placeholder="e.g. 175"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={profileWeight}
                      onChange={(e) => setProfileWeight(e.target.value)}
                      placeholder="e.g. 70"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={profileContact}
                      onChange={(e) => setProfileContact(e.target.value)}
                      placeholder="Phone number"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Residential Address</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Street, City, State"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={profileEmergencyName}
                      onChange={(e) => setProfileEmergencyName(e.target.value)}
                      placeholder="Relative name"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={profileEmergencyPhone}
                      onChange={(e) => setProfileEmergencyPhone(e.target.value)}
                      placeholder="Relative phone number"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={profileAllergies}
                    onChange={(e) => setProfileAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Medical Diagnoses / History (comma-separated)</label>
                  <input
                    type="text"
                    value={profileHistory}
                    onChange={(e) => setProfileHistory(e.target.value)}
                    placeholder="e.g. Asthma, Hypertension"
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    {savingProfile ? 'Saving...' : 'Save Demographics'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                
                {/* Section 1: Demographics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Full Name</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Registered Email</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.email}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Contact Phone</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profile?.contactNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Section 2: Clinical Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Age</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profile?.age || 'N/A'} Years Old</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Biological Sex</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profile?.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Blood Group</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      backgroundColor: 'var(--primary-glow)', 
                      color: 'var(--primary-color)', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '2px'
                    }}>
                      {user?.profile?.bloodGroup || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Section 3: Physical Stats & Calculated BMI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Height</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profile?.height ? `${user.profile.height} cm` : 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Weight</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profile?.weight ? `${user.profile.weight} kg` : 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Calculated Body Mass Index (BMI)</span>
                    {getBmiDetails() ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{getBmiDetails().bmi}</span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          color: getBmiDetails().color, 
                          backgroundColor: getBmiDetails().bg, 
                          padding: '2px 8px', 
                          borderRadius: '4px' 
                        }}>
                          {getBmiDetails().status}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Please specify height & weight to calculate BMI.</span>
                    )}
                  </div>
                </div>

                {/* Section 4: Emergency Contacts & Residential Address */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Residential Address</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.profile?.address || 'No address logged'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Emergency Contact</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                      {user?.profile?.emergencyContactName || 'N/A'}
                    </span>
                    {user?.profile?.emergencyContactPhone && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Phone: {user.profile.emergencyContactPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 5: Clinical Safety / Allergies */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Allergies & Contraindications</span>
                  {user?.profile?.allergies && user.profile.allergies.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {user.profile.allergies.map((item, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                            color: 'var(--error-color)', 
                            fontSize: '0.75rem', 
                            padding: '4px 10px', 
                            borderRadius: '6px',
                            fontWeight: 800
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No known drug/food allergies logged.</span>
                  )}
                </div>

                {/* Section 6: Medical Diagnoses & Chronic History */}
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Chronic Conditions & Diagnoses</span>
                  {user?.profile?.medicalHistory && user.profile.medicalHistory.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {user.profile.medicalHistory.map((item, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            backgroundColor: 'var(--primary-glow)', 
                            color: 'var(--primary-color)', 
                            fontSize: '0.75rem', 
                            padding: '4px 10px', 
                            borderRadius: '6px',
                            fontWeight: 800
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No chronic conditions logged.</span>
                  )}
                </div>

              </div>
            )}
          </div>
        ) : activeTab === 'records' ? (
          /* Report EMR tab */
          <div className="youcare-card" style={{ width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Clinical Medical Reports (EMR)</h3>
            
            {loadingRecords ? (
              <p style={{ color: 'var(--text-muted)' }}>Querying patient record logs...</p>
            ) : medicalRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600 }}>No EMR reports available yet.</p>
                <p style={{ fontSize: '0.8rem' }}>EMR logs will appear automatically once a doctor completes your appointment consultation.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {medicalRecords.map((rec) => (
                  <div 
                    key={rec._id} 
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      borderLeft: '5px solid var(--primary-color)',
                      borderRadius: 'var(--radius-md)', 
                      padding: '1.5rem',
                      backgroundColor: '#ffffff',
                      boxShadow: 'var(--shadow)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          color: 'var(--primary-color)', 
                          backgroundColor: 'var(--primary-glow)', 
                          padding: '3px 10px', 
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Diagnosis
                        </span>
                        <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '6px' }}>{rec.diagnosis}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                          Consultant: <strong>Dr. {rec.doctor?.name}</strong>
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {new Date(rec.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => handleDownloadPdf(rec)}
                          style={{ 
                            padding: '0.35rem 0.85rem', 
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
                            border: 'none',
                            borderRadius: '20px',
                            color: '#ffffff',
                            backgroundColor: 'var(--primary-color)',
                            transition: 'transform 0.1s ease'
                          }}
                          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Download size={13} />
                          Download PDF
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.85rem' }}>
                      {rec.symptoms && (
                        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '4px', letterSpacing: '0.03em' }}>Symptoms Reported</span>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4 }}>{rec.symptoms}</p>
                        </div>
                      )}
                      {rec.prescription && (
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.04)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                          <span style={{ fontWeight: 800, color: 'var(--success-color)', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '4px', letterSpacing: '0.03em' }}>Prescriptions</span>
                          <p style={{ color: 'var(--success-color)', fontWeight: 700, lineHeight: 1.4 }}>{rec.prescription}</p>
                        </div>
                      )}
                      {rec.treatmentPlan && (
                        <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.02)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.05)' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary-color)', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '4px', letterSpacing: '0.03em' }}>Treatment & Advice</span>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4 }}>{rec.treatmentPlan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Historical log list (Appointment tab) */
          <div className="youcare-card" style={{ width: '100%' }}>
            <div className="youcare-card-header">
              <span className="youcare-card-title">Appointments Record History</span>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-pill btn-pill-primary"
              >
                <Plus size={14} strokeWidth={2.5} /> Book Appointment
              </button>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Querying scheduler logs...</p>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600 }}>No consultations scheduled yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt._id}>
                        <td style={{ fontWeight: 700 }}>Dr. {apt.doctor?.name}</td>
                        <td>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td>{apt.timeSlot}</td>
                        <td>
                          <span className={`badge badge-${apt.status}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {apt.notes || '-'}
                        </td>
                        <td>
                          {(apt.status === 'pending' || apt.status === 'confirmed') ? (
                            <button
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAppointments} 
      />

      {/* Settings / Preferences Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', position: 'relative', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Settings size={20} style={{ color: 'var(--primary-color)' }} />
              <span>Dashboard Preferences</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Choose Accent Theme
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { name: 'Classic Blue', color: '#2563eb' },
                    { name: 'Emerald Green', color: '#10b981' },
                    { name: 'Violet Purple', color: '#8b5cf6' },
                    { name: 'Sunset Coral', color: '#f97316' }
                  ].map(preset => (
                    <button
                      key={preset.color}
                      onClick={() => {
                        setThemeColor(preset.color);
                        showNotification(`Theme color preset changed to ${preset.name}!`, 'success');
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: preset.color,
                        border: themeColor === preset.color ? '3px solid var(--text-primary)' : 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  System Notification Channels
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Real-time Desktop Banners</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input type="checkbox" defaultChecked />
                    <span>SMS Consultation Confirmations</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Interface Options
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input 
                    type="checkbox" 
                    checked={layoutDensity === 'compact'} 
                    onChange={(e) => {
                      setLayoutDensity(e.target.checked ? 'compact' : 'spacious');
                      showNotification(`Switched dashboard layout to ${e.target.checked ? 'compact' : 'spacious'} mode.`, 'success');
                    }}
                  />
                  <span>Compact Cards View</span>
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Search size={20} style={{ color: 'var(--primary-color)' }} />
              <span>Portal Global Search</span>
            </h3>
            
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, medical specialties, diagnoses..."
              className="form-input"
              style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}
            />
            
            <div style={{ overflowY: 'auto', flexGrow: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Doctors Search Results */}
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Doctors
                </h4>
                {doctors.filter(d => 
                  d.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.25rem 0' }}>No matching clinicians found.</p>
                ) : (
                  doctors.filter(d => 
                    d.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(d => (
                    <div 
                      key={d._id} 
                      onClick={() => {
                        setShowSearchModal(false);
                        setIsModalOpen(true);
                      }}
                      style={{ 
                        padding: '0.65rem', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: '0.4rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>Dr. {d.user?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.specialization} • {d.experience} Years Exp.</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 700 }}>Book Appointment &rarr;</span>
                    </div>
                  ))
                )}
              </div>
              
              {/* EMR Records Search Results */}
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Medical Records
                </h4>
                {medicalRecords.filter(r => 
                  r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.treatmentPlan?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.25rem 0' }}>No matching health records found.</p>
                ) : (
                  medicalRecords.filter(r => 
                    r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.treatmentPlan?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(r => (
                    <div 
                      key={r._id} 
                      onClick={() => {
                        setShowSearchModal(false);
                        setActiveTab('records');
                      }}
                      style={{ 
                        padding: '0.65rem', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        marginBottom: '0.4rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.diagnosis}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        Attending: Dr. {r.doctor?.name} | Rx: {r.prescription || 'N/A'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Close Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <HelpCircle size={20} style={{ color: 'var(--primary-color)' }} />
              <span>MediSync Patient Support Center</span>
            </h3>
            
            <div style={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              {/* FAQ Section */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Frequently Asked Questions (FAQ)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { q: 'How do I download my EMR logs?', a: 'Click the "Report" tab, select your record, and click "Export Record Details" or print the page.' },
                    { q: 'Can I cancel an active appointment?', a: 'Yes. Go to the "Appointment" tab, view your scheduled list, and click "Cancel" on any pending or confirmed visit.' },
                    { q: 'How is my private clinical data secured?', a: 'All data is cryptographically protected and complies with HIPAA and local clinical privacy guidelines.' }
                  ].map((faq, i) => (
                    <details key={i} style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      <summary style={{ fontWeight: 700, cursor: 'pointer', outline: 'none' }}>{faq.q}</summary>
                      <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0.5rem 0 0 0' }}>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
              
              {/* Support ticket submission */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Submit a Support Ticket
                </h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setSubmittingSupport(true);
                  setTimeout(() => {
                    setSubmittingSupport(false);
                    setSupportSubject('');
                    setSupportMessage('');
                    setShowSupportModal(false);
                    showNotification('Support request ticket submitted successfully! Reference ID: #MS-' + Math.floor(1000 + Math.random()*9000), 'success');
                  }, 1000);
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Issue Subject *</label>
                      <input 
                        type="text" 
                        required 
                        value={supportSubject} 
                        onChange={(e) => setSupportSubject(e.target.value)}
                        placeholder="e.g. Cannot view prescription" 
                        className="form-input" 
                        style={{ height: '36px', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</label>
                      <select 
                        className="form-input" 
                        value={supportCategory} 
                        onChange={(e) => setSupportCategory(e.target.value)}
                        style={{ height: '36px', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        <option>EMR / Records</option>
                        <option>Appointments</option>
                        <option>Billing</option>
                        <option>Security / Profile</option>
                        <option>General Help</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Detailed Message *</label>
                    <textarea 
                      required 
                      value={supportMessage} 
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Please explain the issue you are experiencing..." 
                      className="form-input" 
                      style={{ minHeight: '80px', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button 
                      type="button"
                      onClick={() => setShowSupportModal(false)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submittingSupport}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                    >
                      {submittingSupport ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
