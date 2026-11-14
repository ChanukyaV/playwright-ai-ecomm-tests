import { Product } from "./types";

/**
 * ShopLab catalog: 100 products across 7 categories.
 *
 * - p1–p8 are the original products and keep their ids/order so older tests
 *   that reference them (p1, p2 ...) keep working.
 * - p9–p100 are generated from the compact rows below; ids are assigned in order.
 * - There is deliberately NO clothing / fashion / furniture category, which gives
 *   AI-agent tests a reliable "not in the catalog" negative case.
 */

const CATEGORY_COLORS: Record<string, string> = {
  Audio: "#dbeafe",
  Computing: "#dcfce7",
  Accessories: "#fed7aa",
  Gaming: "#ede9fe",
  "Smart Home": "#fef9c3",
  Wearables: "#fce7f3",
  Cameras: "#e0f2fe",
};

type Row = [
  name: string,
  description: string,
  price: number,
  category: string,
  emoji: string,
  stock: number,
  rating: number,
];

const ORIGINAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for work and travel.",
    price: 79.99,
    category: "Audio",
    emoji: "🎧",
    color: "#dbeafe",
    stock: 25,
    rating: 4.5,
  },
  {
    id: "p2",
    name: "Mechanical Keyboard",
    description:
      "Full-size mechanical keyboard with tactile blue switches, RGB backlighting per key, and a durable aluminium frame built for professionals and gamers.",
    price: 129.99,
    category: "Computing",
    emoji: "⌨️",
    color: "#dcfce7",
    stock: 18,
    rating: 4.7,
  },
  {
    id: "p3",
    name: "Ergonomic Wireless Mouse",
    description:
      "Sculpted ergonomic design with precision optical sensor, silent click buttons, 70-day battery life, and multi-device connectivity via USB or Bluetooth.",
    price: 49.99,
    category: "Computing",
    emoji: "🖱️",
    color: "#fef9c3",
    stock: 40,
    rating: 4.4,
  },
  {
    id: "p4",
    name: "4K USB-C Webcam",
    description:
      "Ultra-HD 4K webcam with autofocus, dual built-in noise-cancelling microphones, and HDR for video calls that look like you are in the room.",
    price: 89.99,
    category: "Computing",
    emoji: "📷",
    color: "#fce7f3",
    stock: 15,
    rating: 4.3,
  },
  {
    id: "p5",
    name: "LED Desk Lamp",
    description:
      "Smart LED lamp with adjustable colour temperature, 5 brightness levels, wireless charging base, and a USB-A port for phone charging.",
    price: 39.99,
    category: "Accessories",
    emoji: "💡",
    color: "#fed7aa",
    stock: 50,
    rating: 4.6,
  },
  {
    id: "p6",
    name: "Gaming Controller",
    description:
      "Wireless gamepad compatible with PC and mobile, featuring hall-effect thumbsticks, programmable back paddles, vibration haptics, and a 20-hour battery.",
    price: 59.99,
    category: "Gaming",
    emoji: "🎮",
    color: "#ede9fe",
    stock: 30,
    rating: 4.8,
  },
  {
    id: "p7",
    name: "Portable Power Bank 20000mAh",
    description:
      "High-capacity power bank with 65W USB-C PD fast charging, dual USB-A outputs, and a built-in LED display showing remaining charge percentage.",
    price: 34.99,
    category: "Accessories",
    emoji: "🔋",
    color: "#d1fae5",
    stock: 60,
    rating: 4.5,
  },
  {
    id: "p8",
    name: "USB-C Hub 7-in-1",
    description:
      "Compact hub that expands a single USB-C port into HDMI 4K, 3× USB-A 3.0, SD/microSD card readers, and 100W USB-C power pass-through.",
    price: 44.99,
    category: "Computing",
    emoji: "🔌",
    color: "#e0f2fe",
    stock: 35,
    rating: 4.2,
  },
];

const MORE_PRODUCTS: Row[] = [
  // ── Audio (13 more) ──────────────────────────────────────────────────────
  ["Studio Monitor Speakers (Pair)", "Powered 5-inch near-field monitors with flat frequency response, balanced inputs, and room-correction switches for mixing at home.", 189.99, "Audio", "🔊", 12, 4.6],
  ["True Wireless Earbuds", "Compact earbuds with 8-hour playback, a pocket charging case, touch controls, and IPX4 sweat resistance.", 59.99, "Audio", "🎵", 55, 4.3],
  ["Portable Bluetooth Speaker", "Waterproof 20W speaker with 360-degree sound, 14-hour battery, and a built-in carabiner for hiking trips.", 49.99, "Audio", "📻", 44, 4.5],
  ["Soundbar 2.1 with Subwoofer", "Slim 120W soundbar with a wireless subwoofer, HDMI ARC, and dialogue-boost mode for movie nights.", 149.99, "Audio", "📺", 16, 4.4],
  ["Gaming Headset 7.1 Surround", "Over-ear headset with virtual surround, detachable boom microphone, and memory-foam cushions for long sessions.", 69.99, "Audio", "🎙️", 28, 4.2],
  ["USB Condenser Microphone", "Plug-and-play cardioid microphone with a tabletop stand, pop filter, and a mute button for streaming and podcasts.", 74.99, "Audio", "🎤", 21, 4.6],
  ["Sports Earphones with Ear Hooks", "Sweat-proof earphones with secure ear hooks, 10-hour battery, and a transparency mode for running outdoors.", 39.99, "Audio", "🏃", 38, 4.1],
  ["Bluetooth Turntable", "Belt-drive record player with a built-in preamp, Bluetooth output, and two speeds for 33 and 45 RPM vinyl.", 129.99, "Audio", "💿", 9, 4.4],
  ["Desktop DAC and Amplifier", "High-resolution digital-to-analog converter with a balanced output stage, ideal for pairing with studio-grade audio gear.", 119.99, "Audio", "🎚️", 14, 4.7],
  ["Neckband Earphones with ANC", "Lightweight neckband with active noise cancellation, 25-hour battery, and vibration alerts for incoming calls.", 44.99, "Audio", "📿", 33, 4.0],
  ["Clip-On Lavalier Microphone", "Omnidirectional wired lavalier with a 6-metre cable, perfect for interviews, lectures, and video tutorials.", 24.99, "Audio", "🎙️", 70, 4.3],
  ["Smart Speaker with Voice Assistant", "Voice-controlled speaker with far-field microphones, multi-room audio, and a privacy switch that cuts the mic.", 79.99, "Audio", "🗣️", 26, 4.5],
  ["Wired In-Ear Monitors", "Dual-driver in-ear monitors with a detachable braided cable and three sizes of silicone tips for stage or studio use.", 99.99, "Audio", "🎶", 11, 4.8],

  // ── Computing (14 more) ──────────────────────────────────────────────────
  ["Aluminium Laptop Stand", "Foldable stand that raises your screen to eye level, with six height settings and a non-slip silicone grip.", 29.99, "Computing", "💻", 65, 4.5],
  ["27-inch 4K IPS Monitor", "Colour-accurate 4K display with 99% sRGB, USB-C power delivery, and a height-adjustable stand.", 349.99, "Computing", "🖥️", 8, 4.7],
  ["24-inch Full HD Monitor", "Frameless 75Hz IPS panel with eye-care mode and both HDMI and DisplayPort inputs for everyday office work.", 129.99, "Computing", "🖥️", 30, 4.2],
  ["Portable SSD 1TB", "Pocket-sized solid-state drive with 1050MB/s read speeds, shock resistance, and hardware encryption.", 99.99, "Computing", "💾", 42, 4.6],
  ["NVMe Internal SSD 512GB", "PCIe Gen4 drive with 5000MB/s sequential reads for faster boots, game loads, and file transfers.", 54.99, "Computing", "💽", 58, 4.5],
  ["Numeric Keypad Wireless", "Slim rechargeable number pad with Bluetooth pairing, ideal for spreadsheets and accounting work.", 24.99, "Computing", "🔢", 47, 4.0],
  ["Ergonomic Trackball", "Thumb-operated trackball with adjustable tracking speed that keeps your wrist still all day.", 54.99, "Computing", "🔘", 22, 4.3],
  ["Graphics Drawing Tablet", "10-inch pen tablet with 8192 pressure levels, battery-free stylus, and customizable express keys.", 79.99, "Computing", "🎨", 19, 4.4],
  ["Wi-Fi 6 Router AX3000", "Dual-band router with gigabit ports, beamforming antennas, and parental controls for the whole home.", 109.99, "Computing", "📡", 24, 4.3],
  ["8-Port Gigabit Ethernet Switch", "Fanless plug-and-play network switch with a metal case and auto-negotiating ports for small offices.", 27.99, "Computing", "🔗", 52, 4.4],
  ["32GB DDR5 Memory Kit", "Two 16GB modules rated at 6000MHz with low-profile heat spreaders and XMP 3.0 profiles.", 114.99, "Computing", "🧠", 17, 4.6],
  ["Dual Monitor Arm", "Gas-spring desk mount that holds two screens up to 32 inches, with cable channels and full tilt and swivel.", 89.99, "Computing", "🦾", 20, 4.5],
  ["Thunderbolt Docking Station", "12-in-1 dock with dual 4K display output, 2.5G Ethernet, SD reader, and 96W laptop charging.", 219.99, "Computing", "🧰", 10, 4.4],
  ["External Hard Drive 4TB", "Spacious desktop backup drive with automatic backup software and a three-year warranty.", 94.99, "Computing", "🗄️", 36, 4.3],

  // ── Accessories (12 more) ────────────────────────────────────────────────
  ["Laptop Sleeve 15-inch", "Water-resistant neoprene sleeve with a soft lining, a zip pocket for chargers, and a scratch-free finish.", 19.99, "Accessories", "👜", 80, 4.2],
  ["Braided Charging Cable 3-Pack", "Nylon-braided USB-C cables in 1m, 2m, and 3m lengths, tested for 20,000 bends.", 17.99, "Accessories", "🧵", 120, 4.4],
  ["65W GaN Wall Charger", "Tiny dual-port charger that powers a laptop and a phone at once, with foldable plug prongs.", 39.99, "Accessories", "🔌", 75, 4.7],
  ["Wireless Charging Pad", "15W Qi charging pad with an LED status ring, foreign-object detection, and case-friendly charging.", 22.99, "Accessories", "📲", 66, 4.1],
  ["Adjustable Phone Stand", "Sturdy aluminium stand that folds flat, with a weighted base and angles for video calls or recipes.", 14.99, "Accessories", "📱", 90, 4.3],
  ["Cable Organizer Kit", "Set of reusable cable ties, clips, and a sleeve to keep your desk and entertainment centre tidy.", 12.99, "Accessories", "🪢", 110, 4.0],
  ["Screen Cleaning Kit", "Alcohol-free spray, microfibre cloths, and a soft brush safe for monitors, phones, and camera lenses.", 9.99, "Accessories", "🧼", 140, 4.2],
  ["Extra-Large Desk Mat", "Stitched-edge desk pad with a smooth cloth top and a rubber base that protects your desk surface.", 24.99, "Accessories", "🟦", 85, 4.5],
  ["Anti-Theft Laptop Backpack", "Slim commuter backpack with a hidden zipper, a built-in charging port, and a 17-inch laptop compartment.", 54.99, "Accessories", "🎒", 34, 4.6],
  ["Magnetic Car Phone Mount", "Vent-clip mount with strong magnets and a one-hand release for safe navigation while driving.", 16.99, "Accessories", "🚗", 72, 4.2],
  ["Universal Travel Adapter", "Worldwide plug adapter with four USB ports, a built-in fuse, and coverage for more than 150 countries.", 27.99, "Accessories", "🌍", 48, 4.4],
  ["Bluetooth Item Tracker 2-Pack", "Coin-sized trackers with a loud alarm and a replaceable battery that last a full year.", 29.99, "Accessories", "📍", 63, 4.3],

  // ── Gaming (13 more) ─────────────────────────────────────────────────────
  ["Racing Wheel and Pedals", "Force-feedback wheel with a 900-degree rotation, metal pedals, and a desk mount for PC and console racing.", 199.99, "Gaming", "🏎️", 7, 4.5],
  ["Flight Joystick HOTAS", "Throttle-and-stick combo with twist rudder, 14 programmable buttons, and a weighted base for flight sims.", 149.99, "Gaming", "🕹️", 9, 4.4],
  ["4K Game Capture Card", "Passthrough capture card for streaming and recording console gameplay at 4K with near-zero latency.", 139.99, "Gaming", "📹", 13, 4.3],
  ["Ergonomic Gaming Chair", "Reclining chair with lumbar support, a 4D armrest, and breathable mesh built for long matches.", 229.99, "Gaming", "💺", 6, 4.5],
  ["XL Gaming Surface Pad", "Oversized micro-textured pad with RGB edge lighting and an anti-slip base for precise tracking.", 29.99, "Gaming", "🌈", 77, 4.4],
  ["Controller Charging Dock", "Dual-bay charging station with LED indicators and a 3-hour full-charge time for wireless gamepads.", 24.99, "Gaming", "🔋", 54, 4.1],
  ["165Hz Gaming Monitor 27-inch", "Fast 1ms panel with adaptive sync, HDR support, and an ultra-thin bezel for competitive play.", 279.99, "Gaming", "🖥️", 11, 4.7],
  ["Handheld Gaming Console", "7-inch OLED handheld with a 12-hour battery, 512GB storage, and hall-effect analog sticks.", 399.99, "Gaming", "👾", 5, 4.6],
  ["VR Headset Standalone", "All-in-one virtual reality headset with inside-out tracking, two motion controllers, and a wide library of games.", 349.99, "Gaming", "🥽", 8, 4.5],
  ["Arcade Fight Stick", "Tournament-grade stick with Sanwa-style parts, a metal faceplate, and a hidden storage compartment.", 119.99, "Gaming", "🕹️", 10, 4.6],
  ["Thumbstick Grip Pack (8 pcs)", "Soft silicone grips in two heights and shapes that add comfort and precision to any gamepad.", 9.99, "Gaming", "⭕", 150, 4.0],
  ["Console Cooling Stand", "Vertical stand with dual quiet fans, a controller holder, and a USB hub for tidy console setups.", 34.99, "Gaming", "🌬️", 40, 4.2],
  ["Console SSD 2TB", "Expansion drive built for next-gen consoles with a pre-installed heatsink for sustained loading speeds.", 179.99, "Gaming", "💾", 15, 4.7],

  // ── Smart Home (14) ──────────────────────────────────────────────────────
  ["Smart Plug 4-Pack", "Wi-Fi plugs with scheduling, energy monitoring, and voice control with no hub required.", 29.99, "Smart Home", "🔌", 95, 4.4],
  ["Smart LED Bulb Starter Kit", "Four colour-changing bulbs with a bridge, 16 million colours, and scene presets for any mood.", 49.99, "Smart Home", "💡", 60, 4.5],
  ["Wi-Fi Video Doorbell", "1080p doorbell with two-way audio, motion zones, night vision, and instant phone alerts.", 99.99, "Smart Home", "🚪", 23, 4.3],
  ["Indoor Security Camera", "Pan-and-tilt camera with 2K video, person detection, and local storage on a microSD card.", 39.99, "Smart Home", "📹", 46, 4.2],
  ["Smart Thermostat", "Learning thermostat that builds a heating schedule, tracks energy use, and works with most HVAC systems.", 129.99, "Smart Home", "🌡️", 18, 4.6],
  ["Robot Vacuum Cleaner", "Self-charging robot with laser mapping, 3000Pa suction, and app-controlled no-go zones.", 249.99, "Smart Home", "🤖", 12, 4.5],
  ["Smart Door Lock", "Keyless deadbolt with fingerprint, keypad, and app unlocking plus auto-lock and guest codes.", 159.99, "Smart Home", "🔐", 14, 4.4],
  ["Motion Sensor 3-Pack", "Battery-powered Zigbee sensors that trigger lights, alarms, or routines when movement is detected.", 34.99, "Smart Home", "👁️", 58, 4.1],
  ["Smart LED Light Strip 5m", "Cuttable strip with music sync, adhesive backing, and 16 million colours for rooms and shelves.", 24.99, "Smart Home", "🌈", 82, 4.3],
  ["Smart Air Purifier", "HEPA purifier with an air quality display, a sleep mode, and an app that tracks filter life.", 139.99, "Smart Home", "🌬️", 17, 4.5],
  ["Smart Display Hub 8-inch", "Touchscreen hub that controls your devices, shows camera feeds, and makes video calls.", 119.99, "Smart Home", "📟", 20, 4.2],
  ["Smoke and CO Alarm", "Interconnected detector with a voice alert, a 10-year sensor life, and instant phone notifications.", 44.99, "Smart Home", "🚨", 39, 4.7],
  ["Water Leak Sensor 4-Pack", "Compact sensors that warn you the moment moisture is detected under sinks or near appliances.", 32.99, "Smart Home", "💧", 53, 4.3],
  ["Smart Blinds Motor", "Retrofit motor that opens and closes existing blinds on a schedule or by voice command.", 69.99, "Smart Home", "🪟", 25, 4.0],

  // ── Wearables (13) ───────────────────────────────────────────────────────
  ["Fitness Tracker Band", "Slim band with heart-rate and sleep tracking, 14-day battery, and 5ATM water resistance.", 39.99, "Wearables", "⌚", 88, 4.3],
  ["AMOLED Smartwatch 1.4-inch", "Bright always-on display with GPS, call answering, and over 100 workout modes.", 149.99, "Wearables", "⌚", 27, 4.5],
  ["Kids GPS Smartwatch", "Child-friendly watch with a safe-zone alert, two-way calling to approved contacts, and a durable strap.", 79.99, "Wearables", "🧒", 31, 4.2],
  ["GPS Running Watch", "Multi-band GPS watch with training load insights, recovery advice, and 20-day battery.", 199.99, "Wearables", "🏃", 15, 4.7],
  ["Smart Ring", "Titanium ring that tracks sleep, readiness, and temperature trends in a discreet design.", 249.99, "Wearables", "💍", 9, 4.4],
  ["Smart Body Scale", "Wi-Fi scale that measures weight, body fat, and muscle mass and syncs with popular health apps.", 34.99, "Wearables", "⚖️", 57, 4.1],
  ["Heart Rate Chest Strap", "Accurate ECG-grade strap with dual Bluetooth and ANT+ for cycling and gym workouts.", 59.99, "Wearables", "❤️", 29, 4.6],
  ["Silicone Watch Bands (6-Pack)", "Soft, sweat-proof replacement bands in six colours with quick-release pins.", 14.99, "Wearables", "🎽", 130, 4.0],
  ["Wireless Watch Charger Dock", "Magnetic bedside dock with a night-clock mode that charges a smartwatch in under two hours.", 19.99, "Wearables", "🔋", 92, 4.2],
  ["Bluetooth Audio Glasses", "Polarized sunglasses with open-ear speakers for music and calls while you stay aware of your surroundings.", 129.99, "Wearables", "🕶️", 13, 4.1],
  ["Cycling GPS Computer", "Compact bike computer with turn-by-turn navigation, a 20-hour battery, and sensor support.", 179.99, "Wearables", "🚴", 12, 4.5],
  ["Posture Corrector Sensor", "Small sensor that buzzes when you slouch and tracks your sitting habits in the companion app.", 49.99, "Wearables", "🧍", 41, 4.0],
  ["Sleep Tracking Headband", "Soft headband with built-in sensors that monitors sleep stages and plays calming sounds.", 89.99, "Wearables", "😴", 18, 4.3],

  // ── Cameras (13) ─────────────────────────────────────────────────────────
  ["Mirrorless Camera Body", "24MP mirrorless camera with in-body stabilization, 4K video, and fast eye-tracking autofocus.", 899.99, "Cameras", "📸", 5, 4.8],
  ["4K Action Camera", "Waterproof camera with electronic stabilization, a front display, and a mounting kit for adventures.", 249.99, "Cameras", "🎥", 21, 4.5],
  ["Instant Film Camera", "Retro-style instant camera with a selfie mirror, a close-up lens, and a built-in flash.", 79.99, "Cameras", "📷", 34, 4.2],
  ["Compact Travel Tripod", "Carbon-fibre tripod that folds to 40 cm, supports 8 kg, and includes a ball head and phone holder.", 89.99, "Cameras", "🧱", 24, 4.6],
  ["Camera Backpack 25L", "Padded backpack with customizable dividers, a rain cover, and quick side access to your gear.", 79.99, "Cameras", "🎒", 19, 4.5],
  ["50mm f/1.8 Prime Lens", "Lightweight prime lens with a fast aperture for portraits and low-light shooting.", 149.99, "Cameras", "🔭", 16, 4.7],
  ["3-Axis Gimbal Stabilizer", "Handheld stabilizer with subject tracking, a built-in extension rod, and 12-hour battery life.", 129.99, "Cameras", "🎬", 14, 4.4],
  ["18-inch Ring Light Kit", "Dimmable LED ring light with a tripod, a phone holder, and three colour temperatures for video content.", 44.99, "Cameras", "⭕", 49, 4.3],
  ["Memory Card 256GB", "High-speed SD card rated V30 for 4K video, with a lifetime warranty and a protective case.", 34.99, "Cameras", "💳", 100, 4.5],
  ["Dual Dash Cam", "Front and rear 2K dash camera with night vision, parking mode, and a 24-hour monitoring option.", 119.99, "Cameras", "🚘", 22, 4.4],
  ["Camera Cleaning Kit", "Complete set with a blower, lens pen, and microfibre cloths to keep sensors and lenses spotless.", 15.99, "Cameras", "🧽", 76, 4.1],
  ["Telephoto Zoom Lens 70-300mm", "Versatile zoom lens with optical stabilization for wildlife, sports, and distant subjects.", 329.99, "Cameras", "🔭", 8, 4.4],
  ["Studio Softbox Lighting Kit", "Two softboxes with daylight bulbs and stands for even lighting in product and portrait photography.", 99.99, "Cameras", "💡", 17, 4.2],
];

const GENERATED_PRODUCTS: Product[] = MORE_PRODUCTS.map(
  ([name, description, price, category, emoji, stock, rating], i) => ({
    id: `p${ORIGINAL_PRODUCTS.length + i + 1}`,
    name,
    description,
    price,
    category,
    emoji,
    color: CATEGORY_COLORS[category] ?? "#e5e7eb",
    stock,
    rating,
  })
);

export const PRODUCTS: Product[] = [...ORIGINAL_PRODUCTS, ...GENERATED_PRODUCTS];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
