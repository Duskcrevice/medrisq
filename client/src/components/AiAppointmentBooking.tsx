import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Sparkles,
  FileSpreadsheet,
  Upload,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Stethoscope,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Send,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuthUser } from "@/contexts/AuthContext";

interface AiAppointmentBookingProps {
  onBookingSuccess?: (appointment: any) => void;
  onCancel?: () => void;
}

export default function AiAppointmentBooking({ onBookingSuccess, onCancel }: AiAppointmentBookingProps) {
  const { currentUser } = useAuthUser();
  const [activeMode, setActiveMode] = useState<"text" | "voice" | "csv" | "screenshot">("text");

  // Input states
  const [textInput, setTextInput] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // CSV state
  const [csvContent, setCsvContent] = useState<string>("");
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [csvResult, setCsvResult] = useState<any | null>(null);

  // Screenshot state
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Interpreted Draft state (for Text, Voice, Screenshot)
  const [draft, setDraft] = useState<any | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<any | null>(null);

  // Custom clarification edits
  const [editReason, setEditReason] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [consultType, setConsultType] = useState<"In-Person Clinic" | "Online Telehealth Video">("In-Person Clinic");

  // tRPC mutations
  const interpretMutation = trpc.aiBooking.interpret.useMutation({
    onSuccess: (data) => {
      setDraft(data);
      setEditReason(data.reason || "General Medical Consultation & Evaluation");
      setEditDate(data.date || new Date(Date.now() + 86400000).toISOString().split("T")[0]);
      setEditTime(data.time || "10:00 AM");
      if (data.isAmbiguous) {
        toast.warning(data.ambiguityReason || "Clarification needed for doctor reference.");
      } else {
        toast.success(`Interpreted booking for ${data.resolvedDoctor?.name || data.doctorName || "Doctor"}`);
      }
    },
    onError: (err) => {
      toast.error(`Interpretation failed: ${err.message}`);
    }
  });

  const validateCsvMutation = trpc.aiBooking.validateCsv.useMutation({
    onSuccess: (data) => {
      setCsvResult(data);
      toast.success(`Processed CSV: ${data.validRows} valid rows, ${data.duplicateRows} duplicates flagged.`);
    },
    onError: (err) => {
      toast.error(`CSV parsing failed: ${err.message}`);
    }
  });

  const confirmBookingMutation = trpc.aiBooking.confirmDemoBooking.useMutation({
    onSuccess: (data) => {
      setConfirmedResult(data);
      toast.success(data.message || `Booking verified with token ${data.token}!`);
      if (onBookingSuccess) {
        onBookingSuccess({
          id: data.token,
          doctor: draft?.resolvedDoctor?.name || draft?.doctorName || "Consulting Clinician",
          specialty: draft?.resolvedDoctor?.specialization || "General Medicine",
          date: editDate,
          time: editTime,
          type: consultType,
          status: "Confirmed",
          reason: editReason,
          wing: draft?.resolvedDoctor?.hospital || "Main OPD Complex",
        });
      }
    },
    onError: (err) => {
      toast.error(`Booking submission failed: ${err.message}`);
    }
  });

  const batchConfirmMutation = trpc.aiBooking.batchConfirmBookings.useMutation({
    onSuccess: (data) => {
      toast.success(`Batch booking executed! ${data.results.filter((r: any) => r.success).length} appointments confirmed.`);
      if (onBookingSuccess) {
        data.results.filter((r: any) => r.success).forEach((r: any) => {
          onBookingSuccess({
            id: r.token,
            doctor: r.appointment?.clinician || "Doctor",
            specialty: "Clinical Outpatient",
            date: r.appointment?.appointmentAt?.split("T")[0] || "2026-10-28",
            time: "10:00 AM",
            type: "In-Person Clinic",
            status: "Confirmed",
            reason: r.appointment?.reason || "CSV Scheduled Appointment",
            wing: "MEDNEXUS Clinical OPD",
          });
        });
      }
    },
    onError: (err) => {
      toast.error(`Batch submission error: ${err.message}`);
    }
  });

  // MediaRecorder + Speech Recognition Handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const startVoiceRecording = async () => {
    setSpeechError(null);
    audioChunksRef.current = [];

    // 1. Initialize MediaRecorder for real audio capture to send to AI
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            interpretMutation.mutate({
              instruction: textInput || "Audio booking instruction",
              modality: "voice",
              audioBase64: base64Audio,
            });
          };
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Microphone listening... Speak in Hindi or English, then click Stop.");
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      let msg = "Microphone access could not be initialized.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Microphone access was denied. Please allow microphone permission in your browser settings.";
      }
      setSpeechError(msg);
      toast.error(msg);
      return;
    }

    // 2. Also try SpeechRecognition for live interim transcript preview if browser supports it
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = voiceLanguage;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTextInput(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        // Non-fatal, MediaRecorder will send raw audio
      }
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // CSV File Handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      validateCsvMutation.mutate({ csvContent: content });
    };
    reader.readAsText(file);
  };

  // Screenshot Upload Handler
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setScreenshotPreview(base64);
      interpretMutation.mutate({
        instruction: "Extract appointment details from uploaded screenshot",
        modality: "screenshot",
        imageBase64: base64
      });
    };
    reader.readAsDataURL(file);
  };

  // Final submission of draft
  const handleConfirmDraft = () => {
    if (!draft) return;
    if (draft.isAmbiguous) {
      toast.error("Please resolve the doctor reference before booking.");
      return;
    }

    const idempotencyKey = `MRQ-AI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    confirmBookingMutation.mutate({
      doctorId: draft.resolvedDoctor?.id,
      doctorName: draft.resolvedDoctor?.name || draft.doctorName,
      hospitalName: draft.resolvedDoctor?.hospital || "MEDNEXUS General Hospital",
      date: editDate,
      time: editTime,
      reason: editReason,
      patientName: currentUser?.name || "Vittika Bairathi",
      idempotencyKey,
    });
  };

  // Batch CSV Confirmation
  const handleConfirmValidCsvRows = () => {
    if (!csvResult || !csvResult.rows) return;
    const validRows = csvResult.rows.filter((r: any) => r.status === "valid");
    if (validRows.length === 0) {
      toast.error("No valid rows available for batch booking.");
      return;
    }

    const bookings = validRows.map((r: any) => ({
      doctorId: r.resolvedDoctor?.id,
      doctorName: r.resolvedDoctor?.name || r.doctorName,
      date: r.date,
      time: r.time,
      reason: r.reason || "CSV Scheduled Appointment",
      patientName: r.patientName || currentUser?.name || "Patient",
      idempotencyKey: `CSV-BATCH-${r.rowNumber}-${Date.now()}`,
    }));

    batchConfirmMutation.mutate({ bookings });
  };

  return (
    <div className="mn-ai-booking-container" style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: "rgba(13, 148, 136, 0.1)", color: "#0d9488", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Sparkles size={14} /> AI APPOINTMENT BOOKING AGENT
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Multilingual Voice &amp; Document Appointment Assistant</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Accepts Hindi &amp; English written instructions, voice recording, batch CSV files, and screenshot slips.
          </p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
            ✕ Close
          </button>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 20 }}>
        <button
          type="button"
          className={`mn-filter-pill-btn ${activeMode === "text" ? "active" : ""}`}
          onClick={() => { setActiveMode("text"); setDraft(null); setConfirmedResult(null); }}
        >
          <FileText size={14} /> Written Text (Hindi / English)
        </button>
        <button
          type="button"
          className={`mn-filter-pill-btn ${activeMode === "voice" ? "active" : ""}`}
          onClick={() => { setActiveMode("voice"); setDraft(null); setConfirmedResult(null); }}
        >
          <Mic size={14} /> Voice Microphone
        </button>
        <button
          type="button"
          className={`mn-filter-pill-btn ${activeMode === "csv" ? "active" : ""}`}
          onClick={() => { setActiveMode("csv"); setDraft(null); setConfirmedResult(null); }}
        >
          <FileSpreadsheet size={14} /> Batch CSV Upload
        </button>
        <button
          type="button"
          className={`mn-filter-pill-btn ${activeMode === "screenshot" ? "active" : ""}`}
          onClick={() => { setActiveMode("screenshot"); setDraft(null); setConfirmedResult(null); }}
        >
          <ImageIcon size={14} /> Screenshot Slip
        </button>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {confirmedResult && (
        <div style={{ padding: 18, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#166534", fontWeight: 800, fontSize: 16 }}>
            <CheckCircle2 size={24} color="#16a34a" />
            <span>Appointment Booked &amp; Authorized! Token: {confirmedResult.token}</span>
          </div>
          <p style={{ margin: "6px 0 12px", fontSize: 13, color: "#15803d" }}>
            {confirmedResult.message || "Your appointment has been securely committed to the authoritative clinical schedule."}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className="mn-btn-submit-green"
              style={{ width: "auto", margin: 0, padding: "8px 18px" }}
              onClick={() => { setConfirmedResult(null); setDraft(null); setTextInput(""); }}
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: WRITTEN INSTRUCTION */}
      {activeMode === "text" && !confirmedResult && (
        <div>
          <div className="mn-form-group">
            <label className="mn-form-label">Type your booking request in Hindi or English</label>
            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Dr Sharma ke saath 28 October ko subah 11 baje appointment book karo, ya Book an appointment with Dr Priya Nair on October 28 at 11 AM"
              className="mn-input-control"
              style={{ padding: 12, resize: "vertical" }}
            />
          </div>

          {/* Quick Example Chips */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Suggested Conversational Examples:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                className="mn-zapia-chip"
                onClick={() => setTextInput("Dr Sharma ke saath 28 October ko subah 11 baje appointment book karo.")}
              >
                🇮🇳 Dr Sharma ke saath 28 October ko subah 11 baje appointment book karo
              </button>
              <button
                type="button"
                className="mn-zapia-chip"
                onClick={() => setTextInput("Book an appointment with Dr Priya Nair on October 28 at 11 AM.")}
              >
                🇬🇧 Book an appointment with Dr Priya Nair on October 28 at 11 AM
              </button>
              <button
                type="button"
                className="mn-zapia-chip"
                onClick={() => setTextInput("Dr Om Mishra ke saath routine BP checkup ke liye book appointment on 28 October 10 am")}
              >
                🌐 Dr Om Mishra ke saath BP checkup on 28 October 10 am
              </button>
            </div>
          </div>

          <button
            type="button"
            className="mn-btn-submit-green"
            disabled={!textInput.trim() || interpretMutation.isPending}
            onClick={() => interpretMutation.mutate({ instruction: textInput, modality: "text" })}
            style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {interpretMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Interpret Instruction
          </button>
        </div>
      )}

      {/* MODE 2: VOICE INSTRUCTION */}
      {activeMode === "voice" && !confirmedResult && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              className={`mn-filter-pill-btn ${voiceLanguage === "hi-IN" ? "active" : ""}`}
              onClick={() => setVoiceLanguage("hi-IN")}
            >
              Hindi (हिन्दी / hi-IN)
            </button>
            <button
              type="button"
              className={`mn-filter-pill-btn ${voiceLanguage === "en-IN" ? "active" : ""}`}
              onClick={() => setVoiceLanguage("en-IN")}
            >
              English (Indian English / en-IN)
            </button>
          </div>

          <div style={{ margin: "20px 0" }}>
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: isRecording ? "#dc2626" : "#0d9488",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                display: "inline-grid",
                placeItems: "center",
                boxShadow: isRecording ? "0 0 0 8px rgba(220, 38, 38, 0.25)" : "0 0 0 8px rgba(13, 148, 136, 0.2)",
                transition: "all 0.2s ease"
              }}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <div style={{ marginTop: 12, fontWeight: 700, fontSize: 14, color: isRecording ? "#dc2626" : "#0f172a" }}>
              {interpretMutation.isPending ? (
                <span style={{ color: "#0d9488", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <RefreshCw className="animate-spin" size={16} /> Transcribing speech &amp; matching clinical slot...
                </span>
              ) : isRecording ? (
                "🔴 Recording audio... Click microphone again when done speaking"
              ) : (
                "Click Microphone to Speak"
              )}
            </div>
            {isRecording && (
              <button
                type="button"
                className="mn-btn-submit-green"
                style={{ width: "auto", margin: "10px auto 0", padding: "6px 16px", background: "#dc2626", borderColor: "#b91c1c" }}
                onClick={stopVoiceRecording}
              >
                Done Speaking (Transcribe &amp; Finalize)
              </button>
            )}
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
              Try: &ldquo;Dr Sharma ke saath 28 October ko subah 11 baje appointment book karo&rdquo;
            </div>
          </div>

          {speechError && (
            <div style={{ maxWidth: 480, margin: "12px auto", padding: 10, borderRadius: 8, background: "#fef2f2", color: "#b91c1c", fontSize: 12 }}>
              <AlertTriangle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
              {speechError}
            </div>
          )}

          {textInput && (
            <div style={{ maxWidth: 540, margin: "16px auto", textAlign: "left", background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Interpreted Speech Transcript:</span>
              <div style={{ fontSize: 13, color: "#0f172a", marginTop: 4 }}>&ldquo;{textInput}&rdquo;</div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: BATCH CSV UPLOAD */}
      {activeMode === "csv" && !confirmedResult && (
        <div>
          <div style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: 24, textAlign: "center", background: "#f8fafc", marginBottom: 16 }}>
            <Upload size={32} color="#0d9488" style={{ margin: "0 auto 8px" }} />
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Upload Appointment Schedule CSV</h4>
            <p style={{ margin: "4px 0 14px", fontSize: 12, color: "#64748b" }}>
              Supported columns: Doctor, Date, Time, Patient, Reason
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              style={{ display: "none" }}
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="mn-btn-submit-green"
              style={{ width: "auto", display: "inline-block", cursor: "pointer", margin: "0 auto" }}
            >
              Choose CSV File
            </label>
            {csvFileName && <div style={{ fontSize: 12, color: "#0f172a", marginTop: 8, fontWeight: 600 }}>File: {csvFileName}</div>}
          </div>

          {/* Quick Demo CSV loader */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Want to test without a file?</span>
            <button
              type="button"
              className="mn-announcement-link"
              onClick={() => {
                const sample = `Doctor,Date,Time,Patient,Reason
Dr. Priya Nair,2026-10-28,10:00 AM,Vittika Bairathi,Cardiology Consultation
Dr. Arjun Mehta,2026-10-29,11:30 AM,Rahul Kumar,Post-viral follow up
Dr. Priya Nair,2026-10-28,10:00 AM,Vittika Bairathi,Cardiology Consultation
Dr. Sneha Rao,2026-10-30,02:00 PM,Ananya Sen,Neurology check`;
                setCsvContent(sample);
                setCsvFileName("synthetic_hospital_appointments.csv");
                validateCsvMutation.mutate({ csvContent: sample });
              }}
            >
              Load Sample 4-Row CSV (with duplicate detection test)
            </button>
          </div>

          {/* CSV Preview Table */}
          {csvResult && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span className="mn-status-pill mn-status-confirmed">Valid: {csvResult.validRows}</span>
                <span className="mn-status-pill mn-status-pending">Warnings: {csvResult.warningRows}</span>
                <span className="mn-status-pill" style={{ background: "#fee2e2", color: "#b91c1c" }}>Duplicates: {csvResult.duplicateRows}</span>
                <span className="mn-status-pill" style={{ background: "#fef2f2", color: "#dc2626" }}>Invalid: {csvResult.invalidRows}</span>
              </div>

              <div className="mn-data-table-wrap">
                <table className="mn-data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Doctor</th>
                      <th>Date &amp; Time</th>
                      <th>Patient</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Issues / Warnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvResult.rows.map((row: any) => (
                      <tr key={row.rowNumber}>
                        <td>{row.rowNumber}</td>
                        <td>
                          <strong>{row.doctorName}</strong>
                          {row.resolvedDoctor && (
                            <div style={{ fontSize: 11, color: "#0d9488" }}>{row.resolvedDoctor.specialization}</div>
                          )}
                        </td>
                        <td>{row.date} · {row.time}</td>
                        <td>{row.patientName}</td>
                        <td>{row.reason}</td>
                        <td>
                          <span
                            className={`mn-status-pill ${
                              row.status === "valid"
                                ? "mn-status-confirmed"
                                : row.status === "duplicate"
                                ? "mn-badge-staff"
                                : "mn-status-pending"
                            }`}
                          >
                            {row.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, color: row.status === "duplicate" || row.status === "invalid" ? "#b91c1c" : "#64748b" }}>
                          {row.issues.join("; ") || "Clean & Valid"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="mn-btn-submit-green"
                  style={{ width: "auto" }}
                  disabled={csvResult.validRows === 0 || batchConfirmMutation.isPending}
                  onClick={handleConfirmValidCsvRows}
                >
                  {batchConfirmMutation.isPending ? <RefreshCw className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
                  Authorize Batch Booking ({csvResult.validRows} Valid Rows)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: SCREENSHOT EXTRACTION */}
      {activeMode === "screenshot" && !confirmedResult && (
        <div>
          <div style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: 24, textAlign: "center", background: "#f8fafc", marginBottom: 16 }}>
            <ImageIcon size={32} color="#0d9488" style={{ margin: "0 auto 8px" }} />
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Upload Appointment Portal Screenshot</h4>
            <p style={{ margin: "4px 0 14px", fontSize: 12, color: "#64748b" }}>
              Vision AI model will inspect the screenshot to detect doctor name, date, time slot, and clinic.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              style={{ display: "none" }}
              id="screenshot-file-input"
            />
            <label
              htmlFor="screenshot-file-input"
              className="mn-btn-submit-green"
              style={{ width: "auto", display: "inline-block", cursor: "pointer", margin: "0 auto" }}
            >
              Choose Screenshot Image
            </label>
          </div>

          {screenshotPreview && (
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <img
                src={screenshotPreview}
                alt="Screenshot Preview"
                style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
              <div style={{ fontSize: 11, color: "#d97706", fontWeight: 700, marginTop: 6 }}>
                ⚠️ Notice: Extracted details are marked untrusted until reviewed against live hospital capacity.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          INTERPRETED APPOINTMENT DRAFT & EXPLICIT APPROVAL SCREEN
          ============================================================ */}
      {draft && !confirmedResult && (
        <div style={{ marginTop: 24, padding: 20, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={20} color="#0d9488" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                Interpreted Booking Proposal (Review &amp; Explicit Approval)
              </h3>
            </div>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#e2e8f0", color: "#334155" }}>
              Source: {draft.sourceModality.toUpperCase()} · Language: {draft.languageDetected?.toUpperCase() || "EN"}
            </span>
          </div>

          {/* Ambiguity or Warning Alert */}
          {draft.isAmbiguous && (
            <div style={{ padding: 12, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 16, color: "#92400e", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
                <AlertCircle size={16} /> Ambiguity Detected:
              </div>
              <p style={{ margin: "4px 0" }}>{draft.ambiguityReason}</p>
              {draft.suggestedClarification && (
                <div style={{ marginTop: 6, fontSize: 12, fontStyle: "italic" }}>
                  Suggestion: {draft.suggestedClarification}
                </div>
              )}
            </div>
          )}

          {/* Form details review */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="mn-form-group">
              <label className="mn-form-label">Doctor / Clinician</label>
              <div style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                {draft.resolvedDoctor?.name || draft.doctorName || "Unknown Clinician"}
                {draft.resolvedDoctor?.specialization && (
                  <span style={{ display: "block", fontSize: 11, color: "#0d9488", fontWeight: 600 }}>
                    {draft.resolvedDoctor.specialization} · {draft.resolvedDoctor.hospital}
                  </span>
                )}
              </div>
            </div>

            <div className="mn-form-group">
              <label className="mn-form-label">Patient Name</label>
              <div style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#0f172a" }}>
                {currentUser?.name || "Vittika Bairathi"} (ID: PAT-011)
              </div>
            </div>

            <div className="mn-form-group">
              <label className="mn-form-label">Appointment Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="mn-input-control"
                style={{ padding: "6px 12px" }}
              />
            </div>

            <div className="mn-form-group">
              <label className="mn-form-label">Time Slot</label>
              <input
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="mn-input-control"
                style={{ padding: "6px 12px" }}
              />
            </div>
          </div>

          <div className="mn-form-group" style={{ marginBottom: 16 }}>
            <label className="mn-form-label">Consultation Mode</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className={`mn-filter-pill-btn ${consultType === "In-Person Clinic" ? "active" : ""}`}
                onClick={() => setConsultType("In-Person Clinic")}
              >
                In-Person Hospital OPD
              </button>
              <button
                type="button"
                className={`mn-filter-pill-btn ${consultType === "Online Telehealth Video" ? "active" : ""}`}
                onClick={() => setConsultType("Online Telehealth Video")}
              >
                Online Telehealth HD Video
              </button>
            </div>
          </div>

          <div className="mn-form-group" style={{ marginBottom: 20 }}>
            <label className="mn-form-label">Reason for Visit / Clinical Symptoms</label>
            <input
              type="text"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="mn-input-control"
              style={{ padding: "8px 12px" }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className="mn-btn-submit-green"
              style={{ width: "auto", margin: 0 }}
              disabled={draft.isAmbiguous || confirmBookingMutation.isPending}
              onClick={handleConfirmDraft}
            >
              {confirmBookingMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
              Confirm &amp; Commit Authorized Booking
            </button>
            <button
              type="button"
              className="mn-btn-pill-dark"
              style={{ background: "#f1f5f9", color: "#334155", borderColor: "#cbd5e1" }}
              onClick={() => setDraft(null)}
            >
              Cancel Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
