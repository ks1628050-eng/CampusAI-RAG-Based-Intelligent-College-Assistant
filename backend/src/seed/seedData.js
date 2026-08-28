import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { chunkText } from '../services/chunker.service.js';
import { vectorStore } from '../services/vectorStore.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleDocs = [
  {
    title: 'Admissions Guide & Eligibility 2026',
    category: 'Admissions',
    department: 'Admissions Office',
    content: `
# ADMISSIONS GUIDE & ELIGIBILITY CRITERIA 2026

## 1. Undergraduate Engineering Programs Offered
The institution offers 4-year Bachelor of Technology (B.Tech) degrees in:
- Computer Science & Engineering (Intake: 240 seats)
- Artificial Intelligence & Data Science (Intake: 120 seats)
- Electronics & Communication Engineering (Intake: 180 seats)
- Mechanical & Mechatronics Engineering (Intake: 120 seats)
- Civil & Sustainable Engineering (Intake: 60 seats)

## 2. Eligibility Criteria for B.Tech Admissions
Candidates applying for first-year B.Tech must satisfy the following:
- Must have passed 10+2 (Higher Secondary) examination with Physics and Mathematics as compulsory subjects along with Chemistry/Computer Science/Biology.
- Minimum 60% aggregate marks in PCM (55% for SC/ST/OBC/EWS candidates).
- Valid scorecard in JEE Main (2026), State Entrance Test (CET), or the Institutional Admission Exam (IAE).

## 3. Cutoff Ranks & Seat Allocation
- **Computer Science & Engineering**: JEE Main Percentile > 96.5% or State CET Rank under 2,500.
- **AI & Data Science**: JEE Main Percentile > 94.0% or State CET Rank under 4,800.
- **Electronics & Communication**: JEE Main Percentile > 89.0% or State CET Rank under 9,500.
- **Mechanical / Civil**: JEE Main Percentile > 78.0% or State CET Rank under 18,000.

## 4. Lateral Entry for Diploma Holders (Direct 2nd Year)
Candidates who hold a 3-year Engineering Diploma recognized by AICTE with a minimum aggregate score of 60% are eligible for direct admission to the 3rd semester (2nd Year) under the 10% lateral entry supernumerary quota.

## 5. Important Admissions Schedule 2026
- Application Portal Opens: May 15, 2026
- Application Deadline: June 30, 2026
- Round 1 Seat Allocation & Document Verification: July 5 - July 10, 2026
- Round 2 Counseling: July 15 - July 20, 2026
- Orientation & Commencement of Classes: August 5, 2026

## 6. Mandatory Documents for Verification
1. Class 10th and 12th Original Marksheets and Passing Certificates
2. Entrance Exam Scorecard (JEE Main / CET)
3. Transfer Certificate (TC) and Migration Certificate
4. Category / Caste / EWS Certificate (if applicable)
5. Aadhar Card or Government Photo ID
6. 6 recent passport-size colored photographs
7. Medical Fitness Certificate from an authorized medical practitioner.
`
  },
  {
    title: 'Fee Structure & Scholarships 2026',
    category: 'Fees & Scholarships',
    department: 'Finance Department',
    content: `
# INSTITUTIONAL FEE STRUCTURE & SCHOLARSHIPS 2026

## 1. Annual Academic Tuition Fee (B.Tech)
- **Tuition Fee**: INR 1,45,000 per annum (payable in two equal semester installments of INR 72,500).
- **Development & Laboratory Fee**: INR 25,000 per annum.
- **Student Activities & Cultural Fund**: INR 6,000 per annum.
- **Refundable Caution Deposit (One-time)**: INR 15,000 (Refundable upon course completion).
- **Total First Year Academic Fee**: INR 1,91,000.

## 2. Hostel & Residence Living Fees
- **Non-AC Twin Sharing Room**: INR 90,000 per academic year (including 4 meals/day mess charges).
- **AC Twin Sharing Room**: INR 1,20,000 per academic year.
- **Single Occupancy Room (3rd & 4th year only)**: INR 1,35,000 per academic year.
- **Hostel Security Deposit (Refundable)**: INR 10,000.

## 3. Institutional Merit Scholarships
The college provides extensive merit-based financial aid for undergraduate students:
- **Chairman's Merit Scholarship (100% Tuition Fee Waiver)**: Awarded to candidates securing JEE Main Percentile >= 98.0% or State CET Rank 1 - 200.
- **Dean's Excellence Scholarship (50% Tuition Fee Waiver)**: Awarded to candidates with JEE Main Percentile between 94.0% and 97.9%.
- **Academic Honors Scholarship (25% Tuition Fee Waiver)**: Awarded to candidates with JEE Main Percentile between 90.0% and 93.9%.
- **Sports & Cultural Laureate Award**: 30% to 50% tuition waiver for medal winners at National or International level games.
- **Need-Based EWS Assistance**: Up to 50% tuition fee reduction for students whose gross family income is below INR 3,00,000 per annum.

*Note: Merit scholarships require maintaining a minimum CGPA of 8.0 with zero active backlogs to renew annually.*

## 4. Fee Refund & Withdrawal Policy
- **Withdrawal 15 days before commencement of classes**: 100% refund of all fees paid, deducting a maximum of INR 1,000 as administrative processing charge.
- **Withdrawal within 15 days after class commencement**: 80% refund of tuition fee.
- **Withdrawal between 16 to 30 days after class commencement**: 50% refund of tuition fee.
- **Withdrawal beyond 30 days**: No tuition fee refund; caution deposit will be refunded in full.
`
  },
  {
    title: 'Hostel Rules & Campus Facilities',
    category: 'Hostel & Mess',
    department: 'Student Affairs',
    content: `
# HOSTEL RULES, MESS REGULATIONS & CAMPUS AMENITIES

## 1. Hostel Timings and Curfew Regulations
- **Weekday In-time (Monday to Friday)**: 9:30 PM sharp.
- **Weekend In-time (Saturday & Sunday)**: 10:30 PM sharp.
- Biometric facial recognition check-in is mandatory at hostel gates.
- First-year students are not permitted outside campus after 8:30 PM during their first semester.

## 2. Night Out and Leave Request Protocol
- Students wishing to stay overnight outside campus or visit home must apply through the **Student ERP Portal** at least 24 hours in advance.
- An automated SMS and Email authorization OTP is sent to the registered parent/guardian. Approval from the Chief Hostel Warden is mandatory.

## 3. Dining Hall & Mess Timings
- **Breakfast**: 07:30 AM - 09:00 AM
- **Lunch**: 12:30 PM - 02:00 PM
- **Evening Tea & Snacks**: 05:00 PM - 06:00 PM
- **Dinner**: 07:30 PM - 09:30 PM
- The mess serves both Vegetarian and Non-Vegetarian (3 days/week) cuisines with nutritional balanced menus managed by the Student Mess Committee.

## 4. Room Guidelines and Electrical Appliances
- Each room is furnished with a wooden cot, mattress, study desk, ergonomic chair, and built-in wardrobe.
- **Allowed Appliances**: Laptops, mobile chargers, study lamps.
- **Strictly Prohibited Appliances**: Electric induction stoves, room heaters, immersion water rods, and electric kettles. Unauthorized appliances will be confiscated with a fine of INR 2,000.
- High-speed campus Wi-Fi (100 Mbps per student) is provided 24/7.

## 5. Campus Healthcare & Emergency Assistance
- 24/7 On-campus Health Center with resident Medical Officer, 2 nursing staff, and 4-bed emergency ward.
- Dedicated 24/7 ambulance service on campus for tertiary care hospital transport.
- Emergency Medical Helpline: +91-98765-43210 (Extension 108).

## 6. Sports, Gym & Recreation Complex
- Olympic standard swimming pool (Timings: 06:00 AM - 08:30 AM & 04:30 PM - 07:30 PM).
- Multi-station air-conditioned gymnasium with dedicated fitness trainers.
- Floodlit basketball courts, volleyball arena, synthetic tennis courts, and full-size cricket/football stadium.
`
  },
  {
    title: 'Academic Regulations & Examination Guidelines',
    category: 'Exams & Academics',
    department: 'Academic Registrar',
    content: `
# ACADEMIC REGULATIONS, GRADING SYSTEM & EXAMINATION RULES

## 1. Mandatory Attendance Requirements
- Students must maintain a **minimum of 75% attendance** in every registered theory course, practical lab, and tutorial.
- **Medical Condonation**: Attendance between 65% and 74% can be condoned by the Dean of Academics solely on valid medical grounds, provided official medical hospital admission certificates are submitted within 5 working days of recovery.
- **Attendance < 65%**: The student will be awarded a "Not Permitted" (NP) grade and will NOT be allowed to appear in the Semester End Examinations (SEE). They must re-register for the course in subsequent semesters.

## 2. Evaluation Schema & Marks Weightage
- **Continuous Internal Evaluation (CIE) - 40% Weightage**:
  - Mid-Term Test 1: 15 Marks
  - Mid-Term Test 2: 15 Marks
  - Quizzes, Assignments, and Mini-Project: 10 Marks
- **Semester End Examination (SEE) - 60% Weightage**:
  - 3-hour comprehensive written exam covering the entire syllabus.
  - Minimum 40% marks required in SEE to pass the course.

## 3. 10-Point Letter Grading Scale
- **O (Outstanding)**: 90 - 100% (Grade Point: 10)
- **A+ (Excellent)**: 80 - 89% (Grade Point: 9)
- **A (Very Good)**: 70 - 79% (Grade Point: 8)
- **B+ (Good)**: 60 - 69% (Grade Point: 7)
- **B (Above Average)**: 55 - 59% (Grade Point: 6)
- **C (Average)**: 50 - 54% (Grade Point: 5)
- **P (Pass)**: 40 - 49% (Grade Point: 4)
- **F (Fail)**: Below 40% (Grade Point: 0)

## 4. Promotion Criteria & Backlogs Rule
- Minimum CGPA required for graduation is **5.0**.
- To be promoted to the 3rd Year (5th Semester), a student must have cleared at least 60% of 1st and 2nd year credits.
- **Supplementary / Fast-Track Examinations**: Conducted annually in July for students with backlog (F) grades. A student can appear for a maximum of 4 backlog courses in one supplementary session.

## 5. Script Re-evaluation and Review
- Students dissatisfied with their SEE grades can apply for an official photocopy of their evaluated answer sheet within 7 days of result publication by paying INR 500 per course.
- Formal challenge revaluation can be submitted within 10 days; if marks change by >= 15%, the revaluation fee is fully refunded.
`
  },
  {
    title: 'Placement & Internship Report 2025-2026',
    category: 'Placements',
    department: 'Career Development Centre',
    content: `
# CAREER DEVELOPMENT CENTRE: PLACEMENT & INTERNSHIP REPORT

## 1. Key Placement Highlights (2024-2025 Season)
- **Overall Placement Percentage**: 94.6% of registered eligible students placed.
- **Highest International Package**: INR 1.12 Crore per annum (Offered by Tokyo Tech Innovations).
- **Highest Domestic Package**: INR 48.5 LPA (Offered by Microsoft IDC).
- **Average Package (Overall)**: INR 9.8 LPA.
- **Average Package (Computer Science & AI/DS)**: INR 14.2 LPA.
- **Median CTC**: INR 8.2 LPA.
- **Total Recruiters Visited**: 180+ multinational corporations, unicorn startups, and research labs.
- **Total Job Offers Extended**: 740+ offers (including 120+ Dream and Super Dream offers > INR 15 LPA).

## 2. Top Prominent Recruiters
- **Tech Giants & Product Firms**: Google, Microsoft, Amazon, Cisco, Qualcomm, NVIDIA, Adobe, Oracle, Intuit, Uber, Atlassian.
- **Consulting & Financial Tech**: Goldman Sachs, Morgan Stanley, J.P. Morgan, Deloitte, PwC, McKinsey Digital.
- **Core Engineering & Automotive**: Texas Instruments, Mercedes-Benz R&D, Bosch, Larsen & Toubro, Tata Motors.
- **Enterprise IT & Cloud Services**: TCS, Infosys, Wipro, Cognizant, Capgemini.

## 3. Placement Eligibility Policy for Students
- Students must have a **minimum cumulative CGPA of 6.5** with NO active backlogs at the start of the 7th semester placement drive.
- 10th and 12th academic aggregate must be >= 65%.
- **One Student, One Dream Offer Policy**: Once a student receives a Dream Offer (>= INR 10 LPA), they are eligible to apply only for Super Dream tier companies (>= INR 20 LPA).

## 4. Mandatory Internship Guidelines
- Every student must complete a minimum **8-week industrial internship** during the summer vacation between the 6th and 7th semesters.
- Full-semester 8th Semester Internship is permitted for students who secure semester-long stipendiary industrial internships (minimum stipend INR 25,000/month).
- The Career Development Centre hosts the Annual Internship Fair in January for pre-final year students.
`
  }
];

export async function seedDatabase() {
  console.log('🌱 Starting database seed with preloaded college knowledge documents...');

  // 1. Seed Users (Demo Student and Admin)
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const studentPasswordHash = await bcrypt.hash('student123', salt);

  const adminUser = {
    id: 'user_admin_001',
    name: 'College Dean / Administrator',
    email: 'admin@campus.edu',
    passwordHash: adminPasswordHash,
    role: 'admin',
    department: 'Administration',
    createdAt: new Date().toISOString()
  };

  const studentUser = {
    id: 'user_student_001',
    name: 'Alex Johnson',
    email: 'student@campus.edu',
    passwordHash: studentPasswordHash,
    role: 'student',
    department: 'Computer Science',
    createdAt: new Date().toISOString()
  };

  if (!db.findOne('users', u => u.email === adminUser.email)) {
    db.insert('users', adminUser);
  }
  if (!db.findOne('users', u => u.email === studentUser.email)) {
    db.insert('users', studentUser);
  }

  // 2. Clear old chunks for sample docs if re-seeding
  for (const doc of sampleDocs) {
    const existingDoc = db.findOne('documents', d => d.title === doc.title);
    if (existingDoc) {
      vectorStore.deleteByDocId(existingDoc.id);
      db.delete('documents', d => d.id === existingDoc.id);
    }

    const docId = uuidv4();
    const chunks = chunkText(doc.content, {
      docId,
      title: doc.title,
      category: doc.category,
      department: doc.department
    }, 200, 40);

    await vectorStore.indexChunks(chunks);

    const docRecord = {
      id: docId,
      title: doc.title,
      originalName: `${doc.title.replace(/\s+/g, '_')}.txt`,
      filename: `${doc.title.replace(/\s+/g, '_')}.txt`,
      path: null,
      mimetype: 'text/plain',
      fileSize: Buffer.byteLength(doc.content, 'utf-8'),
      numPages: Math.ceil(doc.content.split(/\s+/).length / 300),
      chunkCount: chunks.length,
      category: doc.category,
      department: doc.department,
      status: 'Indexed',
      summary: `Official institutional guide covering ${doc.title} with updated 2026 regulations.`,
      uploadedBy: 'System Preload',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert('documents', docRecord);
    console.log(` Indexed "${doc.title}" -> ${chunks.length} chunks`);
  }

  console.log(` Total indexed chunks: ${vectorStore.getTotalChunkCount()}`);
  console.log(' Preloaded college knowledge base ready!');
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase().then(() => process.exit(0));
}
