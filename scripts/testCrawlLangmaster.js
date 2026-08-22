import fs from 'fs';

const html = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/65ebabab-19f2-46d2-bd0d-80c509efd613/.system_generated/steps/247/content.md', 'utf8');

const tableRegex = /<table[\s\S]*?<\/table>/gi;
let match;
let index = 0;

const topicDeckMap = [
  { keywords: ['gia đình', 'family'], deckId: 'deck-family' },
  { keywords: ['thời tiết', 'weather'], deckId: 'deck-weather' },
  { keywords: ['nghề nghiệp', 'chức vụ', 'job', 'occupation'], deckId: 'deck-occupations' },
  { keywords: ['quần áo', 'trang phục', 'clothes'], deckId: 'deck-clothes' },
  { keywords: ['tính cách', 'personality'], deckId: 'deck-personality' },
  { keywords: ['rau củ', 'vegetable'], deckId: 'deck-vegetables' },
  { keywords: ['môi trường', 'environment'], deckId: 'deck-environment' },
  { keywords: ['con vật', 'động vật', 'animal'], deckId: 'deck-animals' },
  { keywords: ['đồ ăn', 'món ăn', 'food'], deckId: 'deck-food-dishes' },
  { keywords: ['trường học', 'giáo dục', 'school'], deckId: 'deck-school' },
  { keywords: ['du lịch', 'travel'], deckId: 'deck-travel' },
  { keywords: ['màu sắc', 'color'], deckId: 'deck-colors' },
  { keywords: ['giao thông', 'phương tiện', 'traffic'], deckId: 'deck-traffic' },
  { keywords: ['cảm xúc', 'tâm trạng', 'emotion', 'feeling'], deckId: 'deck-emotions' },
  { keywords: ['hoa quả', 'trái cây', 'fruit'], deckId: 'deck-fruits' },
  { keywords: ['công việc', 'văn phòng', 'work'], deckId: 'deck-work' },
  { keywords: ['giáng sinh', 'noel', 'christmas'], deckId: 'deck-christmas' },
  { keywords: ['thời trang', 'fashion'], deckId: 'deck-fashion' },
  { keywords: ['trung thu', 'mid-autumn'], deckId: 'deck-midautumn' },
  { keywords: ['nhà bếp', 'bếp', 'kitchen'], deckId: 'deck-kitchenware' },
  { keywords: ['thể thao', 'sports'], deckId: 'deck-sports' },
  { keywords: ['thức uống', 'đồ uống', 'beverage', 'drink'], deckId: 'deck-beverages' },
  { keywords: ['miêu tả người', 'ngoại hình'], deckId: 'deck-describing-people' },
  { keywords: ['quốc gia', 'quốc tịch', 'country'], deckId: 'deck-countries' },
  { keywords: ['côn trùng', 'insect'], deckId: 'deck-insects' },
  { keywords: ['quân đội', 'military'], deckId: 'deck-military' },
  { keywords: ['bóng đá', 'football', 'soccer'], deckId: 'deck-football' },
  { keywords: ['cửa hàng', 'siêu thị', 'shop'], deckId: 'deck-shops' },
  { keywords: ['quê hương', 'hometown'], deckId: 'deck-hometown' },
  { keywords: ['tết', 'lunar new year'], deckId: 'deck-tet' },
  { keywords: ['dụng cụ học tập', 'văn phòng phẩm', 'supplies'], deckId: 'deck-supplies' },
  { keywords: ['hành động', 'cơ thể', 'body action'], deckId: 'deck-body-actions' },
  { keywords: ['hoạt động hàng ngày', 'routine'], deckId: 'deck-routines' },
  { keywords: ['số đếm', 'number'], deckId: 'deck-numbers' },
  { keywords: ['mua sắm', 'shopping'], deckId: 'deck-shopping' },
  { keywords: ['bệnh viện', 'y tế', 'hospital'], deckId: 'deck-hospital' },
  { keywords: ['sức khỏe', 'health'], deckId: 'deck-health' },
  { keywords: ['loài hoa', 'hoa', 'flower'], deckId: 'deck-flowers' },
  { keywords: ['phim ảnh', 'điện ảnh', 'movie'], deckId: 'deck-movies' },
  { keywords: ['hải sản', 'seafood'], deckId: 'deck-seafood' },
  { keywords: ['bưu điện', 'post office'], deckId: 'deck-postoffice' },
  { keywords: ['ngân hàng', 'banking'], deckId: 'deck-banking' },
];

const allParsedCards = [];

while ((match = tableRegex.exec(html)) !== null) {
  const tableHtml = match[0];
  const tableStartPos = match.index;
  const snippetBefore = html.substring(Math.max(0, tableStartPos - 1500), tableStartPos);
  
  // Find heading before table
  const headings = snippetBefore.match(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi) || [];
  const lastHeading = headings.length > 0 ? headings[headings.length - 1].replace(/<[^>]+>/g, '').trim() : '';

  let matchedDeckId = 'deck-family';
  for (const item of topicDeckMap) {
    if (item.keywords.some(k => lastHeading.toLowerCase().includes(k))) {
      matchedDeckId = item.deckId;
      break;
    }
  }

  const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  let tableCardCount = 0;

  rows.forEach((r, rowIdx) => {
    const cells = (r.match(/<td[\s\S]*?<\/td>|<th[\s\S]*?<\/th>/gi) || []).map(c => 
      c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    );
    if (cells.length >= 3 && rowIdx > 0) {
      const rawWord = cells[0];
      const rawIpa = cells[1];
      const rawMeaning = cells[2];

      if (rawWord && !rawWord.toLowerCase().includes('từ vựng') && rawMeaning && !rawMeaning.toLowerCase().includes('dịch nghĩa')) {
        // Extract POS from word e.g. "Parents (n)" -> word "Parents", pos "noun"
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

        allParsedCards.push({
          deckId: matchedDeckId,
          word,
          ipa: rawIpa || '',
          partOfSpeech,
          meaning: rawMeaning,
          heading: lastHeading
        });
        tableCardCount++;
      }
    }
  });

  console.log(`Table ${index} | Deck: ${matchedDeckId} | Heading: "${lastHeading}" | Cards: ${tableCardCount}`);
  index++;
}

console.log(`\n🎉 TOTAL PARSED CARDS FROM LANGMASTER: ${allParsedCards.length}`);
