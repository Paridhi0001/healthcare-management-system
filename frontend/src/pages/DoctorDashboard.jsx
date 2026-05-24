import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  KanbanSquare, 
  CalendarRange, 
  RefreshCw, 
  Save, 
  Trash2, 
  Clock, 
  Check, 
  XCircle, 
  CheckCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, token, setUser } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('kanban');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile states
  const [specialization, setSpecialization] = useState(user?.profile?.specialization || '');
  const [experience, setExperience] = useState(user?.profile?.experience || 0);
  const [fees, setFees] = useState(user?.profile?.fees || 0);
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [availableSlots, setAvailableSlots] = useState(user?.profile?.availableSlots || []);
  const [savingProfile, setSavingProfile] = useState(false);

  // EMR Modal creation states
  const [selectedAptForEMR, setSelectedAptForEMR] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [prescription, setPrescription] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [emrNotes, setEmrNotes] = useState('');
  const [submittingEMR, setSubmittingEMR] = useState(false);

  // Slot states
  const [newDay, setNewDay] = useState('Monday');
  const [newTimeRange, setNewTimeRange] = useState('09:00 - 10:00');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        showNotification(data.message || 'Failed to fetch appointments', 'error');
      }
    } catch (err) {
      showNotification('Failed to retrieve appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  useEffect(() => {
    if (user?.profile) {
      setSpecialization(user.profile.specialization || '');
      setExperience(user.profile.experience || 0);
      setFees(user.profile.fees || 0);
      setBio(user.profile.bio || '');
      setAvailableSlots(user.profile.availableSlots || []);
    }
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    if (newStatus === 'completed') {
      // Find appointment object and trigger EMR Modal instead of direct PUT
      const apt = appointments.find(a => a._id === id);
      setSelectedAptForEMR(apt);
      setDiagnosis('');
      setSymptoms('');
      setPrescription('');
      setTreatmentPlan('');
      setEmrNotes('');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Appointment marked as ${newStatus}`, 'success');
        fetchAppointments();
      } else {
        showNotification(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showNotification('Error updating status', 'error');
    }
  };

  const handleSubmitEMR = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      showNotification('Diagnosis is required to submit EMR', 'warning');
      return;
    }

    setSubmittingEMR(true);
    try {
      const res = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedAptForEMR.patient?._id,
          appointmentId: selectedAptForEMR._id,
          diagnosis,
          symptoms,
          prescription,
          treatmentPlan,
          notes: emrNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Medical record created & Appointment completed!', 'success');
        setSelectedAptForEMR(null);
        fetchAppointments();
      } else {
        showNotification(data.message || 'Failed to submit clinical EMR record', 'error');
      }
    } catch (err) {
      showNotification('Error connecting to clinical database', 'error');
    } finally {
      setSubmittingEMR(false);
    }
  };

  const handleAddSlot = () => {
    const dayIndex = availableSlots.findIndex(item => item.day.toLowerCase() === newDay.toLowerCase());

    if (dayIndex > -1) {
      const existingSlots = availableSlots[dayIndex].timeSlots;
      if (existingSlots.includes(newTimeRange)) {
        showNotification('Slot already configured', 'warning');
        return;
      }
      const updatedSlots = [...availableSlots];
      updatedSlots[dayIndex].timeSlots.push(newTimeRange);
      setAvailableSlots(updatedSlots);
    } else {
      setAvailableSlots([...availableSlots, { day: newDay, timeSlots: [newTimeRange] }]);
    }
    showNotification(`Added slot for ${newDay}`, 'info');
  };

  const handleRemoveSlot = (day, slotToRemove) => {
    const updated = availableSlots.map(item => {
      if (item.day === day) {
        return {
          ...item,
          timeSlots: item.timeSlots.filter(s => s !== slotToRemove)
        };
      }
      return item;
    }).filter(item => item.timeSlots.length > 0);

    setAvailableSlots(updated);
    showNotification('Slot removed from list', 'info');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch(`${API_URL}/doctor/slots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          specialization,
          experience: Number(experience),
          fees: Number(fees),
          bio,
          availableSlots
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Profile updated successfully!', 'success');
        setUser(prev => ({ ...prev, profile: data.profile }));
      } else {
        showNotification(data.message || 'Failed to save details', 'error');
      }
    } catch (err) {
      showNotification('Network database error', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const sidebarTabs = [
    { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare },
    { id: 'availability', label: 'Set Availability', icon: CalendarRange }
  ];

  const columns = {
    pending: appointments.filter(a => a.status === 'pending'),
    confirmed: appointments.filter(a => a.status === 'confirmed'),
    completed: appointments.filter(a => a.status === 'completed'),
    cancelled: appointments.filter(a => a.status === 'cancelled')
  };

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
                Clinic Desk
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                Dr. {user?.name} | Specialization: {user?.profile?.specialization || 'Not configured'}
              </p>
            </div>

            <button 
              onClick={fetchAppointments} 
              className="btn btn-secondary"
              style={{ padding: '0.6rem' }}
              title="Refresh console"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {activeTab === 'kanban' ? (
            <>
              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Updating Kanban records...</p>
              ) : (
                <div className="kanban-board">
                  {/* PENDING */}
                  <div className="kanban-column">
                    <div className="kanban-column-header">
                      <span className="kanban-column-title">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning-color)', display: 'inline-block' }} />
                        Pending Request
                      </span>
                      <span className="kanban-count">{columns.pending.length}</span>
                    </div>
                    <div className="kanban-cards-container">
                      {columns.pending.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>No requests</p>
                      ) : (
                        columns.pending.map(apt => (
                          <div key={apt._id} className="kanban-card">
                            <h4 className="kanban-card-title">{apt.patient?.name || 'Deleted'}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                              <strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Slot:</strong> {apt.timeSlot}
                            </p>
                            {apt.patient?.profile?.age && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Age: {apt.patient.profile.age} | Sex: {apt.patient.profile.gender}
                              </p>
                            )}
                            {apt.notes && (
                              <p style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px' }}>
                                "{apt.notes}"
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                              <button 
                                onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'var(--info-color)' }}
                              >
                                <Check size={12} /> Accept
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                                className="btn btn-danger"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                              >
                                <XCircle size={12} /> Decline
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CONFIRMED */}
                  <div className="kanban-column">
                    <div className="kanban-column-header">
                      <span className="kanban-column-title">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info-color)', display: 'inline-block' }} />
                        Confirmed
                      </span>
                      <span className="kanban-count">{columns.confirmed.length}</span>
                    </div>
                    <div className="kanban-cards-container">
                      {columns.confirmed.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>No bookings</p>
                      ) : (
                        columns.confirmed.map(apt => (
                          <div key={apt._id} className="kanban-card">
                            <h4 className="kanban-card-title">{apt.patient?.name || 'Deleted'}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                              <strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Slot:</strong> {apt.timeSlot}
                            </p>
                            {apt.patient?.profile?.age && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Age: {apt.patient.profile.age} | Sex: {apt.patient.profile.gender}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                              <button 
                                onClick={() => handleUpdateStatus(apt._id, 'completed')}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flex: 1, backgroundColor: 'var(--success-color)' }}
                              >
                                <CheckCircle size={12} /> Complete (EMR)
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                                className="btn btn-danger"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* COMPLETED */}
                  <div className="kanban-column" style={{ opacity: 0.85 }}>
                    <div className="kanban-column-header">
                      <span className="kanban-column-title">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)', display: 'inline-block' }} />
                        Completed (EMR Logged)
                      </span>
                      <span className="kanban-count">{columns.completed.length}</span>
                    </div>
                    <div className="kanban-cards-container">
                      {columns.completed.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>No logs</p>
                      ) : (
                        columns.completed.map(apt => (
                          <div key={apt._id} className="kanban-card">
                            <h4 className="kanban-card-title">{apt.patient?.name || 'Deleted'}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Slot:</strong> {apt.timeSlot}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CANCELLED */}
                  <div className="kanban-column" style={{ opacity: 0.7 }}>
                    <div className="kanban-column-header">
                      <span className="kanban-column-title">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--error-color)', display: 'inline-block' }} />
                        Cancelled
                      </span>
                      <span className="kanban-count">{columns.cancelled.length}</span>
                    </div>
                    <div className="kanban-cards-container">
                      {columns.cancelled.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>No cancellations</p>
                      ) : (
                        columns.cancelled.map(apt => (
                          <div key={apt._id} className="kanban-card">
                            <h4 className="kanban-card-title">{apt.patient?.name || 'Deleted'}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Slot:</strong> {apt.timeSlot}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Availability Panel */
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              {/* Specialization & Bio Form */}
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Professional Profile</h3>
                <form onSubmit={handleSaveProfile} style={{ textAlign: 'left' }}>
                  <div className="form-group">
                    <label className="form-label">Medical Specialty *</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Cardiologist, Dermatologist"
                      className="form-input"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Years of Experience *</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="form-input"
                        required
                        min={0}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Consultation Fees ($) *</label>
                      <input
                        type="number"
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        className="form-input"
                        required
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Professional Biography</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="form-input"
                      rows={4}
                      placeholder="Enter a brief background summary..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', height: '46px' }}
                    disabled={savingProfile}
                  >
                    <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </div>

              {/* Slot Scheduler */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Schedules Configurations</h3>
                
                {/* Creator */}
                <div style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Add Booking Slot</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    
                    <select
                      value={newTimeRange}
                      onChange={(e) => setNewTimeRange(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>

                    <button 
                      onClick={handleAddSlot}
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Slots preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Configured Slots</span>
                  {availableSlots.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>No slots configured. Save profile changes to store them in database.</p>
                  ) : (
                    availableSlots.map(item => (
                      <div key={item.day} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>{item.day}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {item.timeSlots.map(slot => (
                            <span 
                              key={slot} 
                              style={{ 
                                backgroundColor: 'var(--bg-secondary)', 
                                border: '1px solid var(--border-color)', 
                                fontSize: '0.75rem', 
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontWeight: 550
                              }}
                            >
                              <Clock size={10} className="text-secondary" />
                              {slot}
                              <button 
                                onClick={() => handleRemoveSlot(item.day, slot)}
                                style={{ border: 'none', background: 'none', color: 'var(--error-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                              >
                                <Trash2 size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE EMR POPUP MODAL */}
      {selectedAptForEMR && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create Electronic Medical Record (EMR)</h3>
              <button 
                onClick={() => setSelectedAptForEMR(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'left', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <p><strong>Patient Name:</strong> {selectedAptForEMR.patient?.name}</p>
              <p><strong>Consultation Slot:</strong> {new Date(selectedAptForEMR.date).toLocaleDateString()} @ {selectedAptForEMR.timeSlot}</p>
            </div>

            <form onSubmit={handleSubmitEMR} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms Reported</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Dry cough, chest congestion, mild fever"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prescription (Medications & Dosage)</label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg - 1 capsule 3x daily for 7 days"
                  className="form-input"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Treatment Plan / Medical Advice</label>
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="e.g. Drink warm fluids, get absolute bed rest, follow up in 5 days if cough persists"
                  className="form-input"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">General Consultation Notes</label>
                <input
                  type="text"
                  value={emrNotes}
                  onChange={(e) => setEmrNotes(e.target.value)}
                  placeholder="Private doctor observation logs..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedAptForEMR(null)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, height: '44px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, height: '44px', backgroundColor: 'var(--success-color)' }}
                  disabled={submittingEMR}
                >
                  <FileSpreadsheet size={16} />
                  <span>{submittingEMR ? 'Submitting EMR...' : 'Finalize EMR & Complete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
