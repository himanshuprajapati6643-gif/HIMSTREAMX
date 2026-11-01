// ==========================================================================
// HIMSTREAMX - PROFESSIONAL OTT + MUSIC PLATFORM SONG DATABASE
// Developed by Himanshu Prajapati (2026)
// Curated Royalty-Free Demo Tracks across Languages, Genres & Moods
// ==========================================================================

const SONGS_DATABASE = [
    // ----------------------------------------------------
    // 1. HINDI SONGS
    // ----------------------------------------------------
    {
        id: "song-kesariya-lofi",
        title: "Kesariya (Midnight Lo-fi)",
        artist: "Arijit Singh, Pritam",
        album: "Brahmastra Chill Session",
        language: "Hindi",
        genre: "Lo-fi",
        category: "Romantic",
        year: 2024,
        duration: "3:48",
        durationSec: 228,
        popularity: 98,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        lyrics: "Mujhko itna bataye koi, kaise tujhse dil na lagaye koi... Kesariya tera ishq hai piya, rang jaaun jo main haath lagaun."
    },
    {
        id: "song-chaleya-groove",
        title: "Chaleya (Club Groove Remix)",
        artist: "Arijit Singh, Shilpa Rao",
        album: "Jawan Dance Edition",
        language: "Hindi",
        genre: "Party",
        category: "Trending",
        year: 2023,
        duration: "3:20",
        durationSec: 200,
        popularity: 96,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        lyrics: "Ishq mein dil bana hai, ishq mein dil fana hai... Chaleya yun hi chalte rahein safar mein."
    },
    {
        id: "song-pehle-bhi-main",
        title: "Pehle Bhi Main (Acoustic Soul)",
        artist: "Vishal Mishra, Raj Shekhar",
        album: "Animal Unplugged",
        language: "Hindi",
        genre: "Romantic",
        category: "Romantic",
        year: 2024,
        duration: "4:10",
        durationSec: 250,
        popularity: 97,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        lyrics: "Pehle bhi main tumse mila hoon, pehli dafa hi milke laga... Tu hi mera aaina, tu hi meri dua."
    },
    {
        id: "song-tum-hi-ho-sad",
        title: "Tum Hi Ho (Strings & Rain)",
        artist: "Arijit Singh, Mithoon",
        album: "Aashiqui Memories",
        language: "Hindi",
        genre: "Sad",
        category: "Sad",
        year: 2023,
        duration: "4:22",
        durationSec: 262,
        popularity: 94,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        lyrics: "Hum tere bin ab reh nahi sakte, tere bina kya wajood mera... Kyunki tum hi ho, ab tum hi ho, zindagi ab tum hi ho."
    },
    {
        id: "song-apna-bana-le",
        title: "Apna Bana Le Piya",
        artist: "Arijit Singh, Sachin-Jigar",
        album: "Bhediya Heartbeats",
        language: "Hindi",
        genre: "Romantic",
        category: "Romantic",
        year: 2023,
        duration: "3:52",
        durationSec: 232,
        popularity: 93,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        lyrics: "Apna bana le piya, apna bana le piya... Dil ke nagar mein shehar tu basa le piya."
    },

    // ----------------------------------------------------
    // 2. BHOJPURI SONGS
    // ----------------------------------------------------
    {
        id: "song-lollipop-lagelu-remix",
        title: "Lollipop Lagelu (Festive EDM Drop)",
        artist: "Pawan Singh",
        album: "Bhojpuri Club Explosion 2026",
        language: "Bhojpuri",
        genre: "DJ/Remix",
        category: "Party",
        year: 2024,
        duration: "3:35",
        durationSec: 215,
        popularity: 99,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        lyrics: "Kamariya kare lapa-lap, lollipop lagelu! Jab aave tu DJ pe, sabka hosh udaave!"
    },
    {
        id: "song-raja-ji-ke-dil",
        title: "Raja Ji Ke Dil Mein",
        artist: "Khesari Lal Yadav, Shilpi Raj",
        album: "Purvanchal Hits",
        language: "Bhojpuri",
        genre: "Folk",
        category: "Trending",
        year: 2024,
        duration: "3:18",
        durationSec: 198,
        popularity: 92,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        lyrics: "Raja ji ke dil mein basi baate, hamro se pyari lageli ratiya."
    },
    {
        id: "song-chhalakata-jawaniya",
        title: "Chhalakata Hamro Jawaniya",
        artist: "Pawan Singh, Priyanka Singh",
        album: "Bhojpuri Blockbuster Hits",
        language: "Bhojpuri",
        genre: "Party",
        category: "Party",
        year: 2023,
        duration: "3:44",
        durationSec: 224,
        popularity: 95,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        lyrics: "Chhalakata hamro jawaniya ye raja, jaise dahi ke matkiya bhatar bina ho."
    },
    {
        id: "song-bhojpuri-lofi-night",
        title: "Bhojpuri Bidesiya (Acoustic Lo-Fi)",
        artist: "Manoj Tiwari, Folk Ensemble",
        album: "Desi Soil Lo-Fi",
        language: "Bhojpuri",
        genre: "Lo-fi",
        category: "Sad",
        year: 2024,
        duration: "4:05",
        durationSec: 245,
        popularity: 88,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        lyrics: "Bidesiya re bidesiya, kab aiba humre duar... Piya pardes gailen, naina rove barambar."
    },

    // ----------------------------------------------------
    // 3. PUNJABI SONGS
    // ----------------------------------------------------
    {
        id: "song-excuses-urban",
        title: "Excuses (Urban Night Drive)",
        artist: "AP Dhillon, Gurinder Gill",
        album: "Majhail Sessions",
        language: "Punjabi",
        genre: "Lo-fi",
        category: "Trending",
        year: 2024,
        duration: "3:02",
        durationSec: 182,
        popularity: 98,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        lyrics: "Kehndi hundi si chann tak raah bana de, tare ne pasand menu hethaan saare laa de..."
    },
    {
        id: "song-lover-diljit",
        title: "Lover (Coachella Stage Live)",
        artist: "Diljit Dosanjh",
        album: "MoonChild Era 2026",
        language: "Punjabi",
        genre: "Party",
        category: "Romantic",
        year: 2024,
        duration: "3:12",
        durationSec: 192,
        popularity: 97,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        lyrics: "Ho tera ni tera lover, ho tera ni tera lover... Karu karda ni sabar, baby tere pyar vich."
    },
    {
        id: "song-brown-munde-trap",
        title: "Brown Munde (Bass Boosted)",
        artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon",
        album: "Brown Wave",
        language: "Punjabi",
        genre: "Workout",
        category: "Workout",
        year: 2023,
        duration: "4:01",
        durationSec: 241,
        popularity: 95,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        lyrics: "Desi je geet aa trappy je beat aa, siron laike pairan tak brown munde!"
    },
    {
        id: "song-born-to-shine",
        title: "Born To Shine (Bhangra Anthem)",
        artist: "Diljit Dosanjh",
        album: "G.O.A.T.",
        language: "Punjabi",
        genre: "DJ/Remix",
        category: "Party",
        year: 2023,
        duration: "3:30",
        durationSec: 210,
        popularity: 94,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        lyrics: "Aaye haaye oye! Kise de dabaye nahiyo dabde hunde... Born to shine baby, sada swag wakhra."
    },

    // ----------------------------------------------------
    // 4. HARYANVI SONGS
    // ----------------------------------------------------
    {
        id: "song-52-gaj-ka-daman",
        title: "52 Gaj Ka Daman (Desi Bass Edition)",
        artist: "Renuka Panwar, Aman Jaji",
        album: "Haryanvi Folk Superhits",
        language: "Haryanvi",
        genre: "Folk",
        category: "Trending",
        year: 2024,
        duration: "3:10",
        durationSec: 190,
        popularity: 99,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        lyrics: "52 gaj ka daman pehar matak chalungi... Gaam mein mach gaya hallaa jab payal chhankungi!"
    },
    {
        id: "song-gypsy-balam",
        title: "Gypsy (Balam Thanedar DJ Remix)",
        artist: "GD Kaur, Pranjal Dahiya",
        album: "Haryana Beats Vol. 4",
        language: "Haryanvi",
        genre: "DJ/Remix",
        category: "Party",
        year: 2024,
        duration: "3:05",
        durationSec: 185,
        popularity: 96,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        lyrics: "Mera balam thanedar chalave gypsy... Ghumave mane saara gaam, kare salute dilli!"
    },
    {
        id: "song-moto-haryanvi",
        title: "Moto (Acoustic Desi Chill)",
        artist: "Diler Kharkiya",
        album: "Haryanvi Love Stories",
        language: "Haryanvi",
        genre: "Romantic",
        category: "Romantic",
        year: 2023,
        duration: "3:40",
        durationSec: 220,
        popularity: 90,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        lyrics: "Moti moti akhiyaan te kare ghani vaar... Meri soni moto rani mane lage jaan se pyari."
    },

    // ----------------------------------------------------
    // 5. RAJASTHANI SONGS
    // ----------------------------------------------------
    {
        id: "song-kesariya-balam",
        title: "Kesariya Balam (Heritage Sarangi & Sand)",
        artist: "Mame Khan",
        album: "Royal Desert Rhythms",
        language: "Rajasthani",
        genre: "Classical",
        category: "Folk",
        year: 2024,
        duration: "4:30",
        durationSec: 270,
        popularity: 91,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        lyrics: "Kesariya balam, aavo ni padharo mhare desh... Re mhare pyare desh padharo balama."
    },
    {
        id: "song-choudhary-folk",
        title: "Choudhary (Coke Studio Folk Fusion)",
        artist: "Mame Khan, Amit Trivedi",
        album: "Desert Fusion 2026",
        language: "Rajasthani",
        genre: "Folk",
        category: "Trending",
        year: 2023,
        duration: "4:15",
        durationSec: 255,
        popularity: 93,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        lyrics: "Bhanwar sa mane le chalo re, choudhary ro daulat manko na bhaye re."
    },

    // ----------------------------------------------------
    // 6. BENGALI SONGS
    // ----------------------------------------------------
    {
        id: "song-ami-je-tomar",
        title: "Ami Je Tomar (Royal Sitar Fusion)",
        artist: "Arijit Singh, Shreya Ghoshal",
        album: "Bhool Bhulaiyaa Classical",
        language: "Bengali",
        genre: "Classical",
        category: "Romantic",
        year: 2024,
        duration: "4:45",
        durationSec: 285,
        popularity: 94,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        lyrics: "Ami je tomar, shudhu je tomar... Moner majhe royechho tumi chirokal."
    },
    {
        id: "song-tumi-robe-nirobe",
        title: "Tumi Robe Nirobe (Rabindra Lo-Fi)",
        artist: "Anupam Roy, Lofi Beats",
        album: "Bengal Monsoons",
        language: "Bengali",
        genre: "Lo-fi",
        category: "Sad",
        year: 2023,
        duration: "3:50",
        durationSec: 230,
        popularity: 89,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        lyrics: "Tumi robe nirobe hridoye momo... Nibiro nibhrite e je koto valobasha."
    },

    // ----------------------------------------------------
    // 7. MARATHI SONGS
    // ----------------------------------------------------
    {
        id: "song-zingaat-dhol",
        title: "Zingaat (High-Voltage Nashik Dhol)",
        artist: "Ajay-Atul",
        album: "Sairat Festive Beats",
        language: "Marathi",
        genre: "Party",
        category: "Party",
        year: 2024,
        duration: "3:46",
        durationSec: 226,
        popularity: 97,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        lyrics: "Zingaat zing-zing zingaat! Ude dholak taasha, nache pora pori bindaas!"
    },
    {
        id: "song-apsara-aali",
        title: "Apsara Aali (Lavani EDM Mix)",
        artist: "Bela Shende, Ajay-Atul",
        album: "Natarang Royal Suite",
        language: "Marathi",
        genre: "DJ/Remix",
        category: "Trending",
        year: 2023,
        duration: "3:58",
        durationSec: 238,
        popularity: 91,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        lyrics: "Aali aali aali ho apsara aali! Sundar rupachi khan, manmohini jadu kashi keli!"
    },

    // ----------------------------------------------------
    // 8. GUJARATI SONGS
    // ----------------------------------------------------
    {
        id: "song-khalasi-coke-studio",
        title: "Khalasi (Sailor's Rhythm Live)",
        artist: "Aditya Gadhvi, Achint",
        album: "Coke Studio Bharat 2024",
        language: "Gujarati",
        genre: "Folk",
        category: "Trending",
        year: 2024,
        duration: "3:42",
        durationSec: 222,
        popularity: 99,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        lyrics: "Gotilo gotilo saajan gotilo... Dariya kinar chalya khalasi re!"
    },
    {
        id: "song-chogada-tara-garba",
        title: "Chogada Tara (Navratri Non-Stop Garba)",
        artist: "Darshan Raval, Asees Kaur",
        album: "Loveyatri Dandiya Edition",
        language: "Gujarati",
        genre: "Party",
        category: "Party",
        year: 2023,
        duration: "4:08",
        durationSec: 248,
        popularity: 95,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        lyrics: "Chogada tara chabila tara rangila tara... Chhodi na jaaje re, garbe ghumva aav re!"
    },

    // ----------------------------------------------------
    // 9. SOUTH INDIAN MUSIC (Tamil, Telugu, Malayalam, Kannada)
    // ----------------------------------------------------
    {
        id: "song-naatu-naatu",
        title: "Naatu Naatu (Oscar Winner High Energy)",
        artist: "Rahul Sipligunj, Kaala Bhairava, M.M. Keeravani",
        album: "RRR Soundtrack",
        language: "South Indian",
        genre: "Workout",
        category: "Workout",
        year: 2023,
        duration: "3:34",
        durationSec: 214,
        popularity: 99,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        lyrics: "Naatu naatu naatu naatu veera naatu! Pacha mirchi laga dummu lepe naatu!"
    },
    {
        id: "song-arabic-kuthu",
        title: "Arabic Kuthu (Halamithi Habibo Club Drop)",
        artist: "Anirudh Ravichander, Jonita Gandhi",
        album: "Beast Club Sessions",
        language: "South Indian",
        genre: "Party",
        category: "Party",
        year: 2024,
        duration: "4:40",
        durationSec: 280,
        popularity: 96,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        lyrics: "Halamithi habibo, halamithi habibo! Malama pitha pithadhe, kuthu beat pottudhe!"
    },
    {
        id: "song-oo-antava",
        title: "Oo Antava Mava (Deep Bass Groove)",
        artist: "Indravathi Chauhan, Devi Sri Prasad",
        album: "Pushpa The Rise",
        language: "South Indian",
        genre: "DJ/Remix",
        category: "Trending",
        year: 2023,
        duration: "3:44",
        durationSec: 224,
        popularity: 95,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        lyrics: "Oo antava mava, oo oo antava mava... Koka koka koodithe, chupu chupu choodithe!"
    },

    // ----------------------------------------------------
    // 10. ENGLISH SONGS & GLOBAL HITS
    // ----------------------------------------------------
    {
        id: "song-blinding-lights-synthwave",
        title: "Blinding Lights (Retro 80s Synthwave)",
        artist: "The Weeknd, Max Martin",
        album: "After Hours Neon Era",
        language: "English",
        genre: "Workout",
        category: "Workout",
        year: 2024,
        duration: "3:20",
        durationSec: 200,
        popularity: 99,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        lyrics: "I said, ooh, I'm blinded by the lights... No, I can't sleep until I feel your touch."
    },
    {
        id: "song-starboy-nightfall",
        title: "Starboy (Nightfall Cyber Remix)",
        artist: "The Weeknd ft. Daft Punk",
        album: "Starboy Legacy",
        language: "English",
        genre: "Party",
        category: "Trending",
        year: 2023,
        duration: "3:50",
        durationSec: 230,
        popularity: 97,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        lyrics: "Look what you've done! I'm a motherf***ing starboy... Every day a star is born, clap if you feel."
    },
    {
        id: "song-levitating-disco",
        title: "Levitating (Space Disco Funk)",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        language: "English",
        genre: "Party",
        category: "Party",
        year: 2023,
        duration: "3:23",
        durationSec: 203,
        popularity: 95,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        lyrics: "If you wanna run away with me, I know a galaxy and I can take you for a ride..."
    },

    // ----------------------------------------------------
    // 11. INSTRUMENTAL & LO-FI
    // ----------------------------------------------------
    {
        id: "song-cyberpunk-synth-rain",
        title: "Cyberpunk Rain in Neo-Tokyo",
        artist: "HIMSTREAMX Sound Lab",
        album: "Neon Dreams Chillout",
        language: "Instrumental",
        genre: "Lo-fi",
        category: "Lo-fi",
        year: 2024,
        duration: "3:30",
        durationSec: 210,
        popularity: 92,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        lyrics: "[Ambient Synthwave instrumental with soft rhythmic vinyl rain texture]"
    },
    {
        id: "song-sitar-meets-lofi",
        title: "Sitar Meets Ambient Lo-fi",
        artist: "Pandit Ravi Shankar Tribute Project",
        album: "Ganga Sunset Lo-Fi",
        language: "Instrumental",
        genre: "Instrumental",
        category: "Lo-fi",
        year: 2024,
        duration: "4:12",
        durationSec: 252,
        popularity: 90,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        lyrics: "[Mesmerizing acoustic Sitar strings blended with subtle 70 BPM hip-hop drums]"
    },

    // ----------------------------------------------------
    // 12. DEVOTIONAL SONGS
    // ----------------------------------------------------
    {
        id: "song-hanuman-chalisa-meditative",
        title: "Shri Hanuman Chalisa (Meditative Flute)",
        artist: "Hariharan, Gulshan Kumar Tribute",
        album: "Divine Peace & Energy",
        language: "Hindi",
        genre: "Devotional",
        category: "Devotional",
        year: 2024,
        duration: "9:42",
        durationSec: 582,
        popularity: 99,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        lyrics: "Shri Guru Charan Saroj Raj, Nij Manu Mukuru Sudhari... Barnao Raghuvar Bimal Jasu, Jo Dayaku Phal Chari."
    },
    {
        id: "song-shiv-tandav-fusion",
        title: "Shiv Tandav Stotram (Divine Cosmic Roar)",
        artist: "Shankar Mahadevan, Drums of Kashi",
        album: "Kailash Cosmic Resonance",
        language: "Devotional",
        genre: "Devotional",
        category: "Devotional",
        year: 2023,
        duration: "5:20",
        durationSec: 320,
        popularity: 97,
        isTrending: true,
        coverImage: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        lyrics: "Jatatavee gala jjala pravaha pavitha sthale... Gale avalambya lambitham bhujanga thunga malikam!"
    },
    {
        id: "song-radhe-krishna-flute",
        title: "Radhe Radhe Barsane Wali (Soulful Flute)",
        artist: "Gaurav Krishna Goswami",
        album: "Vrindavan Bliss",
        language: "Hindi",
        genre: "Devotional",
        category: "Devotional",
        year: 2023,
        duration: "4:50",
        durationSec: 290,
        popularity: 93,
        isTrending: false,
        coverImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        lyrics: "Radhe radhe barsane wali radhe... Radha rani meri sarkar, fikar mane kahe ki re!"
    }
];

// ==========================================================================
// POPULAR ARTISTS DIRECTORY FOR HIMSTREAMX
// ==========================================================================
const POPULAR_ARTISTS = [
    {
        id: "artist-arijit-singh",
        name: "Arijit Singh",
        image: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg",
        searchQuery: "Arijit Singh songs",
        role: "The Voice of Romance",
        language: "Hindi / Bengali",
        monthlyListeners: "84.2M"
    },
    {
        id: "artist-pawan-singh",
        name: "Pawan Singh",
        image: "https://i.ytimg.com/vi/Gr8G_ldltDE/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/Gr8G_ldltDE/hqdefault.jpg",
        searchQuery: "Pawan Singh Bhojpuri songs",
        role: "Power Star of Bhojpuri",
        language: "Bhojpuri",
        monthlyListeners: "42.8M"
    },
    {
        id: "artist-khesari-lal",
        name: "Khesari Lal Yadav",
        image: "https://i.ytimg.com/vi/-ne8iFefgpc/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/-ne8iFefgpc/hqdefault.jpg",
        searchQuery: "Khesari Lal Yadav Bhojpuri songs",
        role: "Purvanchal Megastar",
        language: "Bhojpuri",
        monthlyListeners: "36.4M"
    },
    {
        id: "artist-diljit-dosanjh",
        name: "Diljit Dosanjh",
        image: "https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg",
        searchQuery: "Diljit Dosanjh Punjabi songs",
        role: "Global Punjabi Icon",
        language: "Punjabi",
        monthlyListeners: "39.5M"
    },
    {
        id: "artist-shilpi-raj",
        name: "Shilpi Raj",
        image: "https://i.ytimg.com/vi/ifDx3LhpyGg/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/ifDx3LhpyGg/hqdefault.jpg",
        searchQuery: "Shilpi Raj Bhojpuri songs",
        role: "Trending Bhojpuri Sensation",
        language: "Bhojpuri",
        monthlyListeners: "34.2M"
    },
    {
        id: "artist-renuka-panwar",
        name: "Renuka Panwar",
        image: "https://i.ytimg.com/vi/CZt-rVn2BJs/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/CZt-rVn2BJs/hqdefault.jpg",
        searchQuery: "Renuka Panwar Haryanvi songs",
        role: "Haryanvi Folk Sensation",
        language: "Haryanvi",
        monthlyListeners: "28.1M"
    },
    {
        id: "artist-ap-dhillon",
        name: "AP Dhillon",
        image: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg",
        searchQuery: "AP Dhillon Punjabi songs",
        role: "Brown Munde Pioneer",
        language: "Punjabi",
        monthlyListeners: "31.7M"
    },
    {
        id: "artist-shreya-ghoshal",
        name: "Shreya Ghoshal",
        image: "https://i.ytimg.com/vi/h6lHUn20J5g/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/h6lHUn20J5g/hqdefault.jpg",
        searchQuery: "Shreya Ghoshal romantic songs",
        role: "Queen of Melody",
        language: "Hindi / Multi-lingual",
        monthlyListeners: "52.3M"
    },
    {
        id: "artist-badshah",
        name: "Badshah",
        image: "https://i.ytimg.com/vi/SD4Z8dlZPd8/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/SD4Z8dlZPd8/hqdefault.jpg",
        searchQuery: "Badshah party songs",
        role: "Desi Hip-Hop King",
        language: "Hindi / Punjabi",
        monthlyListeners: "44.6M"
    },
    {
        id: "artist-anirudh",
        name: "Anirudh Ravichander",
        image: "https://i.ytimg.com/vi/k4yXQkG2s1E/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/k4yXQkG2s1E/hqdefault.jpg",
        searchQuery: "Anirudh Ravichander hits",
        role: "Rockstar Music Director",
        language: "South Indian",
        monthlyListeners: "45.0M"
    },
    {
        id: "artist-sid-sriram",
        name: "Sid Sriram",
        image: "https://i.ytimg.com/vi/hcMzwMrr1tE/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/hcMzwMrr1tE/hqdefault.jpg",
        searchQuery: "Sid Sriram South Indian songs",
        role: "Soulful Carnatic & Film Voice",
        language: "South Indian / Telugu / Tamil",
        monthlyListeners: "38.5M"
    },
    {
        id: "artist-ar-rahman",
        name: "A.R. Rahman",
        image: "https://i.ytimg.com/vi/T94PHkuydcw/hqdefault.jpg",
        avatar: "https://i.ytimg.com/vi/T94PHkuydcw/hqdefault.jpg",
        searchQuery: "A.R. Rahman Sufi hits",
        role: "Mozart of Madras & Oscar Winner",
        language: "Pan-Indian / Global",
        monthlyListeners: "68.9M"
    }
];

// ==========================================================================
// MUSIC GENRES DIRECTORY WITH THEMED GRADIENTS
// ==========================================================================
const MUSIC_GENRES = [
    { name: "Romantic", icon: "fa-heart", color: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)", count: "120+ Tracks" },
    { name: "Party", icon: "fa-champagne-glasses", color: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)", count: "95+ Tracks" },
    { name: "DJ/Remix", icon: "fa-compact-disc", color: "linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)", count: "80+ Tracks" },
    { name: "Lo-fi", icon: "fa-headphones", color: "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)", count: "140+ Tracks" },
    { name: "Folk", icon: "fa-guitar", color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", count: "75+ Tracks" },
    { name: "Devotional", icon: "fa-om", color: "linear-gradient(135deg, #ff8008 0%, #ffc837 100%)", count: "60+ Tracks" },
    { name: "Workout", icon: "fa-dumbbell", color: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)", count: "88+ Tracks" },
    { name: "Sad", icon: "fa-cloud-rain", color: "linear-gradient(135deg, #3a6073 0%, #3a7bd5 100%)", count: "70+ Tracks" },
    { name: "Classical", icon: "fa-music", color: "linear-gradient(135deg, #b24592 0%, #f15f79 100%)", count: "55+ Tracks" },
    { name: "Instrumental", icon: "fa-wave-square", color: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", count: "65+ Tracks" }
];

// Provide global access
if (typeof window !== "undefined") {
    window.SONGS_DATABASE = SONGS_DATABASE;
    window.POPULAR_ARTISTS = POPULAR_ARTISTS;
    window.MUSIC_GENRES = MUSIC_GENRES;
}
