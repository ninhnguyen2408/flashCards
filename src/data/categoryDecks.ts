import type { Card, Deck } from '../types/flashcard';
import rawCards from '../../public/datasets/vocab_3000_topics.json';

const today = new Date().toISOString().split('T')[0];
const now = new Date().toISOString();

export const CATEGORY_DECKS: Deck[] = [
  // 1. Con người & Cảm xúc (People & Feelings)
  { id: 'deck-family', title: 'Gia đình & Mối quan hệ', description: 'Từ vựng chủ đề gia đình, người thân, ông bà và mối quan hệ huyết thống.', category: 'people_feelings', topic: 'Gia đình', cefrLevel: 'A1', icon: 'Users', color: 'from-pink-500 to-rose-600', createdAt: now, updatedAt: now },
  { id: 'deck-personality', title: 'Tính cách & Phẩm chất', description: 'Từ vựng miêu tả tính cách, thái độ và phẩm chất cá nhân con người.', category: 'people_feelings', topic: 'Tính cách', cefrLevel: 'A2', icon: 'Smile', color: 'from-purple-500 to-indigo-600', createdAt: now, updatedAt: now },
  { id: 'deck-emotions', title: 'Cảm xúc & Tâm trạng', description: 'Từ vựng bộc lộ trạng thái cảm xúc, tâm trạng và thái độ con người.', category: 'people_feelings', topic: 'Cảm xúc', cefrLevel: 'A2', icon: 'Heart', color: 'from-rose-500 to-pink-600', createdAt: now, updatedAt: now },
  { id: 'deck-describing-people', title: 'Miêu tả Ngoại hình', description: 'Từ vựng miêu tả vóc dáng, diện mạo và đặc điểm bên ngoài con người.', category: 'people_feelings', topic: 'Miêu tả người', cefrLevel: 'B1', icon: 'UserCheck', color: 'from-fuchsia-500 to-purple-600', createdAt: now, updatedAt: now },
  { id: 'deck-body-actions', title: 'Hành động Cơ thể', description: 'Cử chỉ, cử động và cử chỉ điệu bộ trên cơ thể con người.', category: 'people_feelings', topic: 'Hành động cơ thể người', cefrLevel: 'A2', icon: 'Activity', color: 'from-red-500 to-rose-600', createdAt: now, updatedAt: now },

  // 2. Ẩm thực & Nhà bếp (Food & Dining)
  { id: 'deck-vegetables', title: 'Rau củ & Nông sản', description: 'Các loại rau củ, củ quả và nông sản dinh dưỡng hàng ngày.', category: 'food_dining', topic: 'Rau củ', cefrLevel: 'A1', icon: 'Leaf', color: 'from-emerald-500 to-green-600', createdAt: now, updatedAt: now },
  { id: 'deck-food-dishes', title: 'Món ăn & Ẩm thực', description: 'Từ vựng về các món ăn thông dụng, khai vị, món chính và đặc sản.', category: 'food_dining', topic: 'Đồ ăn', cefrLevel: 'A2', icon: 'Utensils', color: 'from-amber-500 to-orange-600', createdAt: now, updatedAt: now },
  { id: 'deck-fruits', title: 'Trái cây & Hoa quả', description: 'Tên gọi các loại trái cây tươi ngon, nhiệt đới và ôn đới.', category: 'food_dining', topic: 'Hoa quả', cefrLevel: 'A1', icon: 'Apple', color: 'from-red-500 to-amber-600', createdAt: now, updatedAt: now },
  { id: 'deck-kitchenware', title: 'Nhà bếp & Dụng cụ nấu ăn', description: 'Các vật dụng, thiết bị nấu nướng và đồ dùng phòng bếp.', category: 'food_dining', topic: 'Nhà bếp', cefrLevel: 'A2', icon: 'ChefHat', color: 'from-orange-500 to-yellow-600', createdAt: now, updatedAt: now },
  { id: 'deck-beverages', title: 'Thức uống & Đồ giải khát', description: 'Từ vựng các loại nước giải khát, trà, cà phê và đồ uống có cồn.', category: 'food_dining', topic: 'Thức uống', cefrLevel: 'A1', icon: 'Coffee', color: 'from-amber-600 to-yellow-700', createdAt: now, updatedAt: now },
  { id: 'deck-seafood', title: 'Hải sản tươi sống', description: 'Các loại tôm, cua, cá, sò, hến và thủy hải sản biển.', category: 'food_dining', topic: 'Hải sản', cefrLevel: 'A2', icon: 'Fish', color: 'from-cyan-500 to-blue-600', createdAt: now, updatedAt: now },

  // 3. Đời sống & Thường nhật (Daily Life & Shopping)
  { id: 'deck-clothes', title: 'Quần áo & Trang phục', description: 'Trang phục thường ngày, phụ kiện thời trang và đồng phục.', category: 'daily_shopping', topic: 'Quần áo', cefrLevel: 'A1', icon: 'Shirt', color: 'from-blue-500 to-indigo-600', createdAt: now, updatedAt: now },
  { id: 'deck-colors', title: 'Màu sắc cơ bản & Pha màu', description: 'Bảng màu sắc phong phú từ cơ bản đến Gam màu ngọc bích.', category: 'daily_shopping', topic: 'Màu sắc', cefrLevel: 'A1', icon: 'Palette', color: 'from-violet-500 to-purple-600', createdAt: now, updatedAt: now },
  { id: 'deck-fashion', title: 'Thời trang & Xu hướng', description: 'Từ vựng mốt thời trang, phong cách mặc và phụ kiện thời thượng.', category: 'daily_shopping', topic: 'Thời trang', cefrLevel: 'B1', icon: 'Sparkles', color: 'from-pink-500 to-fuchsia-600', createdAt: now, updatedAt: now },
  { id: 'deck-shops', title: 'Cửa hàng & Siêu thị', description: 'Địa điểm mua sắm, siêu thị, tiệm tạp hóa và dịch vụ bán lẻ.', category: 'daily_shopping', topic: 'Cửa hàng', cefrLevel: 'A2', icon: 'ShoppingBag', color: 'from-teal-500 to-emerald-600', createdAt: now, updatedAt: now },
  { id: 'deck-routines', title: 'Hoạt động hàng ngày', description: 'Lịch trình sinh hoạt, thói quen vệ sinh và công việc nhà.', category: 'daily_shopping', topic: 'Hoạt động hàng ngày', cefrLevel: 'A1', icon: 'Clock', color: 'from-sky-500 to-blue-600', createdAt: now, updatedAt: now },
  { id: 'deck-numbers', title: 'Số đếm & Số thứ tự', description: 'Số đếm, số thứ tự, phân số và phép tính toán căn bản.', category: 'daily_shopping', topic: 'Số đếm', cefrLevel: 'A1', icon: 'Hash', color: 'from-indigo-500 to-cyan-600', createdAt: now, updatedAt: now },
  { id: 'deck-shopping', title: 'Mua sắm & Trả giá', description: 'Mẫu câu và từ vựng thanh toán, giảm giá, đổi trả hàng hóa.', category: 'daily_shopping', topic: 'Mua sắm', cefrLevel: 'A2', icon: 'ShoppingCart', color: 'from-emerald-500 to-teal-600', createdAt: now, updatedAt: now },

  // 4. Thiên nhiên & Thế giới quanh ta (Nature & Environment)
  { id: 'deck-weather', title: 'Thời tiết & Khí hậu', description: 'Các hiện tượng thời tiết, nhiệt độ và dự báo khí hậu.', category: 'nature_environment', topic: 'Thời tiết', cefrLevel: 'A2', icon: 'Sun', color: 'from-sky-400 to-blue-600', createdAt: now, updatedAt: now },
  { id: 'deck-environment', title: 'Môi trường & Hệ sinh thái', description: 'Ô nhiễm, biến đổi khí hậu, sinh thái và bảo vệ hành tinh.', category: 'nature_environment', topic: 'Môi trường', cefrLevel: 'B2', icon: 'Globe', color: 'from-emerald-600 to-teal-700', createdAt: now, updatedAt: now },
  { id: 'deck-animals', title: 'Con vật & Thế giới Động vật', description: 'Động vật nuôi, thú hoang dã, loài bò sát và chim chóc.', category: 'nature_environment', topic: 'Con vật', cefrLevel: 'A1', icon: 'Dog', color: 'from-amber-600 to-orange-700', createdAt: now, updatedAt: now },
  { id: 'deck-insects', title: 'Côn trùng & Loài sâu bọ', description: 'Chuồn chuồn, bướm, ong, kiến và thế giới vi sinh vật.', category: 'nature_environment', topic: 'Côn trùng', cefrLevel: 'A2', icon: 'Bug', color: 'from-lime-500 to-green-600', createdAt: now, updatedAt: now },
  { id: 'deck-flowers', title: 'Các loài hoa & Cây cảnh', description: 'Hoa hồng, hoa lan, hướng dương và các loại cây cỏ hoa lá.', category: 'nature_environment', topic: 'Các loài hoa', cefrLevel: 'A2', icon: 'Flower2', color: 'from-pink-500 to-rose-500', createdAt: now, updatedAt: now },

  // 5. Học tập & Công việc (Education & Career)
  { id: 'deck-school', title: 'Trường học & Giáo dục', description: 'Từ vựng trường lớp, môn học, giáo trình và thi cử.', category: 'education_career', topic: 'Trường học', cefrLevel: 'A2', icon: 'GraduationCap', color: 'from-blue-600 to-indigo-700', createdAt: now, updatedAt: now },
  { id: 'deck-occupations', title: 'Nghề nghiệp & Nghề trong xã hội', description: 'Bác sĩ, kỹ sư, giáo viên, luật sư, doanh nhân và ngành nghề.', category: 'education_career', topic: 'Nghề nghiệp', cefrLevel: 'A2', icon: 'Briefcase', color: 'from-indigo-600 to-purple-700', createdAt: now, updatedAt: now },
  { id: 'deck-work', title: 'Công việc & Văn phòng', description: 'Deadline, họp hành, báo cáo, đồng nghiệp và công sở.', category: 'education_career', topic: 'Công việc', cefrLevel: 'B1', icon: 'Building2', color: 'from-slate-600 to-slate-800', createdAt: now, updatedAt: now },
  { id: 'deck-military', title: 'Quân đội & An ninh', description: 'Quân ngũ, lực lượng vũ trang, cấp bậc và trang bị an ninh.', category: 'education_career', topic: 'Quân đội', cefrLevel: 'B2', icon: 'Shield', color: 'from-stone-600 to-neutral-800', createdAt: now, updatedAt: now },
  { id: 'deck-supplies', title: 'Đồ dùng học tập & Văn phòng phẩm', description: 'Bút, thước, cặp sách, máy tính và đồ dùng bàn học.', category: 'education_career', topic: 'Đồ dùng học tập', cefrLevel: 'A1', icon: 'PenTool', color: 'from-cyan-600 to-blue-700', createdAt: now, updatedAt: now },

  // 6. Địa điểm & Dịch vụ công cộng (Places & Services)
  { id: 'deck-travel', title: 'Du lịch & Khám phá', description: 'Sân bay, khách sạn, lịch trình chuyến đi và trải nghiệm du lịch.', category: 'places_services', topic: 'Du lịch', cefrLevel: 'A2', icon: 'Plane', color: 'from-teal-500 to-cyan-600', createdAt: now, updatedAt: now },
  { id: 'deck-traffic', title: 'Giao thông & Phương tiện', description: 'Xe cộ, biển báo, luật giao thông và đường sá đô thị.', category: 'places_services', topic: 'Giao thông', cefrLevel: 'A2', icon: 'Car', color: 'from-blue-500 to-indigo-600', createdAt: now, updatedAt: now },
  { id: 'deck-countries', title: 'Quốc gia & Quốc tịch', description: 'Tên các quốc gia, thủ đô, quốc tịch và văn hóa thế giới.', category: 'places_services', topic: 'Quốc gia', cefrLevel: 'A1', icon: 'Flag', color: 'from-red-500 to-amber-600', createdAt: now, updatedAt: now },
  { id: 'deck-hometown', title: 'Quê hương & Làng quê', description: 'Từ vựng miêu tả quê hương, vùng nông thôn và cảnh vật làng quê.', category: 'places_services', topic: 'Quê hương', cefrLevel: 'A2', icon: 'Home', color: 'from-green-600 to-emerald-700', createdAt: now, updatedAt: now },
  { id: 'deck-hospital', title: 'Bệnh viện & Y tế', description: 'Phòng khám, y bác sĩ, đơn thuốc và điều trị bệnh.', category: 'places_services', topic: 'Bệnh viện', cefrLevel: 'B1', icon: 'Stethoscope', color: 'from-rose-600 to-red-700', createdAt: now, updatedAt: now },
  { id: 'deck-health', title: 'Sức khỏe & Chăm sóc cơ thể', description: 'Rèn luyện sức khỏe, triệu chứng bệnh và dinh dưỡng lành mạnh.', category: 'places_services', topic: 'Sức khỏe', cefrLevel: 'B1', icon: 'Activity', color: 'from-emerald-500 to-green-600', createdAt: now, updatedAt: now },
  { id: 'deck-postoffice', title: 'Bưu điện & Chuyển phát', description: 'Gửi thư, kiện hàng, bưu phẩm và dịch vụ logistics.', category: 'places_services', topic: 'Bưu điện', cefrLevel: 'A2', icon: 'Mail', color: 'from-amber-500 to-orange-600', createdAt: now, updatedAt: now },
  { id: 'deck-banking', title: 'Ngân hàng & Tài chính', description: 'Giao dịch ngân hàng, thẻ ATM, tín dụng và chuyển tiền.', category: 'places_services', topic: 'Ngân hàng', cefrLevel: 'B2', icon: 'Landmark', color: 'from-blue-700 to-indigo-900', createdAt: now, updatedAt: now },

  // 7. Giải trí, Thể thao & Lễ hội (Leisure & Festivals)
  { id: 'deck-sports', title: 'Các môn Thể thao', description: 'Bóng rổ, cầu lông, bơi lội, điền kinh và thi đấu thể thao.', category: 'leisure_festivals', topic: 'Các môn thể thao', cefrLevel: 'A1', icon: 'Trophy', color: 'from-amber-500 to-yellow-600', createdAt: now, updatedAt: now },
  { id: 'deck-football', title: 'Bóng đá & Giải vô địch', description: 'Sân bóng, trọng tài, bàn thắng, cầu thủ và các giải đấu.', category: 'leisure_festivals', topic: 'Bóng đá', cefrLevel: 'A2', icon: 'Goal', color: 'from-emerald-500 to-green-600', createdAt: now, updatedAt: now },
  { id: 'deck-movies', title: 'Phim ảnh & Điện ảnh', description: 'Rạp chiếu phim, đạo diễn, diễn viên và phim bom tấn.', category: 'leisure_festivals', topic: 'Phim ảnh', cefrLevel: 'B1', icon: 'Film', color: 'from-purple-600 to-indigo-700', createdAt: now, updatedAt: now },
  { id: 'deck-christmas', title: 'Giáng sinh & Đón Năm Mới', description: 'Cây thông, quà tặng, rồng rực rỡ và không khí Noel.', category: 'leisure_festivals', topic: 'Giáng sinh', cefrLevel: 'A2', icon: 'Snowflake', color: 'from-red-600 to-emerald-700', createdAt: now, updatedAt: now },
  { id: 'deck-midautumn', title: 'Tết Trung Thu', description: 'Bánh trung thu, lồng đèn, múa lân và đêm rằm tháng tám.', category: 'leisure_festivals', topic: 'Trung thu', cefrLevel: 'A2', icon: 'Moon', color: 'from-amber-400 to-orange-500', createdAt: now, updatedAt: now },
  { id: 'deck-tet', title: 'Tết Nguyên Đán', description: 'Hoa mai, hoa đào, bánh chưng, bao lì xì và đoàn tụ gia đình.', category: 'leisure_festivals', topic: 'Tết', cefrLevel: 'A2', icon: 'Gift', color: 'from-red-600 to-amber-500', createdAt: now, updatedAt: now },
];

export const CATEGORY_CARDS: Card[] = (rawCards as any[]).map(c => ({
  id: c.id,
  deckId: c.deckId || c.deck_id,
  userId: c.userId || c.user_id,
  word: c.word,
  ipa: c.ipa,
  partOfSpeech: c.partOfSpeech || c.part_of_speech || 'noun',
  meaning: c.meaning,
  exampleEn: c.exampleEn || c.example_en || '',
  exampleVi: c.exampleVi || c.example_vi || '',
  mnemonic: c.mnemonic,
  collocations: c.collocations || [],
  cefrLevel: c.cefrLevel || c.cefr_level || 'A2',
  srsLevel: c.srsLevel || c.srs_level || 0,
  intervalDays: c.intervalDays || c.interval_days || 0,
  easeFactor: c.easeFactor || c.ease_factor || 2.5,
  repetitionCount: c.repetitionCount || c.repetition_count || 0,
  dueDate: c.dueDate || c.due_date || today,
  mastery: c.mastery || 'new',
  createdAt: c.createdAt || c.created_at || now,
}));
