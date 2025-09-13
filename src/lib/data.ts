import { ClipboardPenLine, Send, Gavel, CircleDollarSign } from "lucide-react";

export const applicationStages = [
  { name: 'eligibilityDataCollection', icon: ClipboardPenLine },
  { name: 'applicationSubmittedStage', icon: Send },
  { name: 'verificationApproval', icon: Gavel },
  { name: 'beneficiaryPayment', icon: CircleDollarSign },
];

export type ChecklistItemStatus = 'completed' | 'current' | 'upcoming';

export type ChecklistItem = {
  text: string;
  status: ChecklistItemStatus;
};

export const initialChecklist: ChecklistItem[] = [
    { text: 'provideAadhaar', status: 'upcoming' },
    { text: 'uploadLandRecords', status: 'upcoming' },
    { text: 'appAutofilled', status: 'upcoming' },
    { text: 'undergoingVerification', status: 'upcoming' },
    { text: 'awaitingInclusion', status: 'upcoming' },
    { text: 'firstInstallment', status: 'upcoming' },
];

export const cscLocations = [
    { name: 'CSC Center Rampur', address: '123, Main Market, Rampur, Sitapur', hours: '9 AM - 6 PM' },
    { name: 'Digital Seva Kendra', address: 'Near Bus Stand, Rampur, Sitapur', hours: '10 AM - 7 PM' },
];

export const requiredDocuments = [
    'Aadhaar card',
    'Proof of citizenship',
    'Documents showing ownership of land (khatoni/khasra)',
    'Bank account details (Bank Passbook)',
    'Registered mobile number for OTP',
];
export type Artwork = {
  id: number;
  type: 'image' | 'video' | 'text';
  title: string;
  artist: string;
  imageUrl?: string;
  videoUrl?: string;
  content?: string;
  likes: number;
  commentsCount: number;
  tags: string[];
  isUserSubmission: boolean;
  aiHint?: string;
};

export const artworks: Artwork[] = [
  {
    id: 1,
    type: 'image',
    title: "दिव्य यात्रा",
    artist: "अरोरा ब्लिस",
    imageUrl: "https://picsum.photos/600/800?random=1",
    likes: 125,
    commentsCount: 12,
    tags: ["अंतरिक्ष", "अमूर्त", "डिजिटल"],
    isUserSubmission: true,
    aiHint: "galaxy stars"
  },
  {
    id: 2,
    type: 'image',
    title: "वन आत्मा",
    artist: "लियो एवरग्रीन",
    imageUrl: "https://picsum.photos/800/600?random=2",
    likes: 340,
    commentsCount: 45,
    tags: ["प्रकृति", "काल्पनिक", "पेंटिंग"],
    isUserSubmission: false,
    aiHint: "mystical forest"
  },
  {
    id: 9,
    type: 'video',
    title: "प्रकाश को गढ़ना",
    artist: "जूलियन फॉर्म",
    imageUrl: "https://picsum.photos/800/450?random=9",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    likes: 280,
    commentsCount: 35,
    tags: ["मूर्ति", "टाइमलैप्स", "प्रक्रिया"],
    isUserSubmission: true,
    aiHint: "sculpture timelapse",
  },
  {
    id: 3,
    type: 'image',
    title: "महानगर के सपने",
    artist: "साइबेरिया नोवा",
    imageUrl: "https://picsum.photos/700/700?random=3",
    likes: 88,
    commentsCount: 8,
    tags: ["cityscape", "futuristic", "3d-render"],
    isUserSubmission: false,
    aiHint: "future city"
  },
  {
    id: 10,
    type: 'text',
    title: "रंग सिद्धांत पर विचार",
    artist: "आइरिस ह्यू",
    content: "रंग केवल एक दृश्य अनुभव से कहीं अधिक है; यह एक भाषा है। लाल रंग की गर्मी जुनून या खतरे को व्यक्त कर सकती है, जबकि नीले रंग की ठंडक शांति या उदासी पैदा कर सकती है। अपने काम में, मैं रंगों के बीच एक संवाद बनाने की कोशिश करता हूं, जिससे वे एक दूसरे के साथ खेलकर एक ऐसा मूड बनाते हैं जो कैनवास से परे हो।",
    likes: 55,
    commentsCount: 15,
    tags: ["सिद्धांत", "प्रतिबिंब", "लेखन"],
    isUserSubmission: false,
  },
  {
    id: 4,
    type: 'image',
    title: "महासागर का आलिंगन",
    artist: "मरीना वेव्स",
    imageUrl: "https://picsum.photos/600/900?random=4",
    likes: 450,
    commentsCount: 67,
    tags: ["महासागर", "यथार्थवाद", "oil-on-canvas"],
    isUserSubmission: true,
    aiHint: "ocean wave"
  },
  {
    id: 11,
    type: 'video',
    title: "मेरी मिट्टी के बर्तनों की प्रक्रिया",
    artist: "क्लेटन पॉटर",
    imageUrl: "https://picsum.photos/800/450?random=11",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: 180,
    commentsCount: 28,
    tags: ["मिट्टी के बर्तन", "ट्यूटोरियल", "शिल्प"],
    isUserSubmission: false,
    aiHint: "pottery wheel",
  },
  {
    id: 5,
    type: 'image',
    title: "हस्तनिर्मित फूलदान",
    artist: "क्लेटन पॉटर",
    imageUrl: "https://picsum.photos/600/600?random=5",
    likes: 210,
    commentsCount: 22,
    tags: ["मिट्टी के बर्तन", "हस्तशिल्प", "कारीगर"],
    isUserSubmission: false,
    aiHint: "pottery vase"
  },
  {
    id: 12,
    type: 'image',
    title: "कंक्रीट बेल",
    artist: "साइबेरिया नोवा",
    imageUrl: "https://picsum.photos/600/800?random=12",
    likes: 150,
    commentsCount: 18,
    tags: ["शहरी जंगल", "चुनौती", "फोटोग्राफी"],
    isUserSubmission: false,
    aiHint: "plant building"
  },
  {
    id: 6,
    type: 'image',
    title: "मौन प्रहरी",
    artist: "नोक्टर्ना",
    imageUrl: "https://picsum.photos/800/800?random=6",
    likes: 199,
    commentsCount: 31,
    tags: ["जानवर", "वन्यजीव", "फोटोग्राफी"],
    isUserSubmission: false,
    aiHint: "owl night"
  },
    {
    id: 13,
    type: 'text',
    title: "शहर सॉनेट",
    artist: "लेक्स वर्ड और साइबेरिया नोवा",
    content: "जहां स्टील की जड़ें सूरज को चूमने के लिए चढ़ती हैं, एक कंक्रीट की छतरी, किसी से कम नहीं। हरी लताएं दरारों और सीमों का नक्शा बनाती हैं, एक जंगली जीवन शहर के सपनों को पूरा करता है। ('शहरी जंगल' चुनौती के लिए एक सहयोग)।",
    likes: 95,
    commentsCount: 25,
    tags: ["शहरी जंगल", "कविता", "सहयोग", "चुनौती"],
    isUserSubmission: true,
  },
  {
    id: 7,
    type: 'image',
    title: "रेगिस्तानी मृगतृष्णा",
    artist: "सैंडी ड्यून्स",
    imageUrl: "https://picsum.photos/900/600?random=7",
    likes: 76,
    commentsCount: 5,
    tags: ["परिदृश्य", "रेगिस्तान", "जल रंग"],
    isUserSubmission: true,
    aiHint: "desert dunes"
  },
  {
    id: 8,
    type: 'image',
    title: "बुने हुए सपने",
    artist: "पेनेलोप वीव",
    imageUrl: "https://picsum.photos/700/800?random=8",
    likes: 154,
    commentsCount: 19,
    tags: ["कपड़ा", "हस्तशिल्प", "टेपेस्ट्री"],
    isUserSubmission: false,
    aiHint: "woven tapestry"
  },
  {
    id: 14,
    type: 'video',
    title: "छत पर बगीचे का टाइमलैप्स",
    artist: "लियो एवरग्रीन",
    imageUrl: "https://picsum.photos/800/450?random=14",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    likes: 220,
    commentsCount: 30,
    tags: ["शहरी जंगल", "टाइमलैप्स", "बागवानी", "चुनौती"],
    isUserSubmission: false,
    aiHint: "rooftop garden",
  },
];
