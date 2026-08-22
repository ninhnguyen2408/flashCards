import fs from 'fs';

const html = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/65ebabab-19f2-46d2-bd0d-80c509efd613/.system_generated/steps/247/content.md', 'utf8');

const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
console.log('Total tables:', tables.length);

for (let i = 0; i < Math.min(10, tables.length); i++) {
  console.log(`\n=================== TABLE ${i} ===================`);
  const rows = tables[i].match(/<tr[\s\S]*?<\/tr>/gi) || [];
  console.log('Total Rows:', rows.length);
  rows.slice(0, 6).forEach((r, idx) => {
    const cells = (r.match(/<td[\s\S]*?<\/td>|<th[\s\S]*?<\/th>/gi) || []).map(c => 
      c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    );
    console.log(`Row ${idx}:`, cells);
  });
}
