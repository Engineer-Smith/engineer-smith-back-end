/**
 * Migration: Convert fill-in-the-blank codeTemplate placeholders
 * from ___blankId___ format to {{blankId}} format.
 *
 * Usage:
 *   node scripts/migrate-fib-to-curly-braces.js          # dry run (default)
 *   node scripts/migrate-fib-to-curly-braces.js --apply   # actually write changes
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://jordanburger22:9ibAWAvfaFCH78oo@cluster0.hazfttb.mongodb.net/engineersmith';

const DRY_RUN = !process.argv.includes('--apply');

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('engineersmith');
  const questions = db.collection('questions');

  console.log(DRY_RUN ? '=== DRY RUN (pass --apply to write) ===' : '=== APPLYING CHANGES ===');
  console.log('');

  const fibs = await questions.find({ type: 'fillInTheBlank' }).toArray();
  console.log(`Found ${fibs.length} fillInTheBlank questions\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const q of fibs) {
    const template = q.codeTemplate || '';
    const blanks = q.blanks || [];

    // Check if already migrated (has {{}} and no ___id___)
    const hasCurly = /\{\{\w+\}\}/.test(template);
    const hasUnderscore = /___[a-zA-Z][a-zA-Z0-9]*___/.test(template);

    if (hasCurly && !hasUnderscore) {
      skipped++;
      continue;
    }

    if (!hasUnderscore) {
      console.log(`  SKIP (no blanks in template): "${q.title}" (${q._id})`);
      skipped++;
      continue;
    }

    // Replace each ___blankId___ with {{blankId}}
    // Also handle malformed ___blankId__ (2 trailing underscores) found in some CSS questions
    let newTemplate = template.replace(/___([a-zA-Z][a-zA-Z0-9]*)_{2,3}/g, '{{$1}}');

    // Verify all blank IDs from the blanks array are present in the new template
    const missingBlanks = blanks.filter((b) => !newTemplate.includes(`{{${b.id}}}`));
    if (missingBlanks.length > 0) {
      console.log(`  ERROR: "${q.title}" (${q._id}) - missing blanks after conversion: ${missingBlanks.map((b) => b.id).join(', ')}`);
      errors++;
      continue;
    }

    // Count that we have the right number of placeholders
    const placeholderCount = (newTemplate.match(/\{\{\w+\}\}/g) || []).length;
    if (placeholderCount !== blanks.length) {
      console.log(`  WARN: "${q.title}" (${q._id}) - placeholder count (${placeholderCount}) != blanks count (${blanks.length})`);
    }

    console.log(`  ${DRY_RUN ? 'WOULD UPDATE' : 'UPDATING'}: "${q.title}" (${q._id})`);
    console.log(`    Before: ${template.substring(0, 100)}...`);
    console.log(`    After:  ${newTemplate.substring(0, 100)}...`);

    if (!DRY_RUN) {
      await questions.updateOne(
        { _id: q._id },
        { $set: { codeTemplate: newTemplate } },
      );
    }

    updated++;
  }

  console.log('');
  console.log('=== SUMMARY ===');
  console.log(`Total:   ${fibs.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors:  ${errors}`);

  if (DRY_RUN && updated > 0) {
    console.log('\nRun with --apply to write changes to the database.');
  }

  await client.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
