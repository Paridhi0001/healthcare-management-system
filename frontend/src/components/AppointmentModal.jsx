import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Calendar, User2, Clock, AlignLeft, X } from 'lucide-react';

const AppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Fetch doctors list when open
  useEffect(() => {
    if (isOpen) {
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
          showNotification('Failed to load clinic list', 'error');
        }
      };

      fetchDoctors();
      // Reset forms
      setSelectedDoctor('');
      setDate('');
      setTimeSlots([]);
      setSelectedSlot('');
      setNotes('');
    }
  }, [isOpen, token]);

  // Compute available slots based on selected doctor, date, and booked database records
  useEffect(() => {
    if (!selectedDoctor || !date) {
      setTimeSlots([]);
      setSelectedSlot('');
      return;
    }

    const fetchAvailableSlots = async () => {
      setFetchingSlots(true);
      try {
        const docObj = doctors.find(d => d.user?._id === selectedDoctor);
        if (!docObj) return;

        // Resolve day of week
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[new Date(date).getUTCDay()];

        // Find configured availability slots for that day
        const docConfig = docObj.availableSlots?.find(s => s.day === dayOfWeek);
        if (!docConfig || docConfig.timeSlots.length === 0) {
          setTimeSlots([]);
          showNotification(`This doctor has no slots configured on ${dayOfWeek}s`, 'warning');
          setFetchingSlots(false);
          return;
        }

        // Fetch all appointments for doctor and filter out occupied slots
        const res = await fetch(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        let occupiedSlots = [];
        if (data.success) {
          occupiedSlots = data.appointments
            .filter(apt => 
              apt.doctor?._id === selectedDoctor &&
              new Date(apt.date).toDateString() === new Date(date).toDateString() &&
              apt.status !== 'cancelled'
            )
            .map(apt => apt.timeSlot);
        }

        // Filter configured slots by removing occupied ones
        const freeSlots = docConfig.timeSlots.filter(s => !occupiedSlots.includes(s));
        setTimeSlots(freeSlots);
        if (freeSlots.length === 0) {
          showNotification('All slots for this day are fully booked.', 'warning');
        }
      } catch (err) {
        showNotification('Error loading slots availability details', 'error');
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, date, doctors, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !selectedSlot) {
      showNotification('Please fill in all booking parameters', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          date,
          timeSlot: selectedSlot,
          notes
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Appointment requested successfully!', 'success');
        onSuccess();
        onClose();
      } else {
        showNotification(data.message || 'Booking failed', 'error');
      }
    } catch (err) {
      showNotification('Failed to connect to backend api', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Schedule Consultation</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Doctor Selector */}
          <div className="form-group">
            <label className="form-label">Select Practitioner *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              >
                <option value="">-- Choose Practitioner --</option>
                {doctors.map((doc) => (
                  <option key={doc.user?._id} value={doc.user?._id}>
                    Dr. {doc.user?.name} ({doc.specialization}) - ${doc.fees}
                  </option>
                ))}
              </select>
              <User2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Date Selector */}
          <div className="form-group">
            <label className="form-label">Consultation Date *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]} // restrict historical dates
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Calendar size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Available Slots Selector */}
          <div className="form-group">
            <label className="form-label">Available Time Slots *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
                disabled={fetchingSlots || timeSlots.length === 0}
              >
                {fetchingSlots ? (
                  <option>Resolving available slots...</option>
                ) : timeSlots.length === 0 ? (
                  <option value="">-- No available slots configured for this date --</option>
                ) : (
                  <>
                    <option value="">-- Select Time Slot --</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </>
                )}
              </select>
              <Clock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Clinical symptoms/notes */}
          <div className="form-group">
            <label className="form-label">Symptoms / Notes (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cough, checkup visit..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <AlignLeft size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary" 
              style={{ flex: 1, height: '46px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, height: '46px' }}
              disabled={submitting || !selectedSlot}
            >
              <span>{submitting ? 'Scheduling...' : 'Reserve Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
