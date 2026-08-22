import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deduplicate() {
  console.log('🧹 Cleaning duplicate cards from Supabase DB...');

  const { data: cards, error } = await supabase.from('cards').select('*').order('created_at', { ascending: true });

  if (error || !cards) {
    console.error('❌ Error fetching cards:', error);
    return;
  }

  console.log(`Original total cards in DB: ${cards.length}`);

  const seenMap = new Map();
  const idsToDelete = [];
  const uniqueCards = [];

  for (const card of cards) {
    const key = `${card.deck_id}___${card.word.trim().toLowerCase()}`;
    if (seenMap.has(key)) {
      idsToDelete.push(card.id);
    } else {
      seenMap.set(key, card);
      uniqueCards.push(card);
    }
  }

  console.log(`Found ${idsToDelete.length} duplicate cards to remove.`);

  if (idsToDelete.length > 0) {
    console.log(`Deleting ${idsToDelete.length} duplicate cards from Supabase...`);
    const { error: deleteError } = await supabase.from('cards').delete().in('id', idsToDelete);
    if (deleteError) {
      console.error('❌ Error deleting duplicates:', deleteError);
    } else {
      console.log('✅ Successfully removed all duplicate cards from Supabase!');
    }
  }

  const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true });
  console.log(`🎉 Total clean unique cards remaining in Supabase DB: ${count}`);

  // Also update public/datasets/vocab_3000_topics.json
  const datasetMap = new Map();
  const rawDataset = JSON.parse(fs.readFileSync('public/datasets/vocab_3000_topics.json', 'utf8'));
  const cleanDataset = [];

  for (const item of rawDataset) {
    const key = `${item.deckId || item.deck_id}___${item.word.trim().toLowerCase()}`;
    if (!datasetMap.has(key)) {
      datasetMap.set(key, item);
      cleanDataset.push(item);
    }
  }

  fs.writeFileSync('public/datasets/vocab_3000_topics.json', JSON.stringify(cleanDataset, null, 2), 'utf8');
  console.log(`📦 Saved clean dataset to public/datasets/vocab_3000_topics.json (${cleanDataset.length} unique cards)`);
}

deduplicate().catch(console.error);
