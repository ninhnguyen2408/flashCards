# ⚡ VocaFast - Học Tiếng Anh Flashcard Thông Minh & Spaced Repetition

![VocaFast Banner](https://img.shields.io/badge/VocaFast-PRO_v2.0-indigo?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)
![Supabase Cloud](https://img.shields.io/badge/Supabase-Connected-3ECF8E?style=for-the-badge&logo=supabase)
![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

**VocaFast** là ứng dụng web học từ vựng tiếng Anh hiện đại, áp dụng **Thuật toán Lặp lại Ngắt quãng (Spaced Repetition System - SM-2)** giúp người học ghi nhớ từ vựng nhanh hơn gấp 3 lần và duy trì trí nhớ dài hạn bền vững.

---

## 🌟 Tính Năng Nổi Bật

### 📚 Kho Dữ Liệu 1,300+ Từ Vựng Phong Phú
- **42 Chủ Đề Nhỏ Thuộc 7 Danh Mục Phổ Biến**:
  1. **Con người & Cảm xúc (People & Feelings)**: Gia đình, Tính cách, Cảm xúc, Miêu tả người, Hành động cơ thể.
  2. **Ẩm thực & Nhà bếp (Food & Dining)**: Rau củ, Đồ ăn, Hoa quả, Nhà bếp, Thức uống, Hải sản.
  3. **Đời sống & Mua sắm (Daily Life & Shopping)**: Quần áo, Màu sắc, Thời trang, Cửa hàng, Hoạt động hàng ngày, Số đếm, Mua sắm.
  4. **Thiên nhiên & Môi trường (Nature & Environment)**: Thời tiết, Môi trường, Con vật, Côn trùng, Các loài hoa.
  5. **Học tập & Công việc (Education & Career)**: Nghề nghiệp, Trường học, Công việc, Quân đội, Đồ dùng học tập.
  6. **Địa điểm & Dịch vụ (Places & Services)**: Du lịch, Giao thông, Quốc gia, Quê hương, Bệnh viện, Sức khỏe, Bưu điện, Ngân hàng.
  7. **Giải trí, Thể thao & Lễ hội (Leisure & Festivals)**: Giáng sinh, Trung thu, Thể thao, Bóng đá, Tết, Phim ảnh.

### 🃏 Chi Tiết Thẻ Bài Flashcard Chuẩn Quốc Tế
Mỗi từ vựng được biên soạn tỉ mỉ với đầy đủ thông tin:
- **Từ & Phiên âm IPA chuẩn** (UK / US).
- **Từ loại** (Noun, Verb, Adjective, Adverb, Phrasal Verb...).
- **Nghĩa tiếng Việt** chính xác.
- **Câu ví dụ thực tế Anh - Việt**.
- **Cụm từ hay đi kèm (Collocations)**.
- **Mẹo ghi nhớ (Mnemonic)** độc đáo.

### 🧠 Thuật Toán Spaced Repetition (SM-2) & Thuật Toán Ôn Tập
- Tự động tính toán khoảng cách ngày ôn tập (`interval_days`), hệ số dễ (`ease_factor`) và số lần lặp lại (`repetition_count`) dựa trên phản hồi mức độ thuộc của bạn.
- Báo cáo số thẻ bài cần ôn tập hôm nay và thống kê chuỗi ngày học (`Streak`).

### 🤖 Tính Năng Trí Tuệ Nhân Tạo (AI Features)
- **Luyện Phát Âm AI (AI Pronunciation)**: Đánh giá giọng đọc qua Micro và chấm điểm độ chính xác phiên âm.
- **Hội Thoại AI (AI Roleplay Chatbot)**: Thực hành đóng vai giao tiếp theo từng tình huống du lịch, công sở, phỏng vấn.

### 🎮 Mini Games Giải Trí Hấp Dẫn
- **Trắc nghiệm (Quiz Game)**: Kiểm tra phản xạ nhận diện từ vựng.
- **Thử thách Đánh vần (Spelling Game)**: Luyện nghe và gõ lại đúng từ vựng.
- **Ghép thẻ Ghi nhớ (Memory Match Game)**: Trò chơi lật thẻ ghép cặp từ tiếng Anh - nghĩa tiếng Việt.

### ☁️ Đồng Bộ Hóa Supabase Cloud Database
- Kết nối Supabase PostgreSQL lưu trữ đồng bộ dữ liệu thẻ bài, bộ thẻ và tiến trình học tập của người dùng.
- Quản trị viên (`Admin`) có thể quản lý người dùng, khóa/mở khóa tài khoản trực tiếp trên giao diện.

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Icons & UI Effects**: Lucide React, Canvas Confetti, Glassmorphism UI
- **Backend & Cloud Database**: Supabase (PostgreSQL & PostgREST API)
- **Audio & Speech**: Web Speech API (Text-to-Speech & Speech Recognition)
- **State & Storage**: LocalStorage API + Supabase Cloud Auto-Sync

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
flashCards/
├── public/
│   ├── datasets/
│   │   └── vocab_3000_topics.json      # File dữ liệu 1,260+ từ vựng 42 chủ đề
│   ├── logo.svg
│   └── manifest.json
├── scripts/
│   ├── crawlAllLangmasterVocab.js      # Script crawl dữ liệu từ Langmaster
│   ├── checkDuplicates.js              # Script kiểm tra từ vựng trùng lặp
│   ├── removeDuplicates.js             # Script dọn dẹp card trùng trên Supabase
│   └── seedCategoriesToSupabase.js     # Script nạp bộ thẻ chủ đề vào DB
├── src/
│   ├── components/
│   │   ├── Header.tsx                  # Thanh điều hướng Header 1600px
│   │   ├── UserMenu.tsx                # Menu tài khoản & phân quyền role
│   │   ├── DeckList.tsx                # Giao diện danh sách 42 bộ thẻ chủ đề
│   │   ├── DeckDetail.tsx              # Giao diện chi tiết bộ thẻ & danh sách từ
│   │   ├── FlashcardViewer.tsx         # Giao diện lật thẻ Flashcard 3D
│   │   ├── QuizGame.tsx                # Game trắc nghiệm
│   │   ├── SpellingGame.tsx            # Game đánh vần
│   │   ├── MemoryMatchGame.tsx         # Game ghép từ
│   │   ├── VoicePronounceGame.tsx      # Game luyện phát âm AI
│   │   ├── RoleplayView.tsx            # Game hội thoại AI
│   │   ├── StatsView.tsx               # Báo cáo thống kê & tiến độ học
│   │   └── UserManagementView.tsx      # Trình quản trị User dành cho Admin
│   ├── data/
│   │   └── categoryDecks.ts            # Nạp dữ liệu 42 chủ đề & từ vựng
│   ├── services/
│   │   ├── apiService.ts               # Kết nối API Supabase Cloud
│   │   ├── storageService.ts           # Quản lý bộ nhớ LocalStorage
│   │   └── soundEffects.ts             # Hiệu ứng âm thanh vui nhộn
│   ├── types/
│   │   └── flashcard.ts                # Định nghĩa dữ liệu TypeScript
│   ├── App.tsx                         # Thành phần chính của ứng dụng
│   └── main.tsx                        # Entry point
├── index.html
├── package.json
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu hệ thống
- Node.js version 18.x trở lên
- npm hoặc yarn

### 2. Tải mã nguồn & cài đặt thư viện
```bash
git clone https://github.com/ninhnguyen2408/flashCards.git
cd flashCards
npm install
```

### 3. Cấu hình Biến Môi Trường (`.env`)
Tạo file `.env` tại thư mục gốc với các thông tin Supabase:
```env
VITE_SUPABASE_URL=https://yzzfxoefwjrzbzxkqlnn.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy chế độ Development
```bash
npm run dev
```
Sau đó truy cập ứng dụng tại: `http://localhost:5173/`

### 5. Biên dịch sản phẩm (Production Build)
```bash
npm run build
```

---

## ⚙️ Các Lệnh Utility Scripts

- **Kiểm tra từ vựng trùng lặp trong DB**:
  ```bash
  node scripts/checkDuplicates.js
  ```
- **Dọn dẹp từ vựng trùng lặp**:
  ```bash
  node scripts/removeDuplicates.js
  ```
- **Crawl lại dữ liệu từ bài viết Langmaster**:
  ```bash
  node scripts/crawlAllLangmasterVocab.js
  ```

---

## 📄 Giấy Phép (License)
Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
