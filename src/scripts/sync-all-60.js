const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xngozasgwwbeqtkpfiul.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_103T9CwL7Oz79E-j3a4V7g_JFUZn-GA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sync60() {
  console.log('Reading public/IEEE_SRHU_All_60_Students.csv...');
  const csvPath = path.join(__dirname, '../../public/IEEE_SRHU_All_60_Students.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  
  // Header: S. No.,Registration Number,Student Name,Program,Year
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(s => s.trim());
    if (parts.length >= 5) {
      const [sno, dd_no, name, course, year] = parts;
      rows.push({
        name,
        dd_no: dd_no.toUpperCase(),
        course,
        year,
        section: 'A',
        join_status: 'not_joined',
        joined_at: null,
      });
    }
  }

  console.log(`Parsed ${rows.length} students from CSV.`);
  if (rows.length !== 60) {
    console.error(`Expected 60 students, found ${rows.length}!`);
    process.exit(1);
  }

  // Clear existing table and insert clean 60 records
  console.log('Deleting existing records in Supabase students table...');
  const { error: delError } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
    console.warn('Delete warning:', delError.message);
  }

  console.log('Inserting 60 validated student records...');
  const now = new Date().toISOString();
  const recordsToInsert = rows.map(r => ({
    ...r,
    created_at: now,
    updated_at: now,
  }));

  const { data: inserted, error: insError } = await supabase
    .from('students')
    .insert(recordsToInsert)
    .select();

  if (insError) {
    console.error('Insert error:', insError);
    process.exit(1);
  }

  console.log(`Successfully inserted ${inserted ? inserted.length : 60} students into Supabase!`);

  // Verify count
  const { data: verifyList, count } = await supabase
    .from('students')
    .select('*', { count: 'exact' });

  console.log(`Verified total count in Supabase: ${verifyList ? verifyList.length : count}`);
  
  // Verify specific corrected records
  const akshat = verifyList.find(s => s.name === 'Akshat Dobhal');
  const dhruv = verifyList.find(s => s.name === 'Dhruv Painuly');
  const kapish = verifyList.find(s => s.name === 'Kapish Rawat');
  const krishna = verifyList.find(s => s.name === 'Krishna Negi');
  const dwij = verifyList.find(s => s.name === 'Dwij Thapliyal');

  console.log('Verifications:');
  console.log('Akshat Dobhal:', akshat ? akshat.dd_no : 'NOT FOUND');
  console.log('Dhruv Painuly:', dhruv ? dhruv.dd_no : 'NOT FOUND');
  console.log('Kapish Rawat:', kapish ? kapish.dd_no : 'NOT FOUND');
  console.log('Krishna Negi:', krishna ? krishna.dd_no : 'NOT FOUND');
  console.log('Dwij Thapliyal:', dwij ? dwij.dd_no : 'NOT FOUND');
}

sync60().catch(err => {
  console.error(err);
  process.exit(1);
});
