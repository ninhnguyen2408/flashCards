import type { RoleplayScenario } from '../types/roleplay';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'scenario-starbucks-order',
    title: 'Gọi Cà Phê Tại Quán Cafe Starbucks',
    description: 'Thực hành gọi đồ uống, chọn kích cỡ ly, điều chỉnh lượng đường/sữa và thanh toán tại quầy.',
    category: 'restaurant',
    difficulty: 'easy',
    icon: 'Coffee',
    color: 'from-amber-500 to-orange-600',
    location: 'Quán Cafe Starbucks - London',
    xpReward: 30,
    aiCharacter: {
      name: 'Emma',
      role: 'Nhân viên Barista',
      avatar: '☕',
      voiceGender: 'female',
    },
    userRole: {
      name: 'Khách hàng',
      role: 'Người mua nước',
      avatar: '🎒',
    },
    dialogue: [
      {
        id: 'turn-1',
        speaker: 'ai',
        text: 'Hi there! Welcome to Starbucks. What can I get started for you today?',
        meaningVi: 'Xin chào! Chào mừng quý khách đến với Starbucks. Hôm nay tôi có thể lấy món gì cho bạn?',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        text: 'Hi, I would like an iced caramel macchiato, please.',
        ipa: '/haɪ, aɪ wʊd laɪk ən aɪst ˈkærəmɛl ˌmækiˈɑːtoʊ, pliːz/',
        meaningVi: 'Chào bạn, cho tôi một ly caramel macchiato đá nhé.',
        hint: 'Nói "I would like an iced caramel macchiato, please"',
        acceptableAlternatives: [
          "I'd like an iced caramel macchiato please",
          "Can I get an iced caramel macchiato please",
          "I want an iced caramel macchiato please"
        ]
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        text: 'Sure thing! What size would you like for that? Tall, Grande, or Venti?',
        meaningVi: 'Dạ được chứ! Bạn muốn chọn cỡ ly nào? Cỡ nhỏ Tall, cỡ vừa Grande hay cỡ lớn Venti?',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        text: 'A Grande size with oat milk and less sugar, please.',
        ipa: '/ə ˈɡrɑːndeɪ saɪz wɪð oʊt mɪlk ænd lɛs ˈʃʊɡər, pliːz/',
        meaningVi: 'Cho tôi cỡ Grande (vừa), dùng sữa yến mạch và giảm đường nhé.',
        hint: 'Nói "A Grande size with oat milk and less sugar, please"',
        acceptableAlternatives: [
          "Grande with oat milk and less sugar please",
          "A medium size with oat milk and less sugar"
        ]
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        text: 'Got it. Would you like any pastries or snacks to go with that?',
        meaningVi: 'Tôi đã ghi nhận. Bạn có muốn dùng thêm bánh ngọt hay đồ ăn nhẹ kèm theo không?',
      },
      {
        id: 'turn-6',
        speaker: 'user',
        text: 'No thank you, that will be all for now.',
        ipa: '/noʊ θæŋk juː, ðæt wɪl biː ɔːl fɔːr naʊ/',
        meaningVi: 'Không, cảm ơn bạn, chỉ ngần đó thôi nhé.',
        hint: 'Nói "No thank you, that will be all for now"',
        acceptableAlternatives: [
          "No thanks, that's all for today",
          "No thank you, that's everything",
          "That's all for now, thanks"
        ]
      },
      {
        id: 'turn-7',
        speaker: 'ai',
        text: 'That will be four dollars and fifty cents. Will you be paying with cash or card?',
        meaningVi: 'Tổng cộng của bạn hết 4 đô la 50 xu. Bạn thanh toán bằng tiền mặt hay thẻ?',
      },
      {
        id: 'turn-8',
        speaker: 'user',
        text: 'I will pay by card. Here you go, thank you!',
        ipa: '/aɪ wɪl peɪ baɪ kɑːrd. hɪər juː ɡoʊ, θæŋk juː/',
        meaningVi: 'Tôi thanh toán bằng thẻ. Của bạn đây, cảm ơn bạn!',
        hint: 'Nói "I will pay by card. Here you go, thank you"',
        acceptableAlternatives: [
          "I'll pay by card. Here you go, thank you",
          "By card please, here is my card",
          "Card please, thank you"
        ]
      }
    ]
  },
  {
    id: 'scenario-airport-checkin',
    title: 'Làm Thủ Tục Check-in Tại Sân Bay',
    description: 'Thực hành trình vé, gửi hành lý ký gửi, chọn chỗ ngồi gần cửa sổ và nhận thẻ lên máy bay.',
    category: 'airport',
    difficulty: 'medium',
    icon: 'Plane',
    color: 'from-blue-500 to-indigo-600',
    location: 'Quầy Check-in Sân bay Quốc tế',
    xpReward: 35,
    aiCharacter: {
      name: 'David',
      role: 'Nhân viên Hàng không',
      avatar: '👨‍✈️',
      voiceGender: 'male',
    },
    userRole: {
      name: 'Hành khách',
      role: 'Người bay',
      avatar: '🧳',
    },
    dialogue: [
      {
        id: 'turn-1',
        speaker: 'ai',
        text: 'Good morning! Where are you flying to today, and may I see your passport?',
        meaningVi: 'Chào buổi sáng! Hôm nay bạn bay đến đâu và tôi có thể xem hộ chiếu của bạn được không?',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        text: 'Good morning, I am flying to Tokyo. Here is my passport and booking confirmation.',
        ipa: '/ɡʊd ˈmɔːrnɪŋ, aɪ æm ˈflaɪɪŋ tuː ˈtoʊkioʊ. hɪər ɪz maɪ ˈpæspɔːrt ænd ˈbʊkɪŋ ˌkɑːnfərˈmeɪʃn/',
        meaningVi: 'Chào buổi sáng, tôi bay đến Tokyo. Đây là hộ chiếu và xác nhận đặt vé của tôi.',
        hint: 'Nói "Good morning, I am flying to Tokyo. Here is my passport"',
        acceptableAlternatives: [
          "Good morning, I'm flying to Tokyo. Here is my passport",
          "I am going to Tokyo, here is my passport"
        ]
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        text: 'Thank you. Do you have any check-in baggage or just carry-on luggage?',
        meaningVi: 'Cảm ơn bạn. Bạn có hành lý ký gửi nào không hay chỉ có hành lý xách tay?',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        text: 'I have one suitcase to check in and one backpack as carry-on.',
        ipa: '/aɪ hæv wʌn ˈsuːtkeɪs tuː tʃɛk ɪn ænd wʌn ˈbækpæk æz ˈkæri ɑːn/',
        meaningVi: 'Tôi có một vali ký gửi và một balo làm hành lý xách tay.',
        hint: 'Nói "I have one suitcase to check in and one backpack as carry-on"',
        acceptableAlternatives: [
          "I have one check-in bag and one carry-on backpack",
          "Just one suitcase to check in and one carry-on"
        ]
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        text: 'Please place your suitcase on the scale. Would you prefer a window or an aisle seat?',
        meaningVi: 'Vui lòng đặt vali lên cân. Bạn muốn ngồi cạnh cửa sổ hay cạnh lối đi?',
      },
      {
        id: 'turn-6',
        speaker: 'user',
        text: 'I would prefer a window seat if one is available, please.',
        ipa: '/aɪ wʊd prɪˈfɜːr ə ˈwɪndoʊ siːt ɪf wʌn ɪz əˈveɪləbl, pliːz/',
        meaningVi: 'Tôi thích một chỗ ngồi cạnh cửa sổ nếu còn ghế trống nhé.',
        hint: 'Nói "I would prefer a window seat if one is available, please"',
        acceptableAlternatives: [
          "A window seat please if available",
          "I'd like a window seat please",
          "Window seat please"
        ]
      },
      {
        id: 'turn-7',
        speaker: 'ai',
        text: 'Here is your boarding pass. Gate 24, boarding starts at 10:15 AM. Have a wonderful flight!',
        meaningVi: 'Đây là thẻ lên máy bay của bạn. Cổng số 24, bắt đầu lên máy bay lúc 10h15 sáng. Chúc bạn có chuyến bay vui vẻ!',
      },
      {
        id: 'turn-8',
        speaker: 'user',
        text: 'Thank you very much for your help. Have a great day!',
        ipa: '/θæŋk juː ˈvɛri mʌtʃ fɔːr jɔːr hɛlp. hæv ə ɡreɪt deɪ/',
        meaningVi: 'Cảm ơn bạn rất nhiều vì đã hỗ trợ. Chúc bạn một ngày tốt lành!',
        hint: 'Nói "Thank you very much for your help. Have a great day"',
        acceptableAlternatives: [
          "Thank you so much, have a nice day",
          "Thanks a lot for your help, have a great day"
        ]
      }
    ]
  },
  {
    id: 'scenario-job-interview',
    title: 'Phỏng Vấn Xin Việc Bằng Tiếng Anh',
    description: 'Thực hành trả lời các câu hỏi phỏng vấn phổ biến: Giới thiệu bản thân, thế mạnh và mục tiêu nghề nghiệp.',
    category: 'interview',
    difficulty: 'hard',
    icon: 'Briefcase',
    color: 'from-purple-500 to-indigo-600',
    location: 'Phòng Phỏng Vấn Doanh Nghiệp',
    xpReward: 40,
    aiCharacter: {
      name: 'Mr. Robert',
      role: 'Giám đốc Tuyển dụng',
      avatar: '👔',
      voiceGender: 'male',
    },
    userRole: {
      name: 'Ứng viên',
      role: 'Người ứng tuyển',
      avatar: '💼',
    },
    dialogue: [
      {
        id: 'turn-1',
        speaker: 'ai',
        text: 'Hello! Thank you for joining us today. Could you start by introducing yourself briefly?',
        meaningVi: 'Xin chào! Cảm ơn bạn đã tham gia buổi phỏng vấn hôm nay. Bạn có thể mở đầu bằng việc giới thiệu ngắn gọn về bản thân được không?',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        text: 'Hello, my name is Nam. I have over three years of experience in software development and English communication.',
        ipa: '/hɛˈloʊ, maɪ neɪm ɪz nɑːm. aɪ hæv ˈoʊvər θriː jɪərz əv ɪkˈspɪəriəns ɪn ˈsɔːftwɛər dɪˈvɛləpmənt ænd ˈɪŋɡlɪʃ kəˌmjuːnɪˈkeɪʃn/',
        meaningVi: 'Xin chào, tôi tên là Nam. Tôi có hơn 3 năm kinh nghiệm trong phát triển phần mềm và giao tiếp tiếng Anh.',
        hint: 'Nói "Hello, my name is Nam. I have over three years of experience in software development"',
        acceptableAlternatives: [
          "Hello, I am Nam. I have three years of experience in software development",
          "Hello, my name is Nam and I am an experienced software engineer"
        ]
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        text: 'That sounds impressive. What do you consider to be your greatest professional strength?',
        meaningVi: 'Nghe rất ấn tượng. Bạn tự đánh giá đâu là thế mạnh chuyên môn lớn nhất của mình?',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        text: 'My greatest strength is problem solving and collaborating effectively with multinational teams.',
        ipa: '/maɪ ˈɡreɪtɪst strɛŋkθ ɪz ˈprɑːbləm ˈsɑːlvɪŋ ænd kəˈlæbəreɪtɪŋ ɪˈfɛktɪvli wɪð ˌmʌltiˈnæʃnəl tiːmz/',
        meaningVi: 'Thế mạnh lớn nhất của tôi là giải quyết vấn đề và cộng tác hiệu quả với các đội ngũ đa quốc gia.',
        hint: 'Nói "My greatest strength is problem solving and collaborating effectively with multinational teams"',
        acceptableAlternatives: [
          "My greatest strength is problem-solving and teamwork",
          "I excel at problem solving and collaborating with international teams"
        ]
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        text: 'Why do you want to work for our company specifically?',
        meaningVi: 'Tại sao bạn lại đặc biệt muốn làm việc cho công ty chúng tôi?',
      },
      {
        id: 'turn-6',
        speaker: 'user',
        text: 'I admire your innovative culture and see great opportunities to contribute and grow here.',
        ipa: '/aɪ ədˈmaɪər jɔːr ˈɪnəveɪtɪv ˈkʌltʃər ænd siː ɡreɪt ˌɑːpərˈtuːnətiz tuː kənˈtrɪbjuːt ænd ɡroʊ hɪər/',
        meaningVi: 'Tôi rất ngưỡng mộ văn hóa đổi mới sáng tạo của công ty và thấy đây là cơ hội tuyệt vời để đóng góp và phát triển.',
        hint: 'Nói "I admire your innovative culture and see great opportunities to contribute and grow here"',
        acceptableAlternatives: [
          "I admire your innovative environment and want to contribute to your growth",
          "Because your company has a great innovative culture and high growth potential"
        ]
      }
    ]
  },
  {
    id: 'scenario-hotel-checkin',
    title: 'Nhận Phòng Tại Khách Sạn (Hotel Check-in)',
    description: 'Thực hành xác nhận đặt phòng, hỏi giờ ăn sáng, mật khẩu Wifi và yêu cầu phòng tầng cao.',
    category: 'hotel',
    difficulty: 'easy',
    icon: 'Building2',
    color: 'from-emerald-500 to-teal-600',
    location: 'Quầy Lễ Tân Khách Sạn 5 Sao',
    xpReward: 30,
    aiCharacter: {
      name: 'Sophie',
      role: 'Nhân viên Lễ tân',
      avatar: '🛎️',
      voiceGender: 'female',
    },
    userRole: {
      name: 'Du khách',
      role: 'Khách lưu trú',
      avatar: '🧳',
    },
    dialogue: [
      {
        id: 'turn-1',
        speaker: 'ai',
        text: 'Good evening! Welcome to Grand Palace Hotel. How may I assist you tonight?',
        meaningVi: 'Chào buổi tối! Chào mừng quý khách đến với khách sạn Grand Palace. Tôi có thể giúp gì cho bạn tối nay?',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        text: 'Good evening, I have a reservation under the name of Nguyen for two nights.',
        ipa: '/ɡʊd ˈiːvnɪŋ, aɪ hæv ə ˌrɛzərˈveɪʃn ˈʌndər ðə neɪm əv wɪn fɔːr tuː naɪts/',
        meaningVi: 'Chào buổi tối, tôi có đặt phòng trước dưới tên Nguyen trong 2 đêm.',
        hint: 'Nói "Good evening, I have a reservation under the name of Nguyen for two nights"',
        acceptableAlternatives: [
          "Good evening, I have a booking under Nguyen for two nights",
          "I'd like to check in, reservation under Nguyen"
        ]
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        text: 'Yes, I see your booking for a Deluxe King Room. May I please have your ID card or passport?',
        meaningVi: 'Vâng, tôi đã thấy thông tin phòng Deluxe giường King của bạn. Tôi có thể xin CMND/CCCD hoặc hộ chiếu của bạn được không?',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        text: 'Here is my passport. Could I possibly request a room on a high floor with a city view?',
        ipa: '/hɪər ɪz maɪ ˈpæspɔːrt. kʊd aɪ ˈpɑːsəbli rɪˈkwɛst ə ruːm ɑːn ə haɪ flɔːr wɪð ə ˈsɪti vjuː/',
        meaningVi: 'Đây là hộ chiếu của tôi. Tôi có thể xin một phòng ở tầng cao với view nhìn ra thành phố được không?',
        hint: 'Nói "Here is my passport. Could I possibly request a room on a high floor with a city view"',
        acceptableAlternatives: [
          "Here is my passport. Can I get a room on a high floor with city view please",
          "Here you go. Is it possible to have a high floor room with city view"
        ]
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        text: 'Certainly! You are in Room 1805 on the 18th floor. Here is your key card. Breakfast is served from 6:30 to 10:00 AM.',
        meaningVi: 'Chắc chắn rồi! Bạn ở phòng 1805 trên tầng 18. Đây là thẻ khóa phòng. Bữa sáng phục vụ từ 6h30 đến 10h00 sáng nhé.',
      },
      {
        id: 'turn-6',
        speaker: 'user',
        text: 'That sounds wonderful. What is the Wifi password and where is the elevator?',
        ipa: '/ðæt saʊndz ˈwʌndərfəl. wʌt ɪz ðə ˈwaɪfaɪ ˈpæswɜːrd ænd wɛər ɪz ðiː ˈɛləveɪtər/',
        meaningVi: 'Tuyệt vời quá. Mật khẩu Wifi là gì và thang máy ở hướng nào vậy bạn?',
        hint: 'Nói "That sounds wonderful. What is the Wifi password and where is the elevator"',
        acceptableAlternatives: [
          "Great, what is the Wifi password and where are the elevators",
          "Thank you, could you tell me the Wifi password and elevator location"
        ]
      }
    ]
  },
  {
    id: 'scenario-clothing-shopping',
    title: 'Mua Sắm Quần Áo & Phòng Thử Đồ (Shopping)',
    description: 'Thực hành hỏi size áo quần, hỏi vị trí phòng thay đồ, hỏi chương trình giảm giá và thanh toán.',
    category: 'shopping',
    difficulty: 'easy',
    icon: 'ShoppingBag',
    color: 'from-pink-500 to-rose-600',
    location: 'Cửa hàng Thời trang Zara - New York',
    xpReward: 30,
    aiCharacter: {
      name: 'Jessica',
      role: 'Nhân viên Cửa hàng',
      avatar: '👗',
      voiceGender: 'female',
    },
    userRole: {
      name: 'Khách mua sắm',
      role: 'Người mua hàng',
      avatar: '🛍️',
    },
    dialogue: [
      {
        id: 'turn-1',
        speaker: 'ai',
        text: 'Hi there! Are you looking for anything in particular today, or just browsing?',
        meaningVi: 'Xin chào! Hôm nay bạn đang tìm kiếm món đồ nào cụ thể hay chỉ đang xem qua thôi?',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        text: 'I really like this jacket. Do you have this in a medium size and in black color?',
        ipa: '/aɪ ˈrɪəli laɪk ðɪs ˈdʒækɪt. duː juː hæv ðɪs ɪn ə ˈmiːdiəm saɪz ænd ɪn blæk ˈkʌlər/',
        meaningVi: 'Tôi rất thích chiếc áo khoác này. Bạn có áo này cỡ vừa (size M) và màu đen không?',
        hint: 'Nói "I really like this jacket. Do you have this in a medium size and in black color"',
        acceptableAlternatives: [
          "I like this jacket, do you have it in size medium and black",
          "Do you have this jacket in black and medium size please"
        ]
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        text: 'Let me check the stock for you... Yes, here is a medium in black! Would you like to try it on?',
        meaningVi: 'Để tôi kiểm tra kho giúp bạn nhé... Có rồi, đây là size M màu đen! Bạn có muốn thử áo vào người không?',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        text: 'Yes please, where are the fitting rooms located?',
        ipa: '/jɛs pliːz, wɛər ɑːr ðə ˈfɪtɪŋ ruːmz loʊˈkeɪtɪd/',
        meaningVi: 'Có chứ, phòng thử đồ nằm ở vị trí nào vậy bạn?',
        hint: 'Nói "Yes please, where are the fitting rooms located"',
        acceptableAlternatives: [
          "Yes please, where is the fitting room",
          "Yes, where can I try this on"
        ]
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        text: 'The fitting rooms are right around the corner on your left. Take your time!',
        meaningVi: 'Phòng thử đồ ở ngay khúc rẽ bên tay trái của bạn. Bạn cứ thong thả thử nhé!',
      },
      {
        id: 'turn-6',
        speaker: 'user',
        text: 'It fits perfectly! Is there any discount on this item today?',
        ipa: '/ɪt fɪts ˈpɜːrfɪktli! ɪz ðɛər ˈɛni ˈdɪskaʊnt ɑːn ðɪs ˈaɪtəm təˈdeɪ/',
        meaningVi: 'Áo vừa vặn hoàn hảo luôn! Sản phẩm này hôm nay có được giảm giá không bạn?',
        hint: 'Nói "It fits perfectly! Is there any discount on this item today"',
        acceptableAlternatives: [
          "It fits great, is there a discount on this item",
          "I will take it, is there any sale or discount on this"
        ]
      }
    ]
  },
  {
    id: 'scenario-asking-directions',
    title: 'Hỏi Đường Đi Tàu Điện Ngầm (Directions)',
    description: 'Thực hành hỏi người dân địa phương đường đến ga tàu điện ngầm gần nhất và cách mua vé.',
    category: 'travel',
    difficulty: 'medium',
    icon: 'MapPin',
    color: 'from-teal-500 to-cyan-600',
    location: 'Quảng trường Thời Đại (Times Square)',
    xpReward: 35,
    aiCharacter: {
      name: 'Alex',
      role: 'Người dân địa phương',
      avatar: '🚶‍♂️',
      voiceGender: 'male',
    },
    userRole: {
      name: 'Du khách lạc đường',
      role: 'Khách du lịch',
      avatar: '🗺️',
    },
    dialogue: [
      {
        id: 'turn-1',
        speaker: 'ai',
        text: 'Excuse me, you look a bit lost. Do you need any help with directions?',
        meaningVi: 'Xin lỗi, trông bạn có vẻ hơi lạc đường. Bạn có cần giúp đỡ chỉ đường không?',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        text: 'Excuse me, could you please tell me how to get to the nearest subway station?',
        ipa: '/ɪkˈskjuːz miː, kʊd juː pliːz tɛl miː haʊ tuː ɡɛt tuː ðə ˈnɪərɪst ˈsʌbweɪ ˈsteɪʃn/',
        meaningVi: 'Xin lỗi bạn, bạn có thể chỉ giúp tôi đường đến ga tàu điện ngầm gần nhất được không?',
        hint: 'Nói "Excuse me, could you please tell me how to get to the nearest subway station"',
        acceptableAlternatives: [
          "Excuse me, where is the nearest subway station please",
          "Could you tell me the way to the subway station"
        ]
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        text: 'Sure! Walk straight for two blocks, then take a left at the pharmacy. It is right across from the park.',
        meaningVi: 'Được chứ! Bạn đi thẳng qua 2 dãy nhà, sau đó rẽ trái ở chỗ hiệu thuốc. Ga tàu nằm ngay đối diện công viên.',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        text: 'Walk straight two blocks, then turn left at the pharmacy. How long does it take to walk there?',
        ipa: '/wɔːk streɪt tuː blɑːks, ðɛn tɜːrn lɛft æt ðə ˈfɑːrməsi. haʊ lɔːŋ dʌz ɪt teɪk tuː wɔːk ðɛər/',
        meaningVi: 'Đi thẳng 2 dãy nhà rồi rẽ trái ở hiệu thuốc. Đi bộ đến đó mất bao lâu vậy bạn?',
        hint: 'Nói "Walk straight two blocks, then turn left at the pharmacy. How long does it take to walk there"',
        acceptableAlternatives: [
          "Turn left at the pharmacy, how far is it on foot",
          "How many minutes does it take to walk there"
        ]
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        text: 'It only takes about five minutes on foot. You cannot miss the big green subway sign!',
        meaningVi: 'Chỉ mất khoảng 5 phút đi bộ thôi. Bạn sẽ nhìn thấy ngay biển hiệu màu xanh lá cây của ga tàu!',
      },
      {
        id: 'turn-6',
        speaker: 'user',
        text: 'Thank you so much for your kind help, I really appreciate it!',
        ipa: '/θæŋk juː soʊ mʌtʃ fɔːr jɔːr kaɪnd hɛlp, aɪ ˈrɪəli əˈpriːʃieɪt ɪt/',
        meaningVi: 'Cảm ơn sự giúp đỡ tận tình của bạn rất nhiều, tôi thực sự cảm kích!',
        hint: 'Nói "Thank you so much for your kind help, I really appreciate it"',
        acceptableAlternatives: [
          "Thank you very much for your help",
          "Thanks a lot, I appreciate your help"
        ]
      }
    ]
  }
];
