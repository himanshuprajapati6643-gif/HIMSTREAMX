import json
import sqlite3
from backend.database import get_db, init_db
from backend.security import hash_password

def seed_database():
    """Seeds the SQLite database with admin, users, movies, songs, artists, genres and playlists."""
    init_db()

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Seed Users
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            print("Seeding Users...")
            admin_pw = hash_password("Admin@HIMSTREAMX2026!")
            user_pw = hash_password("User@HIMSTREAMX2026!")

            cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, role, avatar, plan, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "usr-himanshu-admin",
                "Himanshu Prajapati",
                "himanshuprajapati6643@gmail.com",
                admin_pw,
                "ADMIN",
                "HP",
                "Platform Creator VIP (4K UHD + Hi-Res Audio)",
                "active"
            ))

            cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, role, avatar, plan, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "usr-demo-user",
                "Demo Streamer",
                "user@himstreamx.com",
                user_pw,
                "USER",
                "DS",
                "Standard 4K Cinema + Music Pass",
                "active"
            ))

        # 2. Seed Movies & Series
        cursor.execute("SELECT COUNT(*) FROM movies")
        if cursor.fetchone()[0] == 0:
            print("Seeding Movies & Web Series Catalog...")
            movies_data = [
                {
                    "id": "stranger-things",
                    "title": "Stranger Things",
                    "type": "series",
                    "genres": ["Sci-Fi", "Horror", "Mystery", "Drama"],
                    "year": 2022,
                    "rating": 8.7,
                    "match": 98,
                    "age": "16+",
                    "duration": "4 Seasons",
                    "quality": "4K Ultra HD",
                    "badge": "GLOBAL TOP 1",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 1,
                    "poster": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "b9EkMc79ZSU",
                    "description": "When a young boy vanishes into thin air, a small Indiana town uncovers a supernatural mystery involving secret government experiments, terrifying forces, and a strange psychokinetic girl named Eleven.",
                    "director": "The Duffer Brothers",
                    "cast_list": ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour", "Gaten Matarazzo"],
                    "audio": "Hindi, English [Original], Tamil, Telugu",
                    "subtitles": "English, Hindi"
                },
                {
                    "id": "oppenheimer",
                    "title": "Oppenheimer",
                    "type": "movie",
                    "genres": ["Drama", "History", "Biography", "Thriller"],
                    "year": 2023,
                    "rating": 8.9,
                    "match": 99,
                    "age": "18+",
                    "duration": "3h 00m",
                    "quality": "IMAX 4K",
                    "badge": "7 OSCARS",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 2,
                    "poster": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "uYPbbksJxIg",
                    "description": "Christopher Nolan's epic biographical thriller chronicles the life of theoretical physicist J. Robert Oppenheimer, the director of the Los Alamos Laboratory during the Manhattan Project, and the fateful dawn of the atomic age.",
                    "director": "Christopher Nolan",
                    "cast_list": ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh"],
                    "audio": "English [Original], Hindi",
                    "subtitles": "English, Hindi, Spanish"
                },
                {
                    "id": "interstellar",
                    "title": "Interstellar",
                    "type": "movie",
                    "genres": ["Sci-Fi", "Adventure", "Drama"],
                    "year": 2014,
                    "rating": 8.7,
                    "match": 97,
                    "age": "13+",
                    "duration": "2h 49m",
                    "quality": "4K Dolby Vision",
                    "badge": "ALL-TIME CLASSIC",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 3,
                    "poster": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "zSWdZVtXT7E",
                    "description": "When Earth faces environmental collapse, a former NASA pilot leads a daring interstellar voyage through a newly opened wormhole to find a habitable new planet for mankind before time runs out.",
                    "director": "Christopher Nolan",
                    "cast_list": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
                    "audio": "English [Original], Hindi",
                    "subtitles": "English, Hindi"
                },
                {
                    "id": "the-dark-knight",
                    "title": "The Dark Knight",
                    "type": "movie",
                    "genres": ["Action", "Crime", "Drama", "Thriller"],
                    "year": 2008,
                    "rating": 9.0,
                    "match": 99,
                    "age": "16+",
                    "duration": "2h 32m",
                    "quality": "4K Ultra HD",
                    "badge": "IMDb TOP 3",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 5,
                    "poster": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "EXeTwQWrcwY",
                    "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                    "director": "Christopher Nolan",
                    "cast_list": ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Gary Oldman"],
                    "audio": "English [Original], Hindi, Tamil, Telugu",
                    "subtitles": "English, Hindi"
                },
                {
                    "id": "breaking-bad",
                    "title": "Breaking Bad",
                    "type": "series",
                    "genres": ["Crime", "Drama", "Thriller"],
                    "year": 2013,
                    "rating": 9.5,
                    "match": 99,
                    "age": "18+",
                    "duration": "5 Seasons",
                    "quality": "4K Ultra HD",
                    "badge": "ALL-TIME #1",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 8,
                    "poster": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "HhesaQXLuRY",
                    "description": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's financial future.",
                    "director": "Vince Gilligan",
                    "cast_list": ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Dean Norris", "Bob Odenkirk"],
                    "audio": "English [Original], Hindi",
                    "subtitles": "English, Hindi"
                },
                {
                    "id": "wednesday",
                    "title": "Wednesday",
                    "type": "series",
                    "genres": ["Comedy", "Fantasy", "Mystery", "Crime"],
                    "year": 2022,
                    "rating": 8.1,
                    "match": 94,
                    "age": "13+",
                    "duration": "1 Season",
                    "quality": "4K Dolby Vision",
                    "badge": "VIRAL SENSATION",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 9,
                    "poster": "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "Di310BC80ew",
                    "description": "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a monstrous murder spree while making new friends and foes at Nevermore Academy.",
                    "director": "Tim Burton",
                    "cast_list": ["Jenna Ortega", "Gwendoline Christie", "Riki Lindhome", "Christina Ricci"],
                    "audio": "Hindi, English [Original], Spanish",
                    "subtitles": "English, Hindi"
                },
                {
                    "id": "stree-2",
                    "title": "Stree 2: Sarkate Ka Aatank",
                    "type": "movie",
                    "genres": ["Comedy", "Horror", "Mystery", "Hindi"],
                    "year": 2024,
                    "rating": 7.3,
                    "match": 96,
                    "age": "16+",
                    "duration": "2h 27m",
                    "quality": "4K Ultra HD",
                    "badge": "BOLLYWOOD #1",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 0,
                    "poster": "https://upload.wikimedia.org/wikipedia/en/5/53/Stree_2_poster.jpg",
                    "backdrop": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "KVnZ5Fz1X3o",
                    "description": "The town of Chanderi faces a terrifying new menace: a headless entity named Sarkata that abducts women. Vicky and his friends join hands with Stree to save their village.",
                    "director": "Amar Kaushik",
                    "cast_list": ["Rajkummar Rao", "Shraddha Kapoor", "Pankaj Tripathi", "Aparshakti Khurana"],
                    "audio": "Hindi [Original]",
                    "subtitles": "English"
                },
                {
                    "id": "12th-fail",
                    "title": "12th Fail",
                    "type": "movie",
                    "genres": ["Biography", "Drama", "Hindi"],
                    "year": 2023,
                    "rating": 8.9,
                    "match": 99,
                    "age": "U/A",
                    "duration": "2h 27m",
                    "quality": "4K Ultra HD",
                    "badge": "NATIONAL AWARD",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 0,
                    "poster": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "we3sD7gUf8s",
                    "description": "Based on the true story of Manoj Kumar Sharma, who rose from extreme poverty in Chambal to clear the world's toughest UPSC exam and become an IPS officer.",
                    "director": "Vidhu Vinod Chopra",
                    "cast_list": ["Vikrant Massey", "Medha Shankr", "Anant V Joshi", "Anshumaan Pushkar"],
                    "audio": "Hindi [Original], Tamil, Telugu, Kannada",
                    "subtitles": "English"
                },
                {
                    "id": "dune-part-two",
                    "title": "Dune: Part Two",
                    "type": "movie",
                    "genres": ["Sci-Fi", "Adventure", "Action"],
                    "year": 2024,
                    "rating": 8.6,
                    "match": 98,
                    "age": "13+",
                    "duration": "2h 46m",
                    "quality": "4K IMAX",
                    "badge": "SCI-FI MASTERPIECE",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 0,
                    "poster": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "Way9Dexny3w",
                    "description": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and the universe's fate, he prevents a terrible future.",
                    "director": "Denis Villeneuve",
                    "cast_list": ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
                    "audio": "English [Original], Hindi",
                    "subtitles": "English, Hindi"
                },
                {
                    "id": "kalki-2898-ad",
                    "title": "Kalki 2898 AD",
                    "type": "movie",
                    "genres": ["Sci-Fi", "Action", "Fantasy", "Hindi"],
                    "year": 2024,
                    "rating": 7.6,
                    "match": 95,
                    "age": "13+",
                    "duration": "3h 01m",
                    "quality": "4K Ultra HD",
                    "badge": "SCI-FI MYTHO",
                    "is_trending": 1,
                    "is_popular": 1,
                    "is_top10": 0,
                    "poster": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
                    "backdrop": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85",
                    "trailer_id": "kQDd1AhGIHk",
                    "description": "A modern avatar of the Hindu god Vishnu descends to Earth in a dystopian post-apocalyptic world to protect humanity from evil forces in the year 2898 AD.",
                    "director": "Nag Ashwin",
                    "cast_list": ["Prabhas", "Amitabh Bachchan", "Kamal Haasan", "Deepika Padukone"],
                    "audio": "Telugu [Original], Hindi, Tamil, Malayalam",
                    "subtitles": "English, Hindi"
                }
            ]

            for m in movies_data:
                cursor.execute("""
                INSERT OR IGNORE INTO movies (
                    id, title, type, genres, year, rating, match, age, duration, quality, badge,
                    is_trending, is_popular, is_top10, poster, backdrop, trailer_id, description,
                    director, cast_list, audio, subtitles
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    m["id"], m["title"], m["type"], json.dumps(m["genres"]), m["year"], m["rating"],
                    m["match"], m["age"], m["duration"], m["quality"], m["badge"], m["is_trending"],
                    m["is_popular"], m["is_top10"], m["poster"], m["backdrop"], m["trailer_id"],
                    m["description"], m["director"], json.dumps(m["cast_list"]), m["audio"], m["subtitles"]
                ))

        # 3. Seed Songs
        cursor.execute("SELECT COUNT(*) FROM songs")
        if cursor.fetchone()[0] == 0:
            print("Seeding Music Library across Languages & Genres...")
            songs_data = [
                # Hindi
                ("song-kesariya-lofi", "Kesariya (Midnight Lo-fi)", "Arijit Singh, Pritam", "Brahmastra Chill Session", "Hindi", "Lo-fi", 2024, "3:48", 228, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "Romantic", 98, 1, "Mujhko itna bataye koi, kaise tujhse dil na lagaye koi... Kesariya tera ishq hai piya."),
                ("song-chaleya-groove", "Chaleya (Club Groove Remix)", "Arijit Singh, Shilpa Rao", "Jawan Dance Edition", "Hindi", "Party", 2023, "3:20", 200, "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "Trending", 96, 1, "Ishq mein dil bana hai, ishq mein dil fana hai... Chaleya yun hi chalte rahein."),
                ("song-pehle-bhi-main", "Pehle Bhi Main (Acoustic Soul)", "Vishal Mishra, Raj Shekhar", "Animal Unplugged", "Hindi", "Romantic", 2024, "4:10", 250, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "Romantic", 97, 1, "Pehle bhi main tumse mila hoon, pehli dafa hi milke laga..."),
                ("song-tum-hi-ho-sad", "Tum Hi Ho (Strings & Rain)", "Arijit Singh, Mithoon", "Aashiqui Memories", "Hindi", "Sad", 2023, "4:22", 262, "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", "Sad", 94, 0, "Hum tere bin ab reh nahi sakte, tere bina kya wajood mera... Kyunki tum hi ho."),
                # Bhojpuri
                ("song-lollipop-lagelu-remix", "Lollipop Lagelu (Festive EDM Drop)", "Pawan Singh", "Bhojpuri Club Explosion 2026", "Bhojpuri", "DJ/Remix", 2024, "3:35", 215, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", "Party", 99, 1, "Kamariya kare lapa-lap, lollipop lagelu! Jab aave tu DJ pe sabka hosh udaave!"),
                ("song-raja-ji-ke-dil", "Raja Ji Ke Dil Mein", "Khesari Lal Yadav, Shilpi Raj", "Purvanchal Hits", "Bhojpuri", "Folk", 2024, "3:18", 198, "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", "Trending", 92, 1, "Raja ji ke dil mein basi baate, hamro se pyari lageli ratiya."),
                ("song-chhalakata-jawaniya", "Chhalakata Hamro Jawaniya", "Pawan Singh, Priyanka Singh", "Bhojpuri Blockbuster Hits", "Bhojpuri", "Party", 2023, "3:44", 224, "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", "Party", 95, 1, "Chhalakata hamro jawaniya ye raja, jaise dahi ke matkiya bhatar bina ho."),
                # Punjabi
                ("song-excuses-urban", "Excuses (Urban Night Drive)", "AP Dhillon, Gurinder Gill", "Majhail Sessions", "Punjabi", "Lo-fi", 2024, "3:02", 182, "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", "Trending", 98, 1, "Kehndi hundi si chann tak raah bana de, tare ne pasand menu hethaan saare laa de..."),
                ("song-lover-diljit", "Lover (Coachella Stage Live)", "Diljit Dosanjh", "MoonChild Era 2026", "Punjabi", "Party", 2024, "3:12", 192, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", "Romantic", 97, 1, "Ho tera ni tera lover, ho tera ni tera lover... Karu karda ni sabar baby."),
                ("song-brown-munde-trap", "Brown Munde (Bass Boosted)", "AP Dhillon, Gurinder Gill", "Brown Wave", "Punjabi", "Workout", 2023, "4:01", 241, "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", "Workout", 95, 0, "Desi je geet aa trappy je beat aa, siron laike pairan tak brown munde!"),
                # Haryanvi
                ("song-52-gaj-ka-daman", "52 Gaj Ka Daman (Desi Bass)", "Renuka Panwar, Aman Jaji", "Haryanvi Folk Superhits", "Haryanvi", "Folk", 2024, "3:10", 190, "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", "Trending", 99, 1, "52 gaj ka daman pehar matak chalungi... Gaam mein mach gaya hallaa!"),
                ("song-gypsy-balam", "Gypsy (Balam Thanedar DJ Remix)", "GD Kaur, Pranjal Dahiya", "Haryana Beats Vol. 4", "Haryanvi", "DJ/Remix", 2024, "3:05", 185, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", "Party", 96, 1, "Mera balam thanedar chalave gypsy... Ghumave mane saara gaam!"),
                # Rajasthani
                ("song-kesariya-balam", "Kesariya Balam (Heritage Sarangi)", "Mame Khan", "Royal Desert Rhythms", "Rajasthani", "Classical", 2024, "4:30", 270, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "Folk", 91, 1, "Kesariya balam aavo ni padharo mhare desh... Re mhare pyare desh padharo."),
                # Bengali
                ("song-ami-je-tomar", "Ami Je Tomar (Royal Sitar Fusion)", "Arijit Singh, Shreya Ghoshal", "Bhool Bhulaiyaa Classical", "Bengali", "Classical", 2024, "4:45", 285, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "Romantic", 94, 1, "Ami je tomar shudhu je tomar... Moner majhe royechho tumi chirokal."),
                # Marathi
                ("song-zingaat-dhol", "Zingaat (High-Voltage Nashik Dhol)", "Ajay-Atul", "Sairat Festive Beats", "Marathi", "Party", 2024, "3:46", 226, "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", "Party", 97, 1, "Zingaat zing-zing zingaat! Ude dholak taasha, nache pora pori bindaas!"),
                # Gujarati
                ("song-khalasi-coke-studio", "Khalasi (Sailor's Rhythm Live)", "Aditya Gadhvi, Achint", "Coke Studio Bharat", "Gujarati", "Folk", 2024, "3:42", 222, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", "Trending", 99, 1, "Gotilo gotilo saajan gotilo... Dariya kinar chalya khalasi re!"),
                # South Indian
                ("song-naatu-naatu", "Naatu Naatu (Oscar Winner Energy)", "Rahul Sipligunj, Kaala Bhairava", "RRR Soundtrack", "South Indian", "Workout", 2023, "3:34", 214, "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", "Workout", 99, 1, "Naatu naatu naatu naatu veera naatu! Pacha mirchi laga dummu lepe naatu!"),
                ("song-arabic-kuthu", "Arabic Kuthu (Halamithi Habibo)", "Anirudh Ravichander, Jonita Gandhi", "Beast Club Sessions", "South Indian", "Party", 2024, "4:40", 280, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", "Party", 96, 1, "Halamithi habibo, halamithi habibo! Malama pitha pithadhe, kuthu beat pottudhe!"),
                # English
                ("song-blinding-lights-synthwave", "Blinding Lights (Retro Synthwave)", "The Weeknd, Max Martin", "After Hours Neon Era", "English", "Workout", 2024, "3:20", 200, "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", "Workout", 99, 1, "I said, ooh, I'm blinded by the lights... No, I can't sleep until I feel your touch."),
                ("song-starboy-nightfall", "Starboy (Nightfall Cyber Remix)", "The Weeknd ft. Daft Punk", "Starboy Legacy", "English", "Party", 2023, "3:50", 230, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", "Trending", 97, 1, "Look what you've done! I'm a motherf***ing starboy..."),
                # Instrumental & Devotional
                ("song-cyberpunk-synth-rain", "Cyberpunk Rain in Neo-Tokyo", "HIMSTREAMX Sound Lab", "Neon Dreams Chillout", "Instrumental", "Lo-fi", 2024, "3:30", 210, "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", "Lo-fi", 92, 1, "[Ambient Synthwave instrumental with soft vinyl rain texture]"),
                ("song-hanuman-chalisa-meditative", "Shri Hanuman Chalisa (Meditative Flute)", "Hariharan, Gulshan Kumar Tribute", "Divine Peace & Energy", "Hindi", "Devotional", 2024, "9:42", 582, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "Devotional", 99, 1, "Shri Guru Charan Saroj Raj, Nij Manu Mukuru Sudhari... Barnao Raghuvar Bimal Jasu."),
                ("song-shiv-tandav-fusion", "Shiv Tandav Stotram (Divine Cosmic Roar)", "Shankar Mahadevan, Drums of Kashi", "Kailash Cosmic Resonance", "Devotional", "Devotional", 2023, "5:20", 320, "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "Devotional", 97, 1, "Jatatavee gala jjala pravaha pavitha sthale... Gale avalambya lambitham bhujanga thunga malikam!")
            ]

            for s in songs_data:
                cursor.execute("""
                INSERT OR IGNORE INTO songs (
                    id, title, artist, album, language, genre, year, duration, duration_sec,
                    cover_image, audio_url, category, popularity, is_trending, lyrics
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, s)

        # 4. Seed Artists
        cursor.execute("SELECT COUNT(*) FROM artists")
        if cursor.fetchone()[0] == 0:
            print("Seeding Artists...")
            artists_data = [
                ("artist-arijit-singh", "Arijit Singh", "The Voice of Romance", "Hindi / Bengali", "84.2M", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80", "India's highest streamed playback singer and multi-award winning melodic maestro."),
                ("artist-pawan-singh", "Pawan Singh", "Power Star of Bhojpuri", "Bhojpuri", "42.8M", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80", "Global Bhojpuri superstar celebrated for Lollipop Lagelu and iconic festival anthems."),
                ("artist-diljit-dosanjh", "Diljit Dosanjh", "Global Punjabi Icon", "Punjabi", "39.5M", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80", "Coachella headliner, blockbuster actor, and global face of modern Punjabi beats."),
                ("artist-renuka-panwar", "Renuka Panwar", "Haryanvi Folk Sensation", "Haryanvi", "28.1M", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80", "Breakout folk vocalist with over 1 billion views for 52 Gaj Ka Daman."),
                ("artist-ap-dhillon", "AP Dhillon", "Brown Munde Pioneer", "Punjabi", "31.7M", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80", "Chart-topping creator of urban Punjabi trap and chill night-drive anthems."),
                ("artist-anirudh", "Anirudh Ravichander", "Rockstar Music Director", "South Indian", "45.0M", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80", "High-energy music director behind Jawan, Vikram, and Leo soundtracks.")
            ]

            for a in artists_data:
                cursor.execute("""
                INSERT OR IGNORE INTO artists (id, name, role, language, monthly_listeners, avatar, bio)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, a)

        # 5. Seed Playlists
        cursor.execute("SELECT COUNT(*) FROM playlists")
        if cursor.fetchone()[0] == 0:
            print("Seeding Initial Curated Playlists...")
            cursor.execute("""
            INSERT INTO playlists (id, user_id, title, description, is_public, cover_image)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                "pl-himanshu-favorites",
                "usr-himanshu-admin",
                "Himanshu's VIP Master Collection",
                "Curated cinematic themes and top regional hits for HIMSTREAMX subscribers.",
                1,
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
            ))

            # Add songs to this playlist
            playlist_songs = ["song-kesariya-lofi", "song-lollipop-lagelu-remix", "song-excuses-urban", "song-52-gaj-ka-daman"]
            for idx, sid in enumerate(playlist_songs):
                cursor.execute("""
                INSERT INTO playlist_songs (id, playlist_id, song_id, order_index)
                VALUES (?, ?, ?, ?)
                """, (f"ps-{idx}-{sid}", "pl-himanshu-favorites", sid, idx))

        # 6. Seed Sample Reviews
        cursor.execute("SELECT COUNT(*) FROM reviews")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO reviews (id, user_id, item_type, item_id, review_text, rating, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "rev-1",
                "usr-himanshu-admin",
                "movie",
                "stranger-things",
                "Sensational 4K Dolby Atmos streaming on HIMSTREAMX. The audio mixing and mystery are world-class!",
                5.0,
                1
            ))
            cursor.execute("""
            INSERT INTO reviews (id, user_id, item_type, item_id, review_text, rating, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "rev-2",
                "usr-demo-user",
                "song",
                "song-kesariya-lofi",
                "The midnight lo-fi chill version of Kesariya is so peaceful. Perfect background music while coding.",
                5.0,
                1
            ))

        conn.commit()
        print("Database seeded successfully with all tables and data!")

if __name__ == "__main__":
    seed_database()
