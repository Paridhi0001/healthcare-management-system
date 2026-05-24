import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  LayoutDashboard, 
  UserSquare2, 
  Users, 
  RefreshCw, 
  UserPlus, 
  Trash2, 
  Activity,
  Plus,
  X,
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Doctor provision form state
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [docFormData, setDocFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    fees: '',
    bio: ''
  });
  const [creatingDoc, setCreatingDoc] = useState(false);

  const handleDocFormChange = (e) => {
    const { name, value } = e.target;
    setDocFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchOverviewStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      showNotification('Failed to fetch administrative statistics', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      showNotification('Failed to load user directory', 'error');
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
      showNotification('Failed to load doctor profiles', 'error');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      showNotification('Failed to load appointments log', 'error');
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const res = await fetch(`${API_URL}/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMedicalRecords(data.records);
      }
    } catch (err) {
      showNotification('Failed to load EMR records logs', 'error');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOverviewStats(),
      fetchUsers(),
      fetchDoctors(),
      fetchAppointments(),
      fetchMedicalRecords()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [token]);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    const { name, email, password, specialization, experience, fees } = docFormData;
    if (!name || !email || !password || !specialization || !experience || !fees) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    setCreatingDoc(true);
    try {
      const res = await fetch(`${API_URL}/admin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...docFormData,
          experience: Number(experience),
          fees: Number(fees)
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Doctor account registered successfully!', 'success');
        setShowDoctorForm(false);
        setDocFormData({
          name: '',
          email: '',
          password: '',
          specialization: '',
          experience: '',
          fees: '',
          bio: ''
        });
        loadAllData();
      } else {
        showNotification(data.message || 'Failed to create doctor account', 'error');
      }
    } catch (err) {
      showNotification('Failed to save profile on database.', 'error');
    } finally {
      setCreatingDoc(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to remove ${name}? This deletes their profiles and appointments.`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Successfully removed ${name}`, 'success');
        loadAllData();
      } else {
        showNotification(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotification('Failed to perform deletion', 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clinical EMR record?')) return;

    try {
      const res = await fetch(`${API_URL}/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Medical record deleted successfully', 'success');
        loadAllData();
      } else {
        showNotification(data.message || 'Failed to delete record', 'error');
      }
    } catch (err) {
      showNotification('Error deleting record', 'error');
    }
  };

  const sidebarTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'doctors', label: 'Manage Doctors', icon: UserSquare2 },
    { id: 'records', label: 'Clinical Records (EMR)', icon: FileText },
    { id: 'users', label: 'Manage Users', icon: Users }
  ];

  return (
    <div className="app-layout">
      <Sidebar tabs={sidebarTabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Navbar />

        <div className="page-container">
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, textAlign: 'left' }}>
                System Console
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                Administrator privileges active. Monitor system health, clinics, and accounts.
              </p>
            </div>

            <button 
              onClick={loadAllData} 
              className="btn btn-secondary"
              style={{ padding: '0.6rem' }}
              title="Reload all logs"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Updating administrative console database...</p>
          ) : activeTab === 'overview' ? (
            /* OVERVIEW */
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>Active Doctors</h3>
                    <p>{stats?.totalDoctors || 0}</p>
                  </div>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-color)' }}>
                    <UserSquare2 size={22} />
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>Active Patients</h3>
                    <p>{stats?.totalPatients || 0}</p>
                  </div>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)' }}>
                    <Users size={22} />
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>Total Consults</h3>
                    <p>{stats?.totalAppointments || 0}</p>
                  </div>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary-color)' }}>
                    <Activity size={22} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Upcoming Consultations</h3>
                  {appointments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No bookings registered in database.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 8).map((apt) => (
                            <tr key={apt._id}>
                              <td style={{ fontWeight: 600 }}>{apt.patient?.name || 'Deleted'}</td>
                              <td>Dr. {apt.doctor?.name || 'Deleted'}</td>
                              <td>{new Date(apt.date).toLocaleDateString()}</td>
                              <td>{apt.timeSlot}</td>
                              <td>
                                <span className={`badge badge-${apt.status}`}>
                                  {apt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Visits Status Ratios</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => {
                      const total = stats.totalAppointments || 1;
                      const percentage = Math.round((count / total) * 100);
                      return (
                        <div key={status}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                            <span>{status}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              backgroundColor: 
                                status === 'completed' ? 'var(--success-color)' :
                                status === 'confirmed' ? 'var(--info-color)' :
                                status === 'pending' ? 'var(--warning-color)' : 'var(--error-color)'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'doctors' ? (
            /* MANAGE DOCTORS */
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Registered Medical Practitioners</h3>
                <button 
                  onClick={() => setShowDoctorForm(!showDoctorForm)} 
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  {showDoctorForm ? <X size={16} /> : <Plus size={16} />}
                  <span>{showDoctorForm ? 'Close Registrar' : 'Add New Doctor'}</span>
                </button>
              </div>

              {showDoctorForm && (
                <div style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '2rem',
                  textAlign: 'left'
                }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Practitioner Registry Form</h4>
                  <form onSubmit={handleCreateDoctor}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={docFormData.name}
                          onChange={handleDocFormChange}
                          placeholder="Dr. Gregory House"
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={docFormData.email}
                          onChange={handleDocFormChange}
                          placeholder="doctorname@gmail.com"
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input
                          type="password"
                          name="password"
                          value={docFormData.password}
                          onChange={handleDocFormChange}
                          placeholder="••••••••"
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Specialization *</label>
                        <input
                          type="text"
                          name="specialization"
                          value={docFormData.specialization}
                          onChange={handleDocFormChange}
                          placeholder="e.g. Neurologist"
                          className="form-input"
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="form-group">
                          <label className="form-label">Exp (Years) *</label>
                          <input
                            type="number"
                            name="experience"
                            value={docFormData.experience}
                            onChange={handleDocFormChange}
                            placeholder="12"
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Fees ($) *</label>
                          <input
                            type="number"
                            name="fees"
                            value={docFormData.fees}
                            onChange={handleDocFormChange}
                            placeholder="150"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Practitioner Bio (Optional)</label>
                      <input
                        type="text"
                        name="bio"
                        value={docFormData.bio}
                        placeholder="Brief summary of professional experience..."
                        className="form-input"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowDoctorForm(false)} 
                        className="btn btn-secondary"
                        style={{ flex: 1, height: '42px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ flex: 1, height: '42px' }}
                        disabled={creatingDoc}
                      >
                        <UserPlus size={16} />
                        <span>{creatingDoc ? 'Provisioning...' : 'Register Practitioner'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {doctors.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No medical profiles registered.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Practitioner</th>
                        <th>Email</th>
                        <th>Specialization</th>
                        <th>Experience</th>
                        <th>Fees</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doc) => (
                        <tr key={doc._id}>
                          <td style={{ fontWeight: 600 }}>Dr. {doc.user?.name || 'Deleted Doctor'}</td>
                          <td>{doc.user?.email || 'N/A'}</td>
                          <td>
                            <span style={{ backgroundColor: 'var(--primary-glow)', border: '1px solid var(--border-color)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary-color)', fontWeight: 600 }}>
                              {doc.specialization}
                            </span>
                          </td>
                          <td>{doc.experience} Years</td>
                          <td>${doc.fees}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteUser(doc.user?._id, `Dr. ${doc.user?.name}`)}
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'records' ? (
            /* EMR RECORDS DIRECTORY */
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Electronic Medical Records System Logs</h3>
              {medicalRecords.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No EMR record entries configured yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Diagnosing Doctor</th>
                        <th>Diagnosis</th>
                        <th>Prescriptions</th>
                        <th>Treatment Advice</th>
                        <th>Logged Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords.map((rec) => (
                        <tr key={rec._id}>
                          <td style={{ fontWeight: 600 }}>{rec.patient?.name || 'Deleted'}</td>
                          <td>Dr. {rec.doctor?.name || 'Deleted'}</td>
                          <td>{rec.diagnosis}</td>
                          <td>{rec.prescription || '-'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {rec.treatmentPlan || '-'}
                          </td>
                          <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteRecord(rec._id)}
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* MANAGE USERS */
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>System User Directory</h3>
              {users.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No records registered in database.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Account Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((usr) => (
                        <tr key={usr._id}>
                          <td style={{ fontWeight: 600 }}>{usr.name}</td>
                          <td>{usr.email}</td>
                          <td>
                            <span className={`badge badge-${usr.role === 'admin' ? 'completed' : usr.role === 'doctor' ? 'confirmed' : 'pending'}`}>
                              {usr.role}
                            </span>
                          </td>
                          <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteUser(usr._id, usr.name)}
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                              disabled={usr.email === 'admin@apexhealth.com'}
                            >
                              Delete
                            </button>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
