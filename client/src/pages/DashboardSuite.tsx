import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Heart,
  Search,
  Calendar,
  Clock,
  FileText,
  Pill,
  Sparkles,
  ClipboardList,
  Star,
  Bed,
  Ambulance,
  Receipt,
  WifiOff,
  Bell,
  LogOut,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Activity,
  Plus,
  X,
  User,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Send,
  Droplets,
  HeartPulse,
  Download,
  Share2,
  HelpCircle,
  Check,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Printer,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuthUser } from "@/contexts/AuthContext";
import AiAppointmentBooking from "@/components/AiAppointmentBooking";
import {
  SimplifiedRxSafety,
  SimplifiedReportSimplifier,
  SimplifiedOfflineSync,
} from "@/components/SimplifiedHtSuite";
import AdminConsoleView from "@/components/AdminConsoleView";
import StaffConsoleView from "@/components/StaffConsoleView";
import DoctorConsoleView from "@/components/DoctorConsoleView";
import RegionalOperationsView from "@/components/RegionalOperationsView";
import "./dashboard-suite.css";

// 40 Curated Specialist Doctors Across Hospital Departments with Profile Photos
const ALL_DOCTORS = [
  { id: 1, name: "Dr. Om Mishra", specialty: "Cardiology", qualifications: "MBBS, MD, DM (Cardiology)", experience: "14 yrs", fee: "₹800", rating: 4.9, reviews: 142, hours: "09:00 - 14:00", nmc: "NMC-2010-4491", wing: "Cardiology Block A", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80" },
  { id: 2, name: "Dr. Arjun Mehta", specialty: "General Medicine", qualifications: "MBBS, MD (Internal Medicine)", experience: "11 yrs", fee: "₹700", rating: 4.8, reviews: 98, hours: "10:00 - 15:00", nmc: "NMC-2016-4421", wing: "OPD Complex Wing B", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=240&auto=format&fit=crop&q=80" },
  { id: 3, name: "Dr. Priya Nair", specialty: "Cardiology", qualifications: "MBBS, MD, DNB (Cardiology)", experience: "12 yrs", fee: "₹900", rating: 4.9, reviews: 116, hours: "09:30 - 13:30", nmc: "NMC-2012-9843", wing: "Cardiology Block A", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80" },
  { id: 4, name: "Dr. Sneha Rao", specialty: "Neurology", qualifications: "MBBS, DM (Neurology)", experience: "15 yrs", fee: "₹1,000", rating: 5.0, reviews: 88, hours: "11:00 - 16:00", nmc: "NMC-2009-1123", wing: "Neurosciences Tower", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=240&auto=format&fit=crop&q=80" },
  { id: 5, name: "Dr. Rajesh Gupta", specialty: "Pediatrics", qualifications: "MBBS, MD (Pediatrics)", experience: "9 yrs", fee: "₹650", rating: 4.7, reviews: 74, hours: "09:00 - 13:00", nmc: "NMC-2015-8841", wing: "Child Health Pavilion", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=240&auto=format&fit=crop&q=80" },
  { id: 6, name: "Dr. Ananya Sharma", specialty: "Dermatology", qualifications: "MBBS, MD (Dermatology)", experience: "8 yrs", fee: "₹750", rating: 4.8, reviews: 62, hours: "14:00 - 18:00", nmc: "NMC-2018-7712", wing: "Aesthetic & Skin Wing", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=240&auto=format&fit=crop&q=80" },
  { id: 7, name: "Dr. Vikram Sethi", specialty: "Orthopedics", qualifications: "MBBS, MS (Orthopedics), MCh", experience: "16 yrs", fee: "₹850", rating: 4.9, reviews: 104, hours: "10:00 - 14:00", nmc: "NMC-2008-3312", wing: "Bone & Joint Centre", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=240&auto=format&fit=crop&q=80" },
  { id: 8, name: "Dr. Kavita Joshi", specialty: "Gynecology", qualifications: "MBBS, MS (Obstetrics & Gynae)", experience: "13 yrs", fee: "₹800", rating: 4.8, reviews: 91, hours: "11:00 - 15:30", nmc: "NMC-2011-5521", wing: "Women's Health Centre", image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=240&auto=format&fit=crop&q=80" },
  { id: 9, name: "Dr. Rakesh Verma", specialty: "Pulmonology", qualifications: "MBBS, MD (Pulmonary Medicine)", experience: "10 yrs", fee: "₹750", rating: 4.7, reviews: 56, hours: "09:00 - 12:30", nmc: "NMC-2014-6632", wing: "Respiratory Care Unit", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=240&auto=format&fit=crop&q=80" },
  { id: 10, name: "Dr. Sunita Sen", specialty: "Endocrinology", qualifications: "MBBS, DM (Endocrinology)", experience: "12 yrs", fee: "₹950", rating: 4.9, reviews: 83, hours: "13:00 - 17:00", nmc: "NMC-2013-1190", wing: "Metabolic Clinic", image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=240&auto=format&fit=crop&q=80" },
  { id: 11, name: "Dr. Alok Nath", specialty: "Gastroenterology", qualifications: "MBBS, DM (Gastroenterology)", experience: "14 yrs", fee: "₹1,100", rating: 4.8, reviews: 79, hours: "10:00 - 14:00", nmc: "NMC-2010-2245", wing: "Digestive Health Wing", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=240&auto=format&fit=crop&q=80" },
  { id: 12, name: "Dr. Pooja Singhal", specialty: "Ophthalmology", qualifications: "MBBS, MS (Ophthalmology)", experience: "7 yrs", fee: "₹600", rating: 4.7, reviews: 49, hours: "15:00 - 19:00", nmc: "NMC-2019-9941", wing: "Eye Care Centre", image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=240&auto=format&fit=crop&q=80" },
  { id: 13, name: "Dr. Manish Mathur", specialty: "Nephrology", qualifications: "MBBS, DM (Nephrology)", experience: "13 yrs", fee: "₹1,000", rating: 4.9, reviews: 67, hours: "09:30 - 13:00", nmc: "NMC-2011-8894", wing: "Kidney Care & Dialysis", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=240&auto=format&fit=crop&q=80" },
  { id: 14, name: "Dr. Meenakshi Sundaram", specialty: "Oncology", qualifications: "MBBS, MD, DM (Medical Oncology)", experience: "17 yrs", fee: "₹1,200", rating: 5.0, reviews: 112, hours: "11:30 - 16:30", nmc: "NMC-2007-1049", wing: "Cancer Care Institute", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80" },
  { id: 15, name: "Dr. Deepak Chawla", specialty: "ENT", qualifications: "MBBS, MS (Otorhinolaryngology)", experience: "9 yrs", fee: "₹650", rating: 4.7, reviews: 44, hours: "10:00 - 13:30", nmc: "NMC-2016-7734", wing: "ENT Head & Neck", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80" },
  { id: 16, name: "Dr. Shweta Kulkarni", specialty: "Psychiatry", qualifications: "MBBS, MD (Psychiatry)", experience: "11 yrs", fee: "₹850", rating: 4.9, reviews: 86, hours: "14:00 - 18:30", nmc: "NMC-2014-2201", wing: "Mind & Behavioral Wing", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=240&auto=format&fit=crop&q=80" },
  { id: 17, name: "Dr. Harish Bhatt", specialty: "Urology", qualifications: "MBBS, MCh (Urology)", experience: "15 yrs", fee: "₹950", rating: 4.8, reviews: 71, hours: "10:00 - 14:00", nmc: "NMC-2009-4102", wing: "Urology & Lithotripsy", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=240&auto=format&fit=crop&q=80" },
  { id: 18, name: "Dr. Shalini Deshmukh", specialty: "Rheumatology", qualifications: "MBBS, MD, Fellowship Rheumatology", experience: "10 yrs", fee: "₹850", rating: 4.9, reviews: 58, hours: "11:00 - 15:00", nmc: "NMC-2015-3309", wing: "Immunology Center", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=240&auto=format&fit=crop&q=80" },
  { id: 19, name: "Dr. Vinay Trivedi", specialty: "General Surgery", qualifications: "MBBS, MS, FMAS (Laparoscopy)", experience: "18 yrs", fee: "₹900", rating: 4.8, reviews: 95, hours: "09:00 - 13:00", nmc: "NMC-2006-1188", wing: "Surgical Suites Wing C", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=240&auto=format&fit=crop&q=80" },
  { id: 20, name: "Dr. Archana Pillai", specialty: "Pathology", qualifications: "MBBS, MD (Pathology)", experience: "12 yrs", fee: "₹500", rating: 4.9, reviews: 40, hours: "08:00 - 16:00", nmc: "NMC-2012-6611", wing: "Central Diagnostic Labs", image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=240&auto=format&fit=crop&q=80" },
  { id: 21, name: "Dr. Gaurav Kapoor", specialty: "Cardiology", qualifications: "MBBS, MD, FACC (Interventional)", experience: "16 yrs", fee: "₹1,000", rating: 5.0, reviews: 130, hours: "10:00 - 15:00", nmc: "NMC-2008-7711", wing: "Cardiology Block A", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80" },
  { id: 22, name: "Dr. Tanya Varma", specialty: "Pediatrics", qualifications: "MBBS, DNB (Neonatology)", experience: "8 yrs", fee: "₹700", rating: 4.8, reviews: 63, hours: "11:00 - 16:00", nmc: "NMC-2017-4921", wing: "NICU & Child Health", image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=240&auto=format&fit=crop&q=80" },
  { id: 23, name: "Dr. Sameer Rizvi", specialty: "Orthopedics", qualifications: "MBBS, MS (Joint Replacement)", experience: "14 yrs", fee: "₹900", rating: 4.9, reviews: 89, hours: "09:30 - 13:30", nmc: "NMC-2010-8812", wing: "Bone & Joint Centre", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=240&auto=format&fit=crop&q=80" },
  { id: 24, name: "Dr. Reena Saxena", specialty: "Dermatology", qualifications: "MBBS, MD (Cosmetic Dermatology)", experience: "11 yrs", fee: "₹800", rating: 4.8, reviews: 75, hours: "13:00 - 17:30", nmc: "NMC-2014-9901", wing: "Aesthetic & Skin Wing", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80" },
  { id: 25, name: "Dr. Arvind Patel", specialty: "Gastroenterology", qualifications: "MBBS, MD, DM (Hepatology)", experience: "13 yrs", fee: "₹1,050", rating: 4.9, reviews: 82, hours: "10:30 - 15:00", nmc: "NMC-2011-3044", wing: "Digestive Health Wing", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=240&auto=format&fit=crop&q=80" },
  { id: 26, name: "Dr. Neha Agarwal", specialty: "Gynecology", qualifications: "MBBS, DGO, DNB (OBG)", experience: "9 yrs", fee: "₹750", rating: 4.7, reviews: 54, hours: "09:00 - 13:00", nmc: "NMC-2016-2210", wing: "Women's Health Centre", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=240&auto=format&fit=crop&q=80" },
  { id: 27, name: "Dr. Nikhil Chopra", specialty: "Neurology", qualifications: "MBBS, MD, DM (Stroke Specialist)", experience: "16 yrs", fee: "₹1,100", rating: 5.0, reviews: 97, hours: "12:00 - 17:00", nmc: "NMC-2008-5541", wing: "Neurosciences Tower", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=240&auto=format&fit=crop&q=80" },
  { id: 28, name: "Dr. Jyoti Malviya", specialty: "Endocrinology", qualifications: "MBBS, MD, DNB (Diabetology)", experience: "10 yrs", fee: "₹800", rating: 4.8, reviews: 68, hours: "09:30 - 14:00", nmc: "NMC-2015-7790", wing: "Metabolic Clinic", image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=240&auto=format&fit=crop&q=80" },
  { id: 29, name: "Dr. Sanjay Kaul", specialty: "Pulmonology", qualifications: "MBBS, DNB (Critical Care Pulmo)", experience: "15 yrs", fee: "₹850", rating: 4.9, reviews: 85, hours: "10:00 - 14:30", nmc: "NMC-2009-1234", wing: "Respiratory Care Unit", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=240&auto=format&fit=crop&q=80" },
  { id: 30, name: "Dr. Preeti Bajaj", specialty: "General Medicine", qualifications: "MBBS, MD (Family Medicine)", experience: "12 yrs", fee: "₹650", rating: 4.8, reviews: 92, hours: "09:00 - 13:30", nmc: "NMC-2013-8833", wing: "OPD Complex Wing B", image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=240&auto=format&fit=crop&q=80" },
  { id: 31, name: "Dr. Aman Khurana", specialty: "Oncology", qualifications: "MBBS, MS, MCh (Surgical Oncology)", experience: "15 yrs", fee: "₹1,250", rating: 5.0, reviews: 106, hours: "11:00 - 16:00", nmc: "NMC-2009-9021", wing: "Cancer Care Institute", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=240&auto=format&fit=crop&q=80" },
  { id: 32, name: "Dr. Ritu Choudhary", specialty: "Ophthalmology", qualifications: "MBBS, MS (Cornea & Refractive)", experience: "10 yrs", fee: "₹700", rating: 4.7, reviews: 52, hours: "14:00 - 18:00", nmc: "NMC-2015-3341", wing: "Eye Care Centre", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=240&auto=format&fit=crop&q=80" },
  { id: 33, name: "Dr. Vivek Murthy", specialty: "Nephrology", qualifications: "MBBS, MD, DM (Renal Transplant)", experience: "17 yrs", fee: "₹1,150", rating: 4.9, reviews: 78, hours: "09:00 - 13:00", nmc: "NMC-2007-4402", wing: "Kidney Care & Dialysis", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=240&auto=format&fit=crop&q=80" },
  { id: 34, name: "Dr. Nalini Swaminathan", specialty: "Psychiatry", qualifications: "MBBS, DPM, MD (Child Psychiatry)", experience: "14 yrs", fee: "₹900", rating: 4.9, reviews: 73, hours: "13:30 - 18:00", nmc: "NMC-2010-6699", wing: "Mind & Behavioral Wing", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80" },
  { id: 35, name: "Dr. Tarun Grover", specialty: "General Surgery", qualifications: "MBBS, MS (Vascular & General)", experience: "16 yrs", fee: "₹950", rating: 4.8, reviews: 88, hours: "10:00 - 14:00", nmc: "NMC-2008-8877", wing: "Surgical Suites Wing C", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80" },
  { id: 36, name: "Dr. Madhuri Dixit", specialty: "Cardiology", qualifications: "MBBS, MD, DM (Electrophysiology)", experience: "13 yrs", fee: "₹950", rating: 4.9, reviews: 99, hours: "09:00 - 14:00", nmc: "NMC-2012-1100", wing: "Cardiology Block A", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=240&auto=format&fit=crop&q=80" },
  { id: 37, name: "Dr. Rohit Aggarwal", specialty: "Orthopedics", qualifications: "MBBS, MS (Spine Surgery)", experience: "15 yrs", fee: "₹1,000", rating: 4.9, reviews: 110, hours: "11:00 - 15:30", nmc: "NMC-2009-7722", wing: "Bone & Joint Centre", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=240&auto=format&fit=crop&q=80" },
  { id: 38, name: "Dr. Sunayana Bose", specialty: "ENT", qualifications: "MBBS, DLO, DNB (Cochlear Implant)", experience: "12 yrs", fee: "₹750", rating: 4.8, reviews: 61, hours: "10:30 - 14:30", nmc: "NMC-2013-5590", wing: "ENT Head & Neck", image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=240&auto=format&fit=crop&q=80" },
  { id: 39, name: "Dr. Abhay Deshpande", specialty: "Urology", qualifications: "MBBS, MS, MCh (Robotic Uro)", experience: "14 yrs", fee: "₹1,050", rating: 4.9, reviews: 84, hours: "09:30 - 13:30", nmc: "NMC-2011-4477", wing: "Urology & Lithotripsy", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=240&auto=format&fit=crop&q=80" },
  { id: 40, name: "Dr. Pallavi Roy", specialty: "General Medicine", qualifications: "MBBS, MD (Critical Care & Medicine)", experience: "10 yrs", fee: "₹700", rating: 4.8, reviews: 77, hours: "10:00 - 15:00", nmc: "NMC-2015-9921", wing: "OPD Complex Wing B", image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=240&auto=format&fit=crop&q=80" },
];

export default function DashboardSuite() {
  const [, setLocation] = useLocation();
  const { currentUser, logout, loginAs } = useAuthUser();
  const [showRegionalOps, setShowRegionalOps] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [searchDoctorQuery, setSearchDoctorQuery] = useState("");

  // Modals & Drawers state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [modalBookingTab, setModalBookingTab] = useState<"standard" | "ai">("standard");
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [isZapiaOpen, setIsZapiaOpen] = useState(false);
  const [isDoctorProfileOpen, setIsDoctorProfileOpen] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBedBookingOpen, setIsBedBookingOpen] = useState(false);
  const [isBillInvoiceOpen, setIsBillInvoiceOpen] = useState<any | null>(null);

  // Booking Form State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState("Dr. Om Mishra");
  const [bookingDate, setBookingDate] = useState("2026-10-26");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingReason, setBookingReason] = useState("Follow-up Consultation");
  const [consultType, setConsultType] = useState<"In-Person" | "Online">("In-Person");

  // Vitals State
  const [vitals, setVitals] = useState({
    bpSys: 120,
    bpDia: 80,
    heartRate: 72,
    glucose: 95,
    spo2: 99,
  });

  // Pill Tracker state (4 scheduled medications)
  const [pillSchedule, setPillSchedule] = useState([
    { id: 1, name: "Telmisartan 40mg", time: "Morning (08:30 AM)", meal: "After breakfast", taken: true },
    { id: 2, name: "Pantoprazole 40mg", time: "Morning (07:30 AM)", meal: "Empty stomach", taken: true },
    { id: 3, name: "Multivitamin & Zinc", time: "Afternoon (01:30 PM)", meal: "After lunch", taken: false },
    { id: 4, name: "Atorvastatin 10mg", time: "Night (09:00 PM)", meal: "After dinner", taken: false },
  ]);

  // Appointments state (4 rich demo appointments)
  const [appointments, setAppointments] = useState([
    {
      id: "APT-101",
      doctor: "Dr. Om Mishra",
      specialty: "Cardiology",
      date: "2026-10-26",
      time: "10:00 AM",
      type: "In-Person Clinic",
      status: "Confirmed",
      reason: "Blood Pressure Monitoring & Follow-Up",
      wing: "Cardiology Block A, Room 204",
    },
    {
      id: "APT-102",
      doctor: "Dr. Arjun Mehta",
      specialty: "General Medicine",
      date: "2026-10-18",
      time: "02:30 PM",
      type: "Online Telehealth Video",
      status: "Completed",
      reason: "Post-viral recovery & routine blood panel review",
      wing: "Encrypted WebRTC Suite #4",
    },
    {
      id: "APT-103",
      doctor: "Dr. Priya Nair",
      specialty: "Cardiology",
      date: "2026-11-02",
      time: "11:30 AM",
      type: "Online Telehealth Video",
      status: "Confirmed",
      reason: "Echocardiogram 2D Doppler Assessment Review",
      wing: "Encrypted WebRTC Suite #2",
    },
    {
      id: "APT-104",
      doctor: "Dr. Ananya Sharma",
      specialty: "Dermatology",
      date: "2026-10-04",
      time: "04:00 PM",
      type: "In-Person Clinic",
      status: "Completed",
      reason: "Skin allergy patch test evaluation",
      wing: "Aesthetic & Skin Wing, Room 102",
    },
  ]);

  const [cancellingAppointment, setCancellingAppointment] = useState<{
    id: string;
    doctor: string;
    date: string;
    time: string;
    specialty: string;
    type: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Schedule conflict / Personal emergency");

  const handleConfirmCancelAppointment = () => {
    if (!cancellingAppointment) return;
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === cancellingAppointment.id
          ? { ...apt, status: "Cancelled" }
          : apt
      )
    );
    toast.success(`Appointment #${cancellingAppointment.id} with ${cancellingAppointment.doctor} has been cancelled.`);
    setCancellingAppointment(null);
  };

  // Medical Timeline records (5 rich events)
  const [timelineRecords] = useState([
    {
      id: "REC-501",
      title: "Cardiology Review & ECG Evaluation",
      doctor: "Dr. Om Mishra",
      dept: "MEDNEXUS Cardiology Wing",
      date: "2026-10-18",
      type: "Consultation",
      notes: "Resting heart rate 72 bpm, BP 130/84 mmHg. Commenced Telmisartan 40mg. Scheduled 2-week follow-up for blood pressure monitoring.",
      vitals: "BP: 130/84 · HR: 72 bpm · ECG: Normal Sinus Rhythm",
    },
    {
      id: "REC-502",
      title: "Complete Blood Count (CBC) Routine Lab",
      doctor: "Central Pathology Dept",
      dept: "Diagnostic Laboratories",
      date: "2026-10-12",
      type: "Laboratory",
      notes: "Hemoglobin 13.8 g/dL (normal), WBC 6,400 cells/mcL (normal), Platelets 220,000 /mcL (normal). No abnormalities detected.",
      vitals: "Sample: Whole Blood (EDTA) · Verified Safe",
    },
    {
      id: "REC-503",
      title: "Fasting Blood Glucose & Glycemic HbA1c Panel",
      doctor: "Dr. Sunita Sen",
      dept: "Endocrinology & Metabolic Center",
      date: "2026-09-28",
      type: "Laboratory",
      notes: "Fasting Blood Glucose 95 mg/dL (Normal). HbA1c 5.4% (Optimal non-diabetic range). Insulin sensitivity index stable.",
      vitals: "Fasting Glucose: 95 mg/dL · HbA1c: 5.4%",
    },
    {
      id: "REC-504",
      title: "Seasonal Influenza Quadrivalent Immunization",
      doctor: "Sister Anjali (Field RN)",
      dept: "Preventive Healthcare & Vaccine Unit",
      date: "2026-09-04",
      type: "Vaccination",
      notes: "Administered Quadrivalent Inactivated Influenza vaccine (0.5 mL IM left deltoid). Batch: FLU-2026-904. Patient tolerated without side effects.",
      vitals: "Dose: 0.5 mL IM · Observation: 15 mins uneventful",
    },
    {
      id: "REC-505",
      title: "Chest Radiograph PA View (Digital X-Ray)",
      doctor: "Radiology Screening Dept",
      dept: "Advanced Medical Imaging",
      date: "2026-08-14",
      type: "Radiology",
      notes: "Bilateral lung fields clear. Costophrenic angles sharp. Cardiothoracic ratio normal (<0.50). No active parenchymal lesion.",
      vitals: "Radiation Dose: 0.02 mSv · Radiologist: Dr. R. K. Saxena",
    },
  ]);

  // Prescriptions state (4 comprehensive prescriptions)
  const [prescriptions] = useState([
    {
      id: "RX-2026-881",
      doctor: "Dr. Om Mishra",
      specialty: "MD, DM Cardiology",
      date: "2026-10-18",
      status: "Active Therapy",
      medicines: [
        { name: "Telmisartan 40 mg Tablet", dose: "1 tablet once daily", time: "Morning (08:30 AM)", meal: "After breakfast", duration: "30 days" },
      ],
      instructions: "Monitor morning blood pressure. Avoid sudden cessation. Low sodium intake advised.",
      followUp: "2026-10-26 (Blood Pressure review)",
    },
    {
      id: "RX-2026-882",
      doctor: "Dr. Priya Nair",
      specialty: "MD, DNB Cardiology",
      date: "2026-09-20",
      status: "Active Therapy",
      medicines: [
        { name: "Atorvastatin 10 mg Tablet", dose: "1 tablet once daily", time: "Night (09:00 PM)", meal: "After dinner", duration: "60 days" },
      ],
      instructions: "Lipid-lowering HMG-CoA reductase inhibitor. Take at bedtime with water.",
      followUp: "2026-11-20 (Lipid profile panel)",
    },
    {
      id: "RX-2026-883",
      doctor: "Dr. Arjun Mehta",
      specialty: "MD Internal Medicine",
      date: "2026-08-15",
      status: "Completed Course",
      medicines: [
        { name: "Pantoprazole 40 mg Tablet", dose: "1 tablet once daily", time: "Morning (07:30 AM)", meal: "Empty stomach", duration: "14 days" },
        { name: "Probiotic LactoBacillus Capsule", dose: "1 capsule twice daily", time: "Morning & Night", meal: "After meals", duration: "10 days" },
      ],
      instructions: "Gastro-protection therapy for mild gastritis. Course successfully concluded.",
      followUp: "Completed",
    },
    {
      id: "RX-2026-884",
      doctor: "Dr. Vikram Sethi",
      specialty: "MS Orthopedics",
      date: "2026-07-10",
      status: "Active Therapy",
      medicines: [
        { name: "Cholecalciferol (Vitamin D3) 60,000 IU", dose: "1 sachet weekly", time: "Sunday Morning", meal: "With warm milk", duration: "8 weeks" },
      ],
      instructions: "Bone mineralization support. Take once weekly with milk or after main meal.",
      followUp: "2026-11-10 (Serum Vitamin D review)",
    },
  ]);

  // Reviews state (4 detailed reviews)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      doctor: "Dr. Om Mishra",
      specialty: "Cardiology",
      rating: 5,
      date: "2026-10-19",
      comment: "Outstanding clinician. Explained my cardiovascular ECG and blood pressure readings with extreme clarity. Very patient and reassuring.",
    },
    {
      id: 2,
      doctor: "Dr. Arjun Mehta",
      specialty: "General Medicine",
      rating: 5,
      date: "2026-10-18",
      comment: "Conducted an in-depth online telehealth review. Identified my post-viral symptoms and adjusted my vitamins promptly.",
    },
    {
      id: 3,
      doctor: "Dr. Priya Nair",
      specialty: "Cardiology",
      rating: 5,
      date: "2026-09-22",
      comment: "Highly knowledgeable and meticulous. Reviewed my family cardiac history and guided my preventive lipid management.",
    },
    {
      id: 4,
      doctor: "Dr. Vikram Sethi",
      specialty: "Orthopedics",
      rating: 4,
      date: "2026-07-12",
      comment: "Very thorough examination of my knee joint and prescribed Vitamin D3 regimen that improved my mobility significantly.",
    },
  ]);
  const [reviewDoctor, setReviewDoctor] = useState("Dr. Om Mishra");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Wards & Bed Breakdown (6 Wards)
  const [wardList] = useState([
    { id: "W1", name: "Cardiology Inpatient Ward", capacity: 16, occupied: 14, available: 2, wing: "Wing A (3rd Floor)", nurse: "Sister Smitha", type: "Telemetry Monitored" },
    { id: "W2", name: "Intensive Care Unit (ICU)", capacity: 12, occupied: 8, available: 4, wing: "Critical Care Tower (2nd Floor)", nurse: "Senior Intensivist Nurse Roy", type: "Hamilton C6 Ventilators" },
    { id: "W3", name: "General Medicine Ward", capacity: 22, occupied: 20, available: 2, wing: "Main Block (1st Floor)", nurse: "Sister Anjali", type: "Acute Medical Care" },
    { id: "W4", name: "Orthopedic & Surgery Ward", capacity: 12, occupied: 10, available: 2, wing: "Surgical Pavilion (4th Floor)", nurse: "Nurse Priya", type: "Post-Op Mobilization" },
    { id: "W5", name: "Neonatal ICU (NICU)", capacity: 8, occupied: 6, available: 2, wing: "Child Health Pavilion", nurse: "Sister Reena", type: "Incubator & Phototherapy" },
    { id: "W6", name: "Emergency Triage Observation", capacity: 8, occupied: 6, available: 2, wing: "Ground Floor Trauma Centre", nurse: "Charge Nurse David", type: "Immediate Resuscitation" },
  ]);

  // Ambulance Fleet Status (3 Ambulances)
  const [ambulanceFleet] = useState([
    { id: "MED-AMB-04", type: "Advanced Cardiac Life Support (ACLS)", status: "Active Dispatch", eta: "6 mins", distance: "2.4 km", driver: "Rajesh Shinde", paramedic: "Vikram Joshi (Senior EMT)", contact: "+91 98200 44102", equipment: "Defibrillator, O2, Ventilator, Syringe Pump" },
    { id: "MED-AMB-01", type: "Basic Life Support (BLS)", status: "Stationed at Bay 1", eta: "Immediate", distance: "0.0 km", driver: "Mohan Lal", paramedic: "Anil Kumar (EMT)", contact: "+91 98200 44101", equipment: "Oxygen Cylinder, Spine Board, Suction Apparatus" },
    { id: "MED-AMB-09", type: "Neonatal Critical Transport", status: "On Standby", eta: "Available", distance: "Bay 3", driver: "Ramesh Pawar", paramedic: "Nurse Preethi (NICU Specialist)", contact: "+91 98200 44109", equipment: "Transport Incubator, Micro-Ventilator, Infusion" },
  ]);

  // Invoices & Receipts (4 Itemized Bills)
  const [billsList] = useState([
    { id: "INV-2026-4401", service: "Outpatient Cardiology Consultation", provider: "Dr. Om Mishra", date: "2026-10-18", amount: "₹800", gst: "₹0 (Exempt)", total: "₹800", status: "Paid", method: "UPI / PhonePe", gstin: "07AAACM4491E1Z2" },
    { id: "INV-2026-4290", service: "Complete Blood Count (CBC) Lab Panel", provider: "Central Pathology Dept", date: "2026-10-12", amount: "₹450", gst: "₹0 (Exempt)", total: "₹450", status: "Paid", method: "Card / HDFC POS", gstin: "07AAACM4491E1Z2" },
    { id: "INV-2026-4115", service: "Cardiac 12-Lead ECG & 2D Echo Screening", provider: "Cardiology Non-Invasive Lab", date: "2026-09-20", amount: "₹1,200", gst: "₹0 (Exempt)", total: "₹1,200", status: "Paid", method: "TPA Cashless Pre-Auth", gstin: "07AAACM4491E1Z2" },
    { id: "INV-2026-3980", service: "Central Pharmacy Medication Dispensing", provider: "MEDNEXUS Hospital Pharmacy", date: "2026-08-15", amount: "₹640", gst: "₹76.80 (12%)", total: "₹716.80", status: "Paid", method: "Cash", gstin: "07AAACM4491E1Z2" },
  ]);

  // ZAPIA AI Chat messages
  const [zapiaMessages, setZapiaMessages] = useState<{ sender: "ai" | "user"; text: string; time: string }[]>([
    {
      sender: "ai",
      text: "Hello Vittika! I am ZAPIA, your MEDNEXUS Clinical AI Assistant. How can I assist with your appointments, medications, or diagnostic report findings today?",
      time: "Live",
    },
  ]);
  const [zapiaInput, setZapiaInput] = useState("");

  // Telehealth Video State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Active Persona details
  const isDoctor = currentUser?.role === "doctor" || currentUser?.userType === "doctor";
  const isStaff = currentUser?.role === "hospital" || currentUser?.role === "coordinator" || currentUser?.userType === "staff";
  const isAdmin = currentUser?.role === "admin";

  const defaultName = isAdmin
    ? "Dr. Arvind Swaminathan"
    : isStaff
    ? "Sister Sarita Thomas"
    : isDoctor
    ? "Dr. Om Mishra"
    : "Vittika Bairathi";

  const defaultRole = isAdmin
    ? "ADMIN"
    : isStaff
    ? "STAFF"
    : isDoctor
    ? "DOCTOR"
    : "PATIENT";

  const defaultEmail = isAdmin
    ? "admin@mednexus.example"
    : isStaff
    ? "nurse001@mednexus.example"
    : isDoctor
    ? "om.mishra@mednexus.example"
    : "vittikabairathi35@gmail.com";

  const userName = currentUser?.name || defaultName;
  const userRole = isAdmin ? "ADMIN" : isStaff ? "STAFF" : isDoctor ? "DOCTOR" : "PATIENT";
  const userEmail = currentUser?.email || defaultEmail;
  const patientId = "PAT-011";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase() || (isAdmin ? "AS" : isStaff ? "ST" : isDoctor ? "OM" : "VB");

  // Handlers
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      doctor: selectedDoctorForBooking,
      specialty: ALL_DOCTORS.find(d => d.name === selectedDoctorForBooking)?.specialty || "General Medicine",
      date: bookingDate,
      time: bookingTime,
      type: consultType,
      status: "Confirmed",
      reason: bookingReason,
      wing: ALL_DOCTORS.find(d => d.name === selectedDoctorForBooking)?.wing || "Main OPD Complex",
    };
    setAppointments([newApt, ...appointments]);
    setIsBookingOpen(false);
    toast.success(`Appointment confirmed with ${selectedDoctorForBooking} on ${bookingDate} at ${bookingTime}!`);
    setActiveTab("appointments");
  };

  const togglePill = (id: number) => {
    setPillSchedule(prev =>
      prev.map(p => (p.id === id ? { ...p, taken: !p.taken } : p))
    );
    toast.success("Pill adherence log updated!");
  };

  // ZAPIA Live Mutation
  const chatZapiaMutation = trpc.aiBooking.chatZapia.useMutation();
  const [isZapiaThinking, setIsZapiaThinking] = useState(false);

  const handleSendZapia = (textToSend?: string) => {
    const text = textToSend || zapiaInput.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessages = [...zapiaMessages, { sender: "user" as const, text, time: now }];
    setZapiaMessages(newMessages);
    setZapiaInput("");
    setIsZapiaThinking(true);

    chatZapiaMutation.mutate(
      { message: text, patientName: "Vittika Bairathi" },
      {
        onSuccess: (data: string) => {
          setIsZapiaThinking(false);
          setZapiaMessages(prev => [
            ...prev,
            { sender: "ai", text: data, time: "Just now" }
          ]);
        },
        onError: () => {
          setIsZapiaThinking(false);
          const reply = `I have received your query: "${text}". Based on your MEDNEXUS health records, our clinical team has noted this enquiry. For critical symptoms or emergency triage, please proceed to the nearest emergency room or consult Dr. Priya Nair directly.`;
          setZapiaMessages(prev => [
            ...prev,
            { sender: "ai", text: reply, time: "Just now" }
          ]);
        }
      }
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment) return;
    const newRev = {
      id: Date.now(),
      doctor: reviewDoctor,
      specialty: ALL_DOCTORS.find(d => d.name === reviewDoctor)?.specialty || "Medicine",
      rating: reviewRating,
      date: new Date().toISOString().split("T")[0],
      comment: reviewComment,
    };
    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setReviewComment("");
    toast.success("Review submitted to MEDNEXUS verified patient records!");
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out of MEDNEXUS Network");
    setLocation("/");
  };

  const filteredDoctors = ALL_DOCTORS.filter(d => {
    const matchesSpec = selectedSpecialty === "All" || d.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesQuery = !searchDoctorQuery || d.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchDoctorQuery.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  return (
    <div className="mn-dashboard-app">
      {/* ============================================================
          TOPBAR (Exact Image 5)
          ============================================================ */}
      <header className="mn-topbar">
        {/* Left Brand Group */}
        <div className="mn-topbar-left">
          <div className="mn-brand-square-plus">+</div>
          <div className="mn-topbar-brand-group">
            <div className="mn-topbar-brand-title">
              MEDNEXUS AI
              <span className="mn-topbar-brand-badge">One Intelligent Network</span>
            </div>
            <div className="mn-topbar-hospital-sub">MEDNEXUS General Hospital</div>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="mn-topbar-right">
          <button
            type="button"
            className="mn-btn-zapia-pill"
            onClick={() => setIsZapiaOpen(true)}
          >
            <span className="mn-live-dot" /> ZAPIA AI Assistant
          </button>

          <button
            type="button"
            className="mn-btn-explore-pill"
            onClick={() => setShowEvaluatorModal(true)}
          >
            <Sparkles size={14} /> Switch Persona
          </button>

          <button
            type="button"
            className="mn-icon-btn-bell"
            onClick={() => toast.info("Notifications: 1 new appointment confirmation received.")}
          >
            <Bell size={18} />
            <span className="mn-bell-dot" />
          </button>

          {/* User Account Profile Pill */}
          <div className="mn-user-account-badge">
            <div className="mn-user-avatar-circle">{initials}</div>
            <div className="mn-user-text-col">
              <div className="mn-user-name-row">
                <span className="mn-user-fullname">{userName}</span>
                <span
                  className={`mn-user-role-pill ${
                    userRole === "ADMIN"
                      ? "mn-badge-admin"
                      : userRole === "DOCTOR"
                      ? "mn-badge-doctor"
                      : userRole === "STAFF"
                      ? "mn-badge-staff"
                      : "mn-badge-patient"
                  }`}
                >
                  {userRole}
                </span>
              </div>
              <span className="mn-user-email-sub">{userEmail}</span>
            </div>
            <button
              type="button"
              className="mn-btn-logout-icon"
              title="Log out"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN BODY (Role Consoles or Patient 12-Item Workspace)
          ============================================================ */}
      {showRegionalOps ? (
        <RegionalOperationsView onClose={() => setShowRegionalOps(false)} />
      ) : isAdmin ? (
        <AdminConsoleView
          doctorsList={ALL_DOCTORS}
          onOpenInnovationLab={() => setShowRegionalOps(true)}
        />
      ) : isStaff ? (
        <StaffConsoleView onOpenBedMatrix={() => {}} />
      ) : isDoctor ? (
        <DoctorConsoleView
          doctorName={userName}
          specialty="Cardiology"
          onLaunchTelehealth={() => setIsTelehealthOpen(true)}
        />
      ) : (
        <div className="mn-workspace-body">
        {/* Left Sidebar (Exact 12 Items from Image 5) */}
        <aside className="mn-suite-sidebar">
          {/* Patient Profile Card */}
          <div className="mn-sidebar-patient-box">
            <div className="mn-sidebar-patient-heart">
              <Heart size={16} fill="currentColor" />
            </div>
            <div className="mn-sidebar-patient-text">
              <span className="mn-sidebar-patient-name">{userName}</span>
              <span className="mn-sidebar-patient-id">Patient ID: {patientId}</span>
            </div>
          </div>

          {/* 1. Dashboard Overview */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity size={16} />
            <span>1. Dashboard Overview</span>
          </button>

          {/* 2. Find Doctors */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            <Search size={16} />
            <span>2. Find Doctors ({ALL_DOCTORS.length})</span>
          </button>

          {/* 3. Book Appointment */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "book" ? "active" : ""}`}
            onClick={() => setActiveTab("book")}
          >
            <Calendar size={16} />
            <span>3. Book Appointment (AI Agent)</span>
          </button>

          {/* 4. My Appointments */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <Clock size={16} />
            <span>4. My Appointments ({appointments.length})</span>
          </button>

          {/* 5. Medical Timeline */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <FileText size={16} />
            <span>5. Medical Timeline ({timelineRecords.length})</span>
          </button>

          {/* 6. Prescriptions */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "prescriptions" ? "active" : ""}`}
            onClick={() => setActiveTab("prescriptions")}
          >
            <Pill size={16} />
            <span>6. Prescriptions ({prescriptions.length})</span>
          </button>

          {/* 7. AI Medicine Verifier (HT-01) */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn special-link ${activeTab === "verifier" ? "active" : ""}`}
            onClick={() => setActiveTab("verifier")}
          >
            <Sparkles size={16} />
            <span>7. AI Medicine Verifier (HT-01)</span>
          </button>

          {/* 8. AI Report Simplifier (HT-02) */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn special-link ${activeTab === "simplifier" ? "active" : ""}`}
            onClick={() => setActiveTab("simplifier")}
          >
            <ClipboardList size={16} />
            <span>8. AI Report Simplifier (HT-02)</span>
          </button>

          {/* 9. My Reviews */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            <Star size={16} />
            <span>9. My Reviews ({reviews.length})</span>
          </button>

          {/* 10. Bed & ICU Enquiries */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "beds" ? "active" : ""}`}
            onClick={() => setActiveTab("beds")}
          >
            <Bed size={16} />
            <span>10. Bed &amp; ICU Enquiries ({wardList.length})</span>
          </button>

          {/* 11. Ambulance Assistance */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "ambulance" ? "active" : ""}`}
            onClick={() => setActiveTab("ambulance")}
          >
            <Ambulance size={16} />
            <span>11. Ambulance Assistance ({ambulanceFleet.length})</span>
          </button>

          {/* 12. Bills & Receipts */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn ${activeTab === "bills" ? "active" : ""}`}
            onClick={() => setActiveTab("bills")}
          >
            <Receipt size={16} />
            <span>12. Bills &amp; Receipts ({billsList.length})</span>
          </button>

          {/* Offline Health Mesh (HT-03) */}
          <button
            type="button"
            className={`mn-sidebar-nav-btn special-link ${activeTab === "offline" ? "active" : ""}`}
            style={{ marginTop: "auto", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}
            onClick={() => setActiveTab("offline")}
          >
            <WifiOff size={16} />
            <span>13. Offline Health Records (HT-03)</span>
          </button>
        </aside>

        {/* Workspace Content Stage */}
        <main className="mn-workspace-stage">
          {/* ============================================================
              TAB 1: DASHBOARD OVERVIEW
              ============================================================ */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Hero Banner (Exact Image 5) */}
              <div className="mn-welcome-hero-banner">
                <div className="mn-welcome-banner-left">
                  <div className="mn-banner-eyebrow">MEDNEXUS CONNECTED PATIENT CARE</div>
                  <h1 className="mn-banner-h1">Welcome, {userName}</h1>
                  <p className="mn-banner-desc">
                    Access 40+ medical specialists, book appointments with atomic double-booking protection, review
                    issued prescriptions, and verify medicines with Gemini AI.
                  </p>
                </div>
                <div className="mn-welcome-banner-actions">
                  <button
                    type="button"
                    className="mn-btn-banner-white"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="mn-btn-banner-teal-translucent"
                    onClick={() => setActiveTab("verifier")}
                  >
                    <Sparkles size={14} /> Verify Medicine
                  </button>
                </div>
              </div>

              {/* Health Vitals Widget Row */}
              <div className="mn-vitals-row">
                <div className="mn-vital-card">
                  <div className="mn-vital-icon red">
                    <HeartPulse size={20} />
                  </div>
                  <div className="mn-vital-info">
                    <span className="mn-vital-lbl">Blood Pressure</span>
                    <span className="mn-vital-val">{vitals.bpSys}/{vitals.bpDia} <small style={{ fontSize: 12, fontWeight: 500 }}>mmHg</small></span>
                    <span className="mn-vital-status">Optimal on Telmisartan</span>
                  </div>
                </div>

                <div className="mn-vital-card">
                  <div className="mn-vital-icon blue">
                    <Activity size={20} />
                  </div>
                  <div className="mn-vital-info">
                    <span className="mn-vital-lbl">Heart Rate</span>
                    <span className="mn-vital-val">{vitals.heartRate} <small style={{ fontSize: 12, fontWeight: 500 }}>bpm</small></span>
                    <span className="mn-vital-status">Normal Sinus Rhythm</span>
                  </div>
                </div>

                <div className="mn-vital-card">
                  <div className="mn-vital-icon amber">
                    <Droplets size={20} />
                  </div>
                  <div className="mn-vital-info">
                    <span className="mn-vital-lbl">Blood Glucose</span>
                    <span className="mn-vital-val">{vitals.glucose} <small style={{ fontSize: 12, fontWeight: 500 }}>mg/dL</small></span>
                    <span className="mn-vital-status">Fasting · Normal</span>
                  </div>
                </div>

                <div className="mn-vital-card">
                  <div className="mn-vital-icon teal">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="mn-vital-info">
                    <span className="mn-vital-lbl">SpO2 Oxygen</span>
                    <span className="mn-vital-val">{vitals.spo2}%</span>
                    <span className="mn-vital-status">Room Air · Good</span>
                  </div>
                </div>
              </div>

              {/* 3 Cards Row (Exact Image 5) */}
              <div className="mn-three-cards-row">
                {/* Card 1: Next Upcoming Consultation */}
                <div className="mn-dashboard-card">
                  <div className="mn-card-eyebrow teal">
                    <Calendar size={13} /> NEXT UPCOMING CONSULTATION
                  </div>
                  {appointments.length > 0 ? (
                    <div>
                      <p className="mn-card-patient-highlight">
                        <strong>{appointments[0].doctor}</strong> ({appointments[0].specialty})
                        <br />
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {appointments[0].date} at {appointments[0].time} · {appointments[0].type}
                        </span>
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <span className={`mn-status-pill ${appointments[0].status === "Cancelled" ? "mn-status-cancelled" : "mn-status-confirmed"}`}>
                          {appointments[0].status}
                        </span>
                        {appointments[0].status !== "Cancelled" && (
                          <>
                            {appointments[0].type.includes("Online") && (
                              <button
                                type="button"
                                className="mn-doc-card-btn"
                                style={{ padding: "4px 10px", fontSize: 11, width: "auto" }}
                                onClick={() => setIsTelehealthOpen(true)}
                              >
                                <Video size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                                Join Video Call
                              </button>
                            )}
                            <button
                              type="button"
                              className="mn-doc-card-btn mn-btn-cancel-apt"
                              onClick={() => setCancellingAppointment(appointments[0])}
                            >
                              Cancel Consultation
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mn-card-body-text">
                      No confirmed upcoming consultations. Browse doctors to book a slot.
                    </p>
                  )}
                </div>

                {/* Card 2: Latest Digital Prescription */}
                <div className="mn-dashboard-card">
                  <div className="mn-card-eyebrow purple">
                    <Pill size={13} /> LATEST DIGITAL PRESCRIPTION
                  </div>
                  <p className="mn-card-patient-highlight">
                    <strong>Telmisartan 40mg</strong> — 1 tab daily (morning)
                    <br />
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Prescribed by Dr. Om Mishra (Cardiology) · Verified Safe
                    </span>
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="mn-status-pill mn-status-confirmed">Active Rx</span>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#0d9488", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      onClick={() => setActiveTab("prescriptions")}
                    >
                      View Pill Schedule →
                    </button>
                  </div>
                </div>

                {/* Card 3: Follow-Up Care */}
                <div className="mn-dashboard-card">
                  <div className="mn-card-eyebrow teal">
                    <Clock size={13} /> FOLLOW-UP CARE
                  </div>
                  <p className="mn-card-patient-highlight">
                    <strong>Rahul Sharma</strong> has a follow-up recommended with <strong>Dr. Om Mishra (Cardiology)</strong> for
                    blood pressure monitoring.
                  </p>
                  <button
                    type="button"
                    className="mn-btn-full-emerald"
                    onClick={() => {
                      setSelectedDoctorForBooking("Dr. Om Mishra");
                      setBookingReason("Blood Pressure Monitoring & Follow-Up");
                      setIsBookingOpen(true);
                    }}
                  >
                    Book Follow-Up with Dr. Om Mishra
                  </button>
                </div>
              </div>

              {/* Quick Launch Clinical Engines */}
              <div style={{ marginTop: 10 }}>
                <div className="mn-section-heading">
                  <h2>Hospital Clinical AI &amp; Offline Engines</h2>
                  <p>Core clinical AI and resilient offline modules integrated directly into your workflow:</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                  {/* HT-01 Box */}
                  <div
                    className="mn-doctor-card-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("verifier")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "#e6f7f3",
                          color: "#0d9488",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a" }}>HT-01 | Medication Safety</strong>
                        <div style={{ fontSize: 11, color: "#0d9488", fontWeight: 700 }}>AI Error Detection</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.4 }}>
                      Detects duplicate constituents across brands (Combiflam + Dolo), harmful DDI combinations, and beta-lactam anaphylactic allergy cross-reactivity.
                    </p>
                    <button type="button" className="mn-doc-card-btn">
                      Check Medicine Safety (HT-01) →
                    </button>
                  </div>

                  {/* HT-02 Box */}
                  <div
                    className="mn-doctor-card-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("simplifier")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "#f3e8ff",
                          color: "#9333ea",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a" }}>HT-02 | Report Simplifier</strong>
                        <div style={{ fontSize: 11, color: "#9333ea", fontWeight: 700 }}>Diagnostic AI Translation</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.4 }}>
                      Side-by-side medical translation for CBC, lipid, and metabolic reports with exact value audits and doctor discussion questions.
                    </p>
                    <button
                      type="button"
                      className="mn-doc-card-btn"
                      style={{ background: "#f3e8ff", color: "#7e22ce", borderColor: "#e9d5ff" }}
                    >
                      Understand Reports (HT-02) →
                    </button>
                  </div>

                  {/* HT-03 Box */}
                  <div
                    className="mn-doctor-card-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("offline")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "#e0f2fe",
                          color: "#0284c7",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <WifiOff size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a" }}>HT-03 | Offline Sync Engine</strong>
                        <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>Healthcare Without Net</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.4 }}>
                      Device-local SHA-256 tamper-proof health record store with background central sync and 3-way conflict resolver.
                    </p>
                    <button
                      type="button"
                      className="mn-doc-card-btn"
                      style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}
                    >
                      View Offline Records (HT-03) →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============================================================
              TAB 2: FIND DOCTORS (40 Specialists)
              ============================================================ */}
          {activeTab === "doctors" && (
            <div>
              <div className="mn-section-heading">
                <h2>Specialist Doctor Directory (40 Available)</h2>
                <p>Filter by clinical specialty and book atomic consultations in real-time:</p>
              </div>

              {/* Search + Filter Bar */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={16} style={{ position: "absolute", left: 14, top: 13, color: "#94a3b8" }} />
                  <input
                    type="text"
                    value={searchDoctorQuery}
                    onChange={e => setSearchDoctorQuery(e.target.value)}
                    placeholder="Search doctor by name, specialty, or condition (e.g., Cardiology, Hypertension)..."
                    className="mn-input-control"
                    style={{ paddingLeft: 42 }}
                  />
                </div>
              </div>

              {/* Specialty Filter Bar */}
              <div className="mn-specialty-filter-bar">
                {["All", "Cardiology", "General Medicine", "Neurology", "Pediatrics", "Dermatology", "Orthopedics", "Gynecology", "Pulmonology", "Endocrinology", "Oncology", "Nephrology", "Urology"].map(
                  spec => (
                    <button
                      key={spec}
                      type="button"
                      className={`mn-filter-pill-btn ${selectedSpecialty === spec ? "active" : ""}`}
                      onClick={() => setSelectedSpecialty(spec)}
                    >
                      {spec}
                    </button>
                  )
                )}
              </div>

              {/* Doctors Grid */}
              <div className="mn-doctors-grid">
                {filteredDoctors.map(doc => (
                  <div className="mn-doctor-card-item" key={doc.id}>
                    <div className="mn-doc-top">
                      <div className="mn-doc-avatar-wrap">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="mn-doc-avatar-photo"
                          loading="eager"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.dataset.tried) {
                              target.dataset.tried = "true";
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0d9488&color=fff&size=200&bold=true`;
                            }
                          }}
                        />
                        <div className="mn-doc-online-badge" title="Active on duty / OPD Available" />
                      </div>
                      <div className="mn-doc-title-group">
                        <div className="mn-doc-header-row">
                          <h4>{doc.name}</h4>
                          <span className="mn-doc-spec-badge">{doc.specialty}</span>
                        </div>
                        <div className="mn-doc-qual">{doc.qualifications}</div>
                        <div className="mn-doc-rating-row">
                          <Star size={14} fill="#d97706" color="#d97706" />
                          <span className="mn-doc-rating-num">{doc.rating}</span>
                          <span className="mn-doc-reviews-count">({doc.reviews} verified reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mn-doc-info-chips">
                      <div className="mn-doc-chip">
                        <span className="mn-doc-chip-label">Experience</span>
                        <strong className="mn-doc-chip-val">{doc.experience}</strong>
                      </div>
                      <div className="mn-doc-chip mn-doc-chip-fee">
                        <span className="mn-doc-chip-label">Consultation Fee</span>
                        <strong className="mn-doc-chip-val">{doc.fee}</strong>
                      </div>
                    </div>

                    <div className="mn-doc-schedule-card">
                      <div className="mn-doc-schedule-item">
                        <Clock size={13} className="mn-doc-schedule-icon" />
                        <span>OPD Hours: <strong>{doc.hours}</strong></span>
                      </div>
                      <div className="mn-doc-schedule-item">
                        <Stethoscope size={13} className="mn-doc-schedule-icon" />
                        <span className="mn-doc-wing-text">{doc.wing}</span>
                      </div>
                    </div>

                    <div className="mn-doc-actions-row">
                      <button
                        type="button"
                        className="mn-doc-card-btn mn-doc-btn-secondary"
                        onClick={() => setIsDoctorProfileOpen(doc)}
                      >
                        Doctor Profile
                      </button>
                      <button
                        type="button"
                        className="mn-doc-card-btn mn-doc-btn-primary"
                        onClick={() => {
                          setSelectedDoctorForBooking(doc.name);
                          setIsBookingOpen(true);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 3: AI APPOINTMENT BOOKING AGENT
              ============================================================ */}
          {activeTab === "book" && (
            <div style={{ marginBottom: 30 }}>
              <AiAppointmentBooking
                onBookingSuccess={(newApt) => {
                  setAppointments([newApt, ...appointments]);
                  setActiveTab("appointments");
                }}
              />
            </div>
          )}

          {/* ============================================================
              TAB 4: MY APPOINTMENTS
              ============================================================ */}
          {activeTab === "appointments" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div className="mn-section-heading" style={{ margin: 0 }}>
                  <h2>My Appointments ({appointments.length})</h2>
                  <p>Confirmed appointments, consultation mode, and virtual telehealth room:</p>
                </div>
                <button
                  type="button"
                  className="mn-btn-pill-dark"
                  onClick={() => setIsBookingOpen(true)}
                >
                  <Plus size={15} /> Book New Appointment
                </button>
              </div>

              <div className="mn-data-table-wrap">
                <table className="mn-data-table">
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Doctor</th>
                      <th>Specialty</th>
                      <th>Date &amp; Time</th>
                      <th>Consultation Mode &amp; Clinic</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id}>
                        <td>
                          <strong>{apt.id}</strong>
                        </td>
                        <td>{apt.doctor}</td>
                        <td>{apt.specialty}</td>
                        <td>
                          {apt.date} · {apt.time}
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {apt.type.includes("Online") ? <Video size={13} color="#0d9488" /> : <Stethoscope size={13} color="#2563eb" />}
                            {apt.type}
                          </span>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{apt.wing}</div>
                        </td>
                        <td>
                          <span
                            className={`mn-status-pill ${
                              apt.status === "Confirmed"
                                ? "mn-status-confirmed"
                                : apt.status === "Completed"
                                ? "mn-status-completed"
                                : apt.status === "Cancelled"
                                ? "mn-status-cancelled"
                                : "mn-status-pending"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {apt.status !== "Cancelled" ? (
                              <>
                                {apt.type.includes("Online") && apt.status === "Confirmed" && (
                                  <button
                                    type="button"
                                    className="mn-doc-card-btn"
                                    style={{ padding: "4px 10px", fontSize: 11, width: "auto" }}
                                    onClick={() => setIsTelehealthOpen(true)}
                                  >
                                    Join Video
                                  </button>
                                )}
                                <button
                                  type="button"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#0d9488",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontSize: 12,
                                  }}
                                  onClick={() => toast.success(`Appointment receipt for ${apt.id} downloaded.`)}
                                >
                                  Download Slip
                                </button>
                                <button
                                  type="button"
                                  className="mn-btn-table-cancel"
                                  onClick={() => setCancellingAppointment(apt)}
                                  title="Cancel this appointment"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, fontStyle: "italic" }}>
                                Cancelled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 5: MEDICAL TIMELINE (EHR)
              ============================================================ */}
          {activeTab === "timeline" && (
            <div>
              <div className="mn-section-heading">
                <h2>Patient Medical Timeline &amp; EHR ({timelineRecords.length} Records)</h2>
                <p>Comprehensive health record history, diagnostic milestones, and clinical notes:</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {timelineRecords.map(rec => (
                  <div className="mn-dashboard-card" key={rec.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong style={{ fontSize: 15, color: "#0f172a" }}>{rec.title}</strong>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{rec.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 700, marginBottom: 8 }}>
                      {rec.doctor} · {rec.dept}
                    </div>
                    <p style={{ fontSize: 13, color: "#334155", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                      {rec.notes}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 8, fontSize: 11.5, color: "#64748b" }}>
                      <span>{rec.vitals}</span>
                      <span className="mn-status-pill mn-status-confirmed">{rec.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 6: PRESCRIPTIONS & PILL TRACKER
              ============================================================ */}
          {activeTab === "prescriptions" && (
            <div>
              <div className="mn-section-heading">
                <h2>Digital Prescriptions ({prescriptions.length}) &amp; Daily Pill Schedule</h2>
                <p>Track adherence to daily medications and run HT-01 safety audits:</p>
              </div>

              {/* Daily Pill Schedule Box */}
              <div className="mn-dashboard-card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: 16, color: "#0f172a" }}>Today's Pill Adherence</h3>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {pillSchedule.filter(p => p.taken).length} of {pillSchedule.length} medications taken today
                    </span>
                  </div>
                  <span className="mn-status-pill mn-status-confirmed">
                    {Math.round((pillSchedule.filter(p => p.taken).length / pillSchedule.length) * 100)}% Adherence
                  </span>
                </div>

                <div className="mn-pill-schedule-list">
                  {pillSchedule.map(pill => (
                    <div key={pill.id} className={`mn-pill-schedule-item ${pill.taken ? "taken" : ""}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={pill.taken}
                          onChange={() => togglePill(pill.id)}
                        />
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a" }}>{pill.name}</strong>
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>
                            {pill.time} · {pill.meal}
                          </div>
                        </div>
                      </label>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pill.taken ? "#0d9488" : "#94a3b8" }}>
                        {pill.taken ? "✓ Taken" : "Due"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Prescriptions List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {prescriptions.map(rx => (
                  <div className="mn-dashboard-card" key={rx.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: 16, color: "#0f172a" }}>Prescription #{rx.id}</h3>
                        <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 700 }}>
                          Issued by {rx.doctor} ({rx.specialty}) · {rx.date}
                        </div>
                      </div>
                      <span className={`mn-status-pill ${rx.status.includes("Active") ? "mn-status-confirmed" : "mn-status-pending"}`}>
                        {rx.status}
                      </span>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 4 }}>
                      {rx.medicines.map((m, idx) => (
                        <div key={idx} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <Pill size={16} color="#0d9488" />
                            <strong style={{ fontSize: 14, color: "#0f172a" }}>{m.name}</strong>
                          </div>
                          <div style={{ fontSize: 12.5, color: "#475569", marginLeft: 26, lineHeight: 1.5 }}>
                            <div><strong>Dosage:</strong> {m.dose} ({m.time}) · {m.meal}</div>
                            <div><strong>Duration:</strong> {m.duration}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, fontStyle: "italic" }}>
                        Instructions: {rx.instructions}
                      </div>
                      <div style={{ fontSize: 12, color: "#0d9488", marginTop: 4, fontWeight: 600 }}>
                        Next Follow-up: {rx.followUp}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className="mn-doc-card-btn"
                        style={{ width: "auto" }}
                        onClick={() => toast.success(`Prescription ${rx.id} downloaded as PDF`)}
                      >
                        Download Digital Copy
                      </button>
                      <button
                        type="button"
                        className="mn-doc-card-btn"
                        style={{ width: "auto", background: "#ffffff", borderColor: "#0d9488", color: "#0d9488" }}
                        onClick={() => setActiveTab("verifier")}
                      >
                        Check Medicine Safety with HT-01 →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 7: AI MEDICINE VERIFIER (HT-01 SIMPLIFIED)
              ============================================================ */}
          {activeTab === "verifier" && (
            <div style={{ marginBottom: 30 }}>
              <SimplifiedRxSafety patientName={userName} />
            </div>
          )}

          {/* ============================================================
              TAB 8: AI REPORT SIMPLIFIER (HT-02 SIMPLIFIED)
              ============================================================ */}
          {activeTab === "simplifier" && (
            <div style={{ marginBottom: 30 }}>
              <SimplifiedReportSimplifier patientName={userName} />
            </div>
          )}

          {/* ============================================================
              TAB 9: MY REVIEWS
              ============================================================ */}
          {activeTab === "reviews" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div className="mn-section-heading" style={{ margin: 0 }}>
                  <h2>Patient Reviews &amp; Clinical Feedback ({reviews.length})</h2>
                  <p>Verified ratings and feedback for MEDNEXUS attending doctors:</p>
                </div>
                <button
                  type="button"
                  className="mn-btn-pill-dark"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Star size={15} /> Write a Doctor Review
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {reviews.map(rev => (
                  <div className="mn-dashboard-card" key={rev.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <strong style={{ fontSize: 15, color: "#0f172a" }}>{rev.doctor}</strong>
                        <span style={{ fontSize: 12, color: "#0d9488", marginLeft: 8 }}>{rev.specialty}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{rev.date}</span>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="#d97706" color="#d97706" />
                      ))}
                    </div>
                    <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 10: BED & ICU ENQUIRIES
              ============================================================ */}
          {activeTab === "beds" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div className="mn-section-heading" style={{ margin: 0 }}>
                  <h2>Hospital Bed &amp; ICU Inpatient Capacity ({wardList.length} Departments)</h2>
                  <p>Live departmental bed breakdown for MEDNEXUS General Hospital:</p>
                </div>
                <button
                  type="button"
                  className="mn-btn-pill-dark"
                  onClick={() => setIsBedBookingOpen(true)}
                >
                  <Bed size={15} /> Request Inpatient Admission
                </button>
              </div>

              {/* 6 Departmental Bed Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 20 }}>
                {wardList.map(ward => (
                  <div className="mn-dashboard-card" key={ward.id}>
                    <div className={`mn-card-eyebrow ${ward.name.includes("ICU") ? "purple" : "teal"}`}>
                      {ward.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: ward.name.includes("ICU") ? "#7e22ce" : "#0f766e", margin: "4px 0" }}>
                      {ward.occupied} / {ward.capacity} Beds
                    </div>
                    <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 700, marginBottom: 4 }}>
                      {ward.available} Beds Available
                    </div>
                    <p className="mn-card-body-text" style={{ fontSize: 12, marginBottom: 8 }}>
                      {ward.type}
                    </p>
                    <div style={{ fontSize: 11, color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                      {ward.wing} · Nurse: {ward.nurse}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 11: AMBULANCE ASSISTANCE
              ============================================================ */}
          {activeTab === "ambulance" && (
            <div>
              <div className="mn-section-heading">
                <h2>Emergency Ambulance GPS Dispatch ({ambulanceFleet.length} Units)</h2>
                <p>24/7 Advanced Cardiac Life Support (ACLS) and GPS Fleet Coordination:</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
                {/* Live Radar Dispatch Screen */}
                <div className="mn-dashboard-card">
                  <div className="mn-ambulance-map-stage">
                    <div className="mn-radar-pulse" />
                    <div style={{ zIndex: 2, textAlign: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#dc2626", color: "#ffffff", display: "grid", placeItems: "center", margin: "0 auto 8px" }}>
                        <Ambulance size={24} />
                      </div>
                      <strong style={{ color: "#ffffff", fontSize: 15, display: "block" }}>UNIT AMB-04 · ACLS AMBULANCE</strong>
                      <span style={{ color: "#5eead4", fontSize: 12, fontWeight: 700 }}>LIVE ON GPS DISPATCH ROUTE · ETA 6 MINS</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>AMBULANCE FLEET ID</div>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>MED-AMB-04 (Advanced ALS)</strong>
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>CURRENT DISTANCE</div>
                      <strong style={{ fontSize: 14, color: "#0d9488" }}>2.4 km away · ETA ~6 mins</strong>
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>ON-BOARD PARAMEDIC</div>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>Vikram Joshi (Senior EMT)</strong>
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>EQUIPMENT ON-BOARD</div>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>Defibrillator, O2, Ventilator</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      type="button"
                      className="mn-btn-pill-dark"
                      style={{ background: "#dc2626", borderColor: "#b91c1c" }}
                      onClick={() => toast.success("Emergency SOS Signal Broadcasted! Unit AMB-04 dispatched to your location.")}
                    >
                      <PhoneCall size={15} /> Emergency SOS Dispatch (108 / 112)
                    </button>
                    <button
                      type="button"
                      className="mn-btn-pill-outline"
                      onClick={() => toast.info("Coordinates pinged: Fleet coordinator connected.")}
                    >
                      Share Live GPS Coordinates
                    </button>
                  </div>
                </div>

                {/* Fleet Roster */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ambulanceFleet.map(amb => (
                    <div className="mn-dashboard-card" key={amb.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <strong style={{ fontSize: 14, color: "#0f172a" }}>{amb.id}</strong>
                          <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 700 }}>{amb.type}</div>
                        </div>
                        <span className={`mn-status-pill ${amb.status.includes("Active") ? "mn-status-pending" : "mn-status-confirmed"}`}>
                          {amb.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                        <div><strong>Driver:</strong> {amb.driver} · <strong>Paramedic:</strong> {amb.paramedic}</div>
                        <div><strong>Contact:</strong> {amb.contact}</div>
                        <div><strong>Equipment:</strong> {amb.equipment}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 12: BILLS & RECEIPTS
              ============================================================ */}
          {activeTab === "bills" && (
            <div>
              <div className="mn-section-heading">
                <h2>Hospital Bills &amp; Itemized Receipts ({billsList.length} Invoices)</h2>
                <p>Itemized hospital invoices, payment receipts, and cashless insurance pre-authorization:</p>
              </div>

              <div className="mn-data-table-wrap">
                <table className="mn-data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Service Description</th>
                      <th>Attending Clinician</th>
                      <th>Billing Date</th>
                      <th>Amount &amp; GST</th>
                      <th>Payment Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billsList.map(bill => (
                      <tr key={bill.id}>
                        <td>
                          <strong>{bill.id}</strong>
                        </td>
                        <td>{bill.service}</td>
                        <td>{bill.provider}</td>
                        <td>{bill.date}</td>
                        <td>
                          <strong>{bill.total}</strong>
                          <div style={{ fontSize: 10, color: "#64748b" }}>GST: {bill.gst}</div>
                        </td>
                        <td>
                          <span className="mn-status-pill mn-status-confirmed">{bill.status}</span>
                          <div style={{ fontSize: 10, color: "#64748b" }}>{bill.method}</div>
                        </td>
                        <td>
                          <button
                            type="button"
                            style={{ background: "none", border: "none", color: "#0d9488", fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                            onClick={() => setIsBillInvoiceOpen(bill)}
                          >
                            View &amp; Print Tax Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 13: OFFLINE HEALTH RECORDS (HT-03 SIMPLIFIED)
              ============================================================ */}
          {activeTab === "offline" && (
            <div style={{ marginBottom: 30 }}>
              <SimplifiedOfflineSync />
            </div>
          )}
        </main>
      </div>
      )}

      {/* ============================================================
          BOOKING MODAL
          ============================================================ */}
      {isBookingOpen && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsBookingOpen(false);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 520 }}>
            <div className="mn-evaluator-modal-header">
              <h3>Book Doctor Appointment</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setIsBookingOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
              Atomic schedule reservation with instant real-time doctor availability check:
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button
                type="button"
                className={`mn-filter-pill-btn ${modalBookingTab === "standard" ? "active" : ""}`}
                onClick={() => setModalBookingTab("standard")}
              >
                Standard Form
              </button>
              <button
                type="button"
                className={`mn-filter-pill-btn ${modalBookingTab === "ai" ? "active" : ""}`}
                onClick={() => setModalBookingTab("ai")}
              >
                <Sparkles size={13} style={{ display: "inline", marginRight: 4 }} /> AI Voice &amp; Document Agent
              </button>
            </div>

            {modalBookingTab === "ai" ? (
              <AiAppointmentBooking
                onBookingSuccess={newApt => {
                  setAppointments([newApt, ...appointments]);
                  setIsBookingOpen(false);
                  setActiveTab("appointments");
                }}
                onCancel={() => setIsBookingOpen(false)}
              />
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div className="mn-form-group">
                  <label className="mn-form-label">Selected Doctor</label>
                  <select
                    value={selectedDoctorForBooking}
                    onChange={e => setSelectedDoctorForBooking(e.target.value)}
                    className="mn-input-control"
                    style={{ paddingLeft: 14 }}
                  >
                    {ALL_DOCTORS.map(doc => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name} · {doc.specialty} ({doc.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="mn-form-group">
                    <label className="mn-form-label">Consultation Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="mn-input-control"
                      style={{ paddingLeft: 14 }}
                    />
                  </div>

                  <div className="mn-form-group">
                    <label className="mn-form-label">Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      className="mn-input-control"
                      style={{ paddingLeft: 14 }}
                    >
                      {["09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM"].map(t => (
                        <option key={t} value={t}>
                          {t} (Available)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mn-form-group">
                  <label className="mn-form-label">Consultation Mode</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className={`mn-filter-pill-btn ${consultType === "In-Person" ? "active" : ""}`}
                      onClick={() => setConsultType("In-Person")}
                    >
                      In-Person Hospital Visit
                    </button>
                    <button
                      type="button"
                      className={`mn-filter-pill-btn ${consultType === "Online" ? "active" : ""}`}
                      onClick={() => setConsultType("Online")}
                    >
                      Online Telehealth Video
                    </button>
                  </div>
                </div>

                <div className="mn-form-group">
                  <label className="mn-form-label">Reason for Visit / Symptoms</label>
                  <input
                    type="text"
                    required
                    value={bookingReason}
                    onChange={e => setBookingReason(e.target.value)}
                    placeholder="e.g. Blood pressure monitoring, chest discomfort, routine review"
                    className="mn-input-control"
                    style={{ paddingLeft: 14 }}
                  />
                </div>

                <button type="submit" className="mn-btn-submit-green">
                  Confirm &amp; Book Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          ZAPIA AI ASSISTANT SLIDE-OVER DRAWER
          ============================================================ */}
      {isZapiaOpen && (
        <div
          className="mn-zapia-drawer-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsZapiaOpen(false);
          }}
        >
          <div className="mn-zapia-drawer">
            <div className="mn-zapia-drawer-header">
              <div className="mn-zapia-header-left">
                <PhoneCall size={18} color="#2dd4bf" />
                <h3>ZAPIA Clinical AI Assistant</h3>
                <span className="mn-zapia-badge-online">LIVE HOTLINE</span>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
                onClick={() => setIsZapiaOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="mn-zapia-chat-messages">
              {zapiaMessages.map((msg, index) => (
                <div key={index} className={`mn-chat-bubble ${msg.sender}`}>
                  <div>{msg.text}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
                </div>
              ))}

              {isZapiaThinking && (
                <div className="mn-chat-bubble ai" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontStyle: "italic", opacity: 0.85 }}>
                  <Loader2 size={13} className="animate-spin" /> ZAPIA is analyzing clinically...
                </div>
              )}

              {/* Quick Prompt Chips */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Suggested Questions:</div>
                <div className="mn-zapia-chips-row">
                  <button
                    type="button"
                    className="mn-zapia-chip"
                    onClick={() => handleSendZapia("Is Combiflam safe with Dolo 650?")}
                  >
                    💊 Is Combiflam safe with Dolo 650?
                  </button>
                  <button
                    type="button"
                    className="mn-zapia-chip"
                    onClick={() => handleSendZapia("Explain my HbA1c 9.4% reading")}
                  >
                    📊 Explain my HbA1c 9.4% reading
                  </button>
                  <button
                    type="button"
                    className="mn-zapia-chip"
                    onClick={() => handleSendZapia("Check my blood pressure vitals")}
                  >
                    🩺 Check my blood pressure vitals
                  </button>
                  <button
                    type="button"
                    className="mn-zapia-chip"
                    onClick={() => handleSendZapia("Book follow-up with Dr. Om Mishra")}
                  >
                    📅 Book follow-up with Dr. Om Mishra
                  </button>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="mn-zapia-chat-input-bar">
              <input
                type="text"
                value={zapiaInput}
                onChange={e => setZapiaInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSendZapia();
                }}
                placeholder="Ask clinical question, medicine safety, report translation..."
                className="mn-input-control"
                style={{ paddingLeft: 14 }}
              />
              <button
                type="button"
                className="mn-btn-submit-green"
                style={{ width: "auto", padding: "0 18px", marginTop: 0 }}
                onClick={() => handleSendZapia()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          VIRTUAL TELEHEALTH VIDEO CONSULTATION MODAL
          ============================================================ */}
      {isTelehealthOpen && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsTelehealthOpen(false);
          }}
        >
          <div className="mn-telehealth-modal">
            {/* Video Stage */}
            <div className="mn-telehealth-video-stage">
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#0d9488",
                    color: "#ffffff",
                    fontSize: 24,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 12px",
                    boxShadow: "0 0 0 6px rgba(13, 148, 136, 0.25)",
                  }}
                >
                  OM
                </div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 18, color: "#ffffff" }}>Dr. Om Mishra (MD, DM)</h3>
                <span style={{ fontSize: 12, color: "#5eead4", fontWeight: 700 }}>CARDIO CLINIC · ENCRYPTED WEBRTC HD VIDEO</span>
                <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                  Connected with patient Vittika Bairathi (ID: PAT-011)
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="mn-telehealth-controls">
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="mn-btn-pill-dark"
                  style={{ background: isMicOn ? "#1e293b" : "#dc2626" }}
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? <Mic size={15} /> : <MicOff size={15} />} {isMicOn ? "Mute" : "Unmute"}
                </button>
                <button
                  type="button"
                  className="mn-btn-pill-dark"
                  style={{ background: isVideoOn ? "#1e293b" : "#dc2626" }}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video size={15} /> : <VideoOff size={15} />} {isVideoOn ? "Stop Video" : "Start Video"}
                </button>
              </div>

              <button
                type="button"
                className="mn-btn-pill-dark"
                style={{ background: "#dc2626", borderColor: "#b91c1c" }}
                onClick={() => {
                  setIsTelehealthOpen(false);
                  toast.info("Telehealth consultation session ended.");
                }}
              >
                End Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DOCTOR PROFILE MODAL
          ============================================================ */}
      {isDoctorProfileOpen && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsDoctorProfileOpen(null);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 540 }}>
            <div className="mn-evaluator-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="mn-doc-avatar-container" style={{ width: 68, height: 68, border: "3px solid #0d9488" }}>
                  <img
                    src={isDoctorProfileOpen.image}
                    alt={isDoctorProfileOpen.name}
                    className="mn-doc-avatar-photo"
                    style={{ width: "100%", height: "100%" }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.tried) {
                        target.dataset.tried = "true";
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isDoctorProfileOpen.name)}&background=0d9488&color=fff&size=160&bold=true`;
                      }
                    }}
                  />
                  <div className="mn-doc-avatar-fallback" style={{ width: "100%", height: "100%", fontSize: 22 }}>
                    {isDoctorProfileOpen.name.split(" ")[1]?.[0] || "D"}
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{isDoctorProfileOpen.name}</h3>
                  <div style={{ fontSize: 13, color: "#0d9488", fontWeight: 700 }}>{isDoctorProfileOpen.specialty}</div>
                </div>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setIsDoctorProfileOpen(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ margin: "18px 0", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#334155" }}>
              <div><strong>Registration:</strong> {isDoctorProfileOpen.nmc} (Verified NMC Council)</div>
              <div><strong>Qualifications:</strong> {isDoctorProfileOpen.qualifications}</div>
              <div><strong>Hospital Wing:</strong> {isDoctorProfileOpen.wing}</div>
              <div><strong>Clinical Experience:</strong> {isDoctorProfileOpen.experience} of dedicated patient practice</div>
              <div><strong>Consultation Fee:</strong> {isDoctorProfileOpen.fee}</div>
              <div><strong>Daily OPD Timings:</strong> {isDoctorProfileOpen.hours}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d97706", fontWeight: 700 }}>
                <Star size={14} fill="#d97706" /> Patient Satisfaction Rating: {isDoctorProfileOpen.rating} / 5.0 ({isDoctorProfileOpen.reviews} verified patient reviews)
              </div>
            </div>

            <button
              type="button"
              className="mn-btn-submit-green"
              onClick={() => {
                setSelectedDoctorForBooking(isDoctorProfileOpen.name);
                setIsDoctorProfileOpen(null);
                setIsBookingOpen(true);
              }}
            >
              Book Appointment with {isDoctorProfileOpen.name}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          WRITE REVIEW MODAL
          ============================================================ */}
      {isReviewModalOpen && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsReviewModalOpen(false);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 480 }}>
            <div className="mn-evaluator-modal-header">
              <h3>Write a Doctor Review</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setIsReviewModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddReview} style={{ marginTop: 14 }}>
              <div className="mn-form-group">
                <label className="mn-form-label">Select Clinician</label>
                <select
                  value={reviewDoctor}
                  onChange={e => setReviewDoctor(e.target.value)}
                  className="mn-input-control"
                  style={{ paddingLeft: 14 }}
                >
                  {ALL_DOCTORS.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mn-form-group">
                <label className="mn-form-label">Rating</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star size={24} fill={star <= reviewRating ? "#d97706" : "none"} color="#d97706" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mn-form-group">
                <label className="mn-form-label">Your Clinical Experience &amp; Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share details regarding diagnosis explanation, bedside manner, and clinical care..."
                  className="mn-input-control"
                  style={{ height: "auto", padding: "10px 14px" }}
                />
              </div>

              <button type="submit" className="mn-btn-submit-green">
                Submit Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          BED RESERVATION MODAL
          ============================================================ */}
      {isBedBookingOpen && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsBedBookingOpen(false);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 480 }}>
            <div className="mn-evaluator-modal-header">
              <h3>Request Inpatient Bed Admission</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setIsBedBookingOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                setIsBedBookingOpen(false);
                toast.success("Inpatient admission enquiry submitted! Admissions coordinator notified.");
              }}
              style={{ marginTop: 14 }}
            >
              <div className="mn-form-group">
                <label className="mn-form-label">Ward Department</label>
                <select className="mn-input-control" style={{ paddingLeft: 14 }}>
                  {wardList.map(w => (
                    <option key={w.id}>
                      {w.name} ({w.available} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mn-form-group">
                <label className="mn-form-label">Room Category</label>
                <select className="mn-input-control" style={{ paddingLeft: 14 }}>
                  <option>Deluxe Private Room</option>
                  <option>Twin Sharing Semi-Private</option>
                  <option>General Ward</option>
                  <option>ICU Critical Care Bed</option>
                </select>
              </div>

              <div className="mn-form-group">
                <label className="mn-form-label">Admitting Clinical Diagnosis / Symptoms</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unstable angina, observation post-procedure, fever"
                  className="mn-input-control"
                  style={{ paddingLeft: 14 }}
                />
              </div>

              <button type="submit" className="mn-btn-submit-green">
                Confirm Admission Enquiry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          TAX INVOICE DETAILS MODAL
          ============================================================ */}
      {isBillInvoiceOpen && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setIsBillInvoiceOpen(null);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 540 }}>
            <div className="mn-evaluator-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Receipt size={22} color="#0d9488" />
                <h3 style={{ margin: 0 }}>Tax Invoice {isBillInvoiceOpen.id}</h3>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setIsBillInvoiceOpen(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ margin: "18px 0", fontSize: 13, color: "#334155" }}>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>MEDNEXUS GENERAL HOSPITAL</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>GSTIN: {isBillInvoiceOpen.gstin} · Healthcare Services License #HSP-2026-081</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Patient: {userName} (ID: {patientId})</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span><strong>Service:</strong> {isBillInvoiceOpen.service}</span>
                <span>{isBillInvoiceOpen.amount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span><strong>Provider:</strong> {isBillInvoiceOpen.provider}</span>
                <span>Date: {isBillInvoiceOpen.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span><strong>GST Breakdown:</strong> {isBillInvoiceOpen.gst}</span>
                <span>Method: {isBillInvoiceOpen.method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", fontSize: 16, fontWeight: 800, color: "#0f766e" }}>
                <span>Total Amount Paid:</span>
                <span>{isBillInvoiceOpen.total}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="mn-btn-submit-green"
                style={{ margin: 0 }}
                onClick={() => {
                  toast.success(`Tax Invoice ${isBillInvoiceOpen.id} printed.`);
                  setIsBillInvoiceOpen(null);
                }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          1-CLICK EVALUATOR PERSONA SWITCHER MODAL
          ============================================================ */}
      {showEvaluatorModal && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setShowEvaluatorModal(false);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 640 }}>
            <div className="mn-evaluator-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Switch Evaluator Persona</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  Instant 1-click access to all 4 MEDNEXUS platform roles from the Manus review
                </p>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowEvaluatorModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              {/* Admin */}
              <button
                type="button"
                onClick={() => {
                  loginAs({
                    name: "Dr. Arvind Swaminathan",
                    email: "admin@mednexus.example",
                    role: "admin",
                    userType: "staff",
                    hospitalName: "MEDNEXUS General Hospital",
                  });
                  setShowRegionalOps(false);
                  setShowEvaluatorModal(false);
                  toast.success("Switched to Hospital Operations Console (Dr. Arvind Swaminathan)");
                }}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  border: isAdmin ? "2px solid #0d9488" : "1px solid #e2e8f0",
                  background: isAdmin ? "#f0fdfa" : "#ffffff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0d9488", background: "#ccfbf1", padding: "2px 8px", borderRadius: 4 }}>
                    HOSPITAL ADMIN
                  </span>
                  {isAdmin && <CheckCircle2 size={16} color="#0d9488" />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginTop: 8 }}>
                  Dr. Arvind Swaminathan
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Medical Director · 8 KPIs, Wards, Fleet, Billing, Staff &amp; Doctors
                </div>
              </button>

              {/* Staff */}
              <button
                type="button"
                onClick={() => {
                  loginAs({
                    name: "Sister Sarita Thomas",
                    email: "nurse001@mednexus.example",
                    role: "hospital",
                    userType: "staff",
                    hospitalName: "MEDNEXUS General Hospital",
                  });
                  setShowRegionalOps(false);
                  setShowEvaluatorModal(false);
                  toast.success("Switched to Staff Clinical Console (Sister Sarita Thomas)");
                }}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  border: isStaff ? "2px solid #0284c7" : "1px solid #e2e8f0",
                  background: isStaff ? "#f0f9ff" : "#ffffff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0284c7", background: "#e0f2fe", padding: "2px 8px", borderRadius: 4 }}>
                    HOSPITAL STAFF
                  </span>
                  {isStaff && <CheckCircle2 size={16} color="#0284c7" />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginTop: 8 }}>
                  Sister Sarita Thomas
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Duty Nurse · OPD Check-in, Bed Allocation, Shift Checklist
                </div>
              </button>

              {/* Doctor */}
              <button
                type="button"
                onClick={() => {
                  loginAs({
                    name: "Dr. Om Mishra",
                    email: "om.mishra@mednexus.example",
                    role: "doctor",
                    userType: "doctor",
                    hospitalName: "MEDNEXUS General Hospital",
                  });
                  setShowRegionalOps(false);
                  setShowEvaluatorModal(false);
                  toast.success("Switched to Doctor Command Station (Dr. Om Mishra)");
                }}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  border: isDoctor ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                  background: isDoctor ? "#f5f3ff" : "#ffffff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: 4 }}>
                    ATTENDING DOCTOR
                  </span>
                  {isDoctor && <CheckCircle2 size={16} color="#7c3aed" />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginTop: 8 }}>
                  Dr. Om Mishra
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Senior Cardiologist · Outpatient Queue, Rx Pad, Telehealth
                </div>
              </button>

              {/* Patient */}
              <button
                type="button"
                onClick={() => {
                  loginAs({
                    name: "Vittika Bairathi",
                    email: "vittikabairathi35@gmail.com",
                    role: "patient",
                    userType: "patient",
                    hospitalName: "MEDNEXUS General Hospital",
                  });
                  setShowRegionalOps(false);
                  setShowEvaluatorModal(false);
                  toast.success("Switched to Patient Portal (Vittika Bairathi)");
                }}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  border: (!isAdmin && !isStaff && !isDoctor) ? "2px solid #10b981" : "1px solid #e2e8f0",
                  background: (!isAdmin && !isStaff && !isDoctor) ? "#ecfdf5" : "#ffffff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#d1fae5", padding: "2px 8px", borderRadius: 4 }}>
                    PATIENT (PAT-011)
                  </span>
                  {(!isAdmin && !isStaff && !isDoctor) && <CheckCircle2 size={16} color="#059669" />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginTop: 8 }}>
                  Vittika Bairathi
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Patient Portal · 12 Modules, Timeline, AI Verifier, Vitals
                </div>
              </button>
            </div>

            {/* Regional Operations & Innovation Lab Banner */}
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                background: "linear-gradient(135deg, #071922 0%, #0d2836 100%)",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2dd4bf" }}>
                  REGIONAL OPERATIONS &amp; INNOVATION LAB
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  Digital Twin 82% capacity · 5 Connected Innovations · Emergency Exchange
                </div>
              </div>
              <button
                type="button"
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "#0d9488",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowRegionalOps(true);
                  setShowEvaluatorModal(false);
                }}
              >
                Launch Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          APPOINTMENT CANCELLATION MODAL
          ============================================================ */}
      {cancellingAppointment && (
        <div
          className="mn-evaluator-modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) setCancellingAppointment(null);
          }}
        >
          <div className="mn-evaluator-modal-content" style={{ maxWidth: 440 }}>
            <div className="mn-evaluator-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fee2e2", display: "grid", placeItems: "center" }}>
                  <AlertCircle size={18} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: 16 }}>Cancel Appointment</h3>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Booking Ref: #{cancellingAppointment.id}</span>
                </div>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setCancellingAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "16px 0" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                  {cancellingAppointment.doctor}
                </div>
                <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 600 }}>
                  {cancellingAppointment.specialty}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  📅 {cancellingAppointment.date} at {cancellingAppointment.time} · {cancellingAppointment.type}
                </div>
              </div>

              <div className="mn-form-group">
                <label className="mn-form-label">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="mn-input-control"
                  style={{ paddingLeft: 14 }}
                >
                  <option value="Schedule conflict / Personal emergency">Schedule conflict / Personal emergency</option>
                  <option value="Feeling better / Symptoms resolved">Feeling better / Symptoms resolved</option>
                  <option value="Want to reschedule to a later date">Want to reschedule to a later date</option>
                  <option value="Consulted another physician">Consulted another physician</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <p style={{ fontSize: 12, color: "#64748b", margin: "10px 0 0 0", lineHeight: 1.4 }}>
                Note: Cancellation frees your consultation slot for emergency hospital triage. If you paid an advance consultation fee, refund processing will be initiated automatically.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
              <button
                type="button"
                className="mn-doc-card-btn mn-doc-btn-secondary"
                onClick={() => setCancellingAppointment(null)}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="mn-doc-card-btn mn-btn-danger-confirm"
                onClick={handleConfirmCancelAppointment}
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
