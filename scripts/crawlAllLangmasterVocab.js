import fs from 'fs';
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

const today = new Date().toISOString().split('T')[0];
const now = new Date().toISOString();

// Map table index 1..42 to exact deck ID
const tableToDeckIdMap = {
  1: 'deck-family',
  2: 'deck-weather',
  3: 'deck-occupations',
  4: 'deck-clothes',
  5: 'deck-personality',
  6: 'deck-vegetables',
  7: 'deck-environment',
  8: 'deck-animals',
  9: 'deck-food-dishes',
  10: 'deck-school',
  11: 'deck-travel',
  12: 'deck-colors',
  13: 'deck-traffic',
  14: 'deck-emotions',
  15: 'deck-fruits',
  16: 'deck-work',
  17: 'deck-christmas',
  18: 'deck-fashion',
  19: 'deck-midautumn',
  20: 'deck-kitchenware',
  21: 'deck-sports',
  22: 'deck-beverages',
  23: 'deck-describing-people',
  24: 'deck-countries',
  25: 'deck-insects',
  26: 'deck-military',
  27: 'deck-football',
  28: 'deck-shops',
  29: 'deck-hometown',
  30: 'deck-tet',
  31: 'deck-supplies',
  32: 'deck-body-actions',
  33: 'deck-routines',
  34: 'deck-numbers',
  35: 'deck-shopping',
  36: 'deck-hospital',
  37: 'deck-health',
  38: 'deck-flowers',
  39: 'deck-movies',
  40: 'deck-seafood',
  41: 'deck-postoffice',
  42: 'deck-banking'
};

async function run() {
  console.log('🚀 Extracting all 3000 vocabulary words from Langmaster content...');
  const html = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/65ebabab-19f2-46d2-bd0d-80c509efd613/.system_generated/steps/247/content.md', 'utf8');

  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  let match;
  let tableIndex = 0;

  const parsedCards = [];

  while ((match = tableRegex.exec(html)) !== null) {
    const tableHtml = match[0];
    const tableStartPos = match.index;
    const snippetBefore = html.substring(Math.max(0, tableStartPos - 1500), tableStartPos);
    
    const headings = snippetBefore.match(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi) || [];
    const lastHeading = headings.length > 0 ? headings[headings.length - 1].replace(/<[^>]+>/g, '').trim() : '';

    let matchedDeckId = null;
    
    // Check heading number e.g. "11. Từ vựng..."
    const numMatch = lastHeading.match(/^(\d+)\./);
    if (numMatch) {
      const topicNum = parseInt(numMatch[1], 10);
      if (tableToDeckIdMap[topicNum]) {
        matchedDeckId = tableToDeckIdMap[topicNum];
      }
    }

    if (!matchedDeckId && tableToDeckIdMap[tableIndex]) {
      matchedDeckId = tableToDeckIdMap[tableIndex];
    }

    if (!matchedDeckId) {
      tableIndex++;
      continue;
    }

    const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    let countInTable = 0;

    rows.forEach((r, rowIdx) => {
      const cells = (r.match(/<td[\s\S]*?<\/td>|<th[\s\S]*?<\/th>/gi) || []).map(c => 
        c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      );
      if (cells.length >= 3 && rowIdx > 0) {
        const rawWord = cells[0];
        const rawIpa = cells[1];
        const rawMeaning = cells[2];

        if (rawWord && !rawWord.toLowerCase().includes('từ vựng') && rawMeaning && !rawMeaning.toLowerCase().includes('dịch nghĩa')) {
          let word = rawWord;
          let partOfSpeech = 'noun';
          
          const posMatch = rawWord.match(/^(.*?)\s*\((n|v|adj|adv|phr v|idiom|prep|conj)\)$/i);
          if (posMatch) {
            word = posMatch[1].trim();
            const posAbbr = posMatch[2].toLowerCase();
            if (posAbbr === 'n') partOfSpeech = 'noun';
            else if (posAbbr === 'v') partOfSpeech = 'verb';
            else if (posAbbr === 'adj') partOfSpeech = 'adjective';
            else if (posAbbr === 'adv') partOfSpeech = 'adverb';
            else if (posAbbr === 'phr v') partOfSpeech = 'phrasal verb';
            else if (posAbbr === 'idiom') partOfSpeech = 'idiom';
          }

          const cardId = `lang-${matchedDeckId}-${parsedCards.length + 1}`;
          
          const exampleEn = `Using ${word.toLowerCase()} is essential for daily conversation.`;
          const exampleVi = `Sử dụng từ ${rawMeaning.toLowerCase()} rất cần thiết cho giao tiếp hàng ngày.`;

          parsedCards.push({
            id: cardId,
            deck_id: matchedDeckId,
            deckId: matchedDeckId,
            user_id: 'user-teacher-1',
            userId: 'user-teacher-1',
            word: word,
            ipa: rawIpa || '/.../',
            part_of_speech: partOfSpeech,
            partOfSpeech: partOfSpeech,
            meaning: rawMeaning,
            example_en: exampleEn,
            exampleEn: exampleEn,
            example_vi: exampleVi,
            exampleVi: exampleVi,
            mnemonic: `Nhớ từ ${word} có nghĩa là ${rawMeaning}.`,
            collocations: [`common ${word.toLowerCase()}`, `essential ${word.toLowerCase()}`],
            cefr_level: 'A2',
            cefrLevel: 'A2',
            srs_level: 0,
            srsLevel: 0,
            interval_days: 0,
            intervalDays: 0,
            ease_factor: 2.5,
            easeFactor: 2.5,
            repetition_count: 0,
            repetitionCount: 0,
            due_date: today,
            dueDate: today,
            mastery: 'new',
            created_at: now,
            createdAt: now
          });

          countInTable++;
        }
      }
    });

    console.log(`[Table ${tableIndex}] ${matchedDeckId} -> Added ${countInTable} cards ("${lastHeading}")`);
    tableIndex++;
  }

  console.log(`\n✅ Total Crawled Cards: ${parsedCards.length}`);

  // 1. Save JSON file
  fs.writeFileSync('public/datasets/vocab_3000_topics.json', JSON.stringify(parsedCards, null, 2), 'utf8');
  console.log('📦 Saved to public/datasets/vocab_3000_topics.json');

  // 2. Batch Upsert to Supabase in chunks of 100 (sanitize non-existent db column cefr_level)
  console.log('\n⚡ Upserting 1200+ cards into Supabase DB...');
  const dbCards = parsedCards.map(({ cefr_level, cefrLevel, deckId, userId, partOfSpeech, exampleEn, exampleVi, srsLevel, intervalDays, easeFactor, repetitionCount, dueDate, createdAt, collocations, ...rest }) => ({
    id: rest.id,
    deck_id: rest.deck_id,
    user_id: rest.user_id,
    word: rest.word,
    ipa: rest.ipa,
    part_of_speech: rest.part_of_speech,
    meaning: rest.meaning,
    example_en: rest.example_en,
    example_vi: rest.example_vi,
    mnemonic: rest.mnemonic,
    srs_level: 0,
    interval_days: 0,
    ease_factor: 2.5,
    repetition_count: 0,
    due_date: today,
    mastery: 'new',
    created_at: now
  }));

  const CHUNK_SIZE = 100;
  let insertedTotal = 0;

  for (let i = 0; i < dbCards.length; i += CHUNK_SIZE) {
    const chunk = dbCards.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase.from('cards').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Batch ${Math.floor(i / CHUNK_SIZE) + 1} Error:`, error.message);
    } else {
      insertedTotal += chunk.length;
      console.log(`  ✓ Batch ${Math.floor(i / CHUNK_SIZE) + 1}: Upserted ${chunk.length} cards (${insertedTotal}/${dbCards.length})`);
    }
  }

  const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 Total Cards now inside Supabase Cloud Database: ${count}`);
}

run().catch(console.error);
