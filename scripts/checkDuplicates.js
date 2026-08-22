import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yzzfxoefwjrzbzxkqlnn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fB0CCFlfwiGFSg6Hqs3LPw_Mrg68Dv4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('🔍 Querying all cards from Supabase DB to check for duplicate words...');
  
  const { data: cards, error } = await supabase.from('cards').select('id, deck_id, word, meaning');
  
  if (error) {
    console.error('❌ Error fetching cards:', error);
    return;
  }

  console.log(`Total cards in Supabase DB: ${cards.length}`);

  // 1. Check duplicate within the same deck (Same deck_id + same word)
  const deckWordMap = new Map();
  const deckDuplicates = [];

  // 2. Check global duplicate words across all decks
  const globalWordMap = new Map();
  const globalDuplicates = [];

  for (const card of cards) {
    const normWord = card.word.trim().toLowerCase();
    const deckKey = `${card.deck_id}___${normWord}`;

    // Deck level
    if (deckWordMap.has(deckKey)) {
      deckDuplicates.push({ existing: deckWordMap.get(deckKey), duplicate: card });
    } else {
      deckWordMap.set(deckKey, card);
    }

    // Global level
    if (globalWordMap.has(normWord)) {
      globalDuplicates.push({ existing: globalWordMap.get(normWord), duplicate: card });
    } else {
      globalWordMap.set(normWord, card);
    }
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`- Unique words per deck: ${deckWordMap.size}`);
  console.log(`- Duplicate cards within the SAME DECK: ${deckDuplicates.length}`);
  console.log(`- Unique global words across all decks: ${globalWordMap.size}`);
  console.log(`- Total duplicate word occurrences across different decks: ${globalDuplicates.length}`);

  if (deckDuplicates.length > 0) {
    console.log(`\n⚠️ Sample duplicate cards in same deck:`);
    deckDuplicates.slice(0, 5).forEach(d => {
      console.log(`  Deck: ${d.duplicate.deck_id} | Word: "${d.duplicate.word}" (ID 1: ${d.existing.id}, ID 2: ${d.duplicate.id})`);
    });
  } else {
    console.log(`\n✅ NO duplicate words within the same deck!`);
  }

  if (globalDuplicates.length > 0) {
    console.log(`\nℹ️ Sample words appearing in multiple decks:`);
    globalDuplicates.slice(0, 5).forEach(g => {
      console.log(`  Word: "${g.duplicate.word}" | Deck 1: ${g.existing.deck_id} | Deck 2: ${g.duplicate.deck_id}`);
    });
  }
}

check().catch(console.error);
