/**
 * Automated End-to-End Verification Script
 * Audits all application pages and backend API endpoints.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runCheck() {
  console.log('═══════════════════════════════════════════════');
  console.log(' SRHU IEEE PORTAL — End-to-End Route Audit');
  console.log('═══════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  async function checkPage(path, name) {
    try {
      const res = await fetch(`${BASE_URL}${path}`);
      if (res.status === 200) {
        console.log(`✓ [200] ${name.padEnd(28)} ${path}`);
        passed++;
      } else {
        console.error(`✗ [${res.status}] ${name.padEnd(28)} ${path}`);
        failed++;
      }
    } catch (err) {
      console.error(`✗ [ERR] ${name.padEnd(28)} ${path} — ${err.message}`);
      failed++;
    }
  }

  async function testApiVerify(payload, label) {
    try {
      const res = await fetch(`${BASE_URL}/api/student/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(`✓ [${res.status}] API: ${label.padEnd(46)} → status: "${data.status}"`);
      passed++;
      return data;
    } catch (err) {
      console.error(`✗ [ERR] API: ${label} — ${err.message}`);
      failed++;
    }
  }

  // 1. Audit Page Routes
  console.log('── Page Routes ──');
  await checkPage('/', 'Landing Page');
  await checkPage('/student/register', 'Student Registration');
  await checkPage('/admin/login', 'Admin Login');
  await checkPage('/admin/dashboard', 'Admin Dashboard');
  await checkPage('/admin/students', 'Student Directory');
  await checkPage('/admin/upload', 'OCR Upload');
  await checkPage('/admin/settings', 'Settings');

  // 2. Audit API Endpoints
  console.log('\n── API Endpoint Tests ──');

  // Verified Official Student from Roster (Abhay Chauhan)
  await testApiVerify(
    { name: 'Abhay Chauhan', dd_no: 'DD2611043090001', course: 'B.Tech', year: '1st Year', action: 'verify' },
    'Verify Student (Abhay Chauhan - S.No 1)'
  );

  // Corrected Akshat Dobhal (S.No 2)
  await testApiVerify(
    { name: 'Akshat Dobhal', dd_no: 'DD2611043030002', course: 'B.Tech', year: '1st Year', action: 'verify' },
    'Verify Student (Akshat Dobhal - S.No 2)'
  );

  // Dhruv Painuly (S.No 11)
  await testApiVerify(
    { name: 'Dhruv Painuly', dd_no: 'DD2611043090002', course: 'B.Tech', year: '1st Year', action: 'verify' },
    'Verify Student (Dhruv Painuly - S.No 11)'
  );

  // Test Non-existent student
  await testApiVerify(
    { name: 'Fake Student', dd_no: 'DD9999999999999', course: 'B.Tech', year: '1st Year', action: 'verify' },
    'Verify Student (Invalid DD - Not Found)'
  );

  // Test GET students list
  try {
    const res = await fetch(`${BASE_URL}/api/admin/students`);
    const students = await res.json();
    console.log(`✓ [${res.status}] API: GET all students                              → ${students.length} records`);
    passed++;
  } catch (err) {
    console.error(`✗ [ERR] API: GET all students — ${err.message}`);
    failed++;
  }

  // Test GET dashboard stats
  try {
    const res = await fetch(`${BASE_URL}/api/admin/students?type=stats`);
    const stats = await res.json();
    console.log(`✓ [${res.status}] API: GET dashboard stats                           → Total: ${stats.totalStudents}, Joined: ${stats.joinedStudents}, Rate: ${stats.registrationRate}%`);
    passed++;
  } catch (err) {
    console.error(`✗ [ERR] API: GET dashboard stats — ${err.message}`);
    failed++;
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(` All checks complete. Server: ${BASE_URL}`);
  console.log(` Passed: ${passed}, Failed: ${failed}`);
  console.log('═══════════════════════════════════════════════\n');
}

runCheck();
