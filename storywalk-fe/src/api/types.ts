// take-the-moo-be/docs/api.md 기준. API 코드값은 UI의 소문자 언어값과 구분한다.
export type Nationality = "VN" | "CN" | "JP" | "MN" | "UZ" | "US" | "OTHER";
export type Language = "KO" | "EN" | "VI" | "ZH" | "JA" | "MN" | "UZ";
export type Weather = "CLEAR" | "RAINY" | "SNOWY";
export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";

export type User = { userId: string; name: string; nationality: Nationality; language: Language };
export type AuthResponse = { accessToken: string; expiresAt: string; user: User };
export type LoginRequest = { loginId: string; password: string };
// loginId: [a-z0-9_]{4,20}, password: 8~64자, name: 1~20자.
export type SignupRequest = LoginRequest & { name: string; nationality: Nationality; language: Language };
export type ProfileUpdateRequest = Partial<Pick<User, "name" | "nationality" | "language">>;
export type LoginIdCheckResponse = { loginId: string; available: boolean };

export type PlaceSummary = { placeId: number; name: string };
// 좌표는 둘 다 보내거나 둘 다 생략한다. stationId와 같이 보내면 좌표가 우선한다.
export type LocationQuery = { stationId?: number } & (
  | { lat: number; lng: number }
  | { lat?: never; lng?: never }
);
export type NowQuery = LocationQuery & { userId?: string; weather?: Weather; time?: string };
export type NearbyPlacesQuery = LocationQuery & { limit?: number };
export type NowResponse = {
  place: PlaceSummary & { imageUrl: string | null; distanceMeters: number; walkMinutes: number; indoor: boolean };
  reason: string;
  reasonKo: string;
  context: {
    time: string;
    timeSlot: TimeSlot | null;
    weather: Weather;
    temperature: number | null;
    weatherSource: "KMA" | "SIMULATED" | "DEFAULT";
    baseStation: string | null;
  };
  alternatives: (PlaceSummary & { distanceMeters: number })[];
  weeklyPopular: (PlaceSummary & { visitorCount: number })[];
};
export type Station = { stationId: number; name: string; line: string; isDefault: boolean };
export type NearbyPlace = PlaceSummary & { imageUrl: string | null; distanceMeters: number };
export type ExplanationRequest = { placeId: number; language: Language };
export type Explanation = PlaceSummary & { language: Language; text: string; original: string; cached: boolean };
export type SceneRequest = { placeId: number; nationality: Nationality; language: Language };
export type Scene = SceneRequest & {
  placeName: string;
  storyNative: string;
  storyEasyKorean: string;
  connectionLine: string;
  cached: boolean;
};

export type PhotoUploadRequest = { file: File; userId: string; placeId?: number };
export type Photo = { photoId: string; url: string; placeId: number | null };
export type ReviewQuery = { language?: Language; userId?: string; limit?: number };
export type ReviewCreateRequest = {
  userId: string;
  content: string;
  // 실제로 쓴 언어. 모르면 생략해 서버에서 판정한다. 설정 언어를 자동으로 넣지 않는다.
  language?: Language;
  photoId?: string;
};
export type Review = {
  reviewId: number;
  content: string;
  language: Language;
  nationality: Nationality;
  writtenDate: string;
  photoUrl: string | null;
};
export type CreatedReview = Review & { placeId: number };
export type ReviewList = {
  placeId: number;
  viewerLanguage: Language;
  reviews: (Review & { translatedContent: string | null; sample: boolean })[];
};

export type VisitRequest = {
  userId: string;
  placeId: number;
  lat: number;
  lng: number;
  simulatedWeather?: Weather;
  simulatedTime?: string;
};
export type CourseProgress = {
  courseId: string;
  name: string;
  visitedCount: number;
  totalCount: number;
  completed: boolean;
  stops: (PlaceSummary & { visited: boolean })[];
};
export type Visit = {
  visitId: number;
  placeId: number;
  placeName: string;
  visitedDate: string;
  alreadyStamped: boolean;
  firstVisit: boolean;
  recommendedCourse: (CourseProgress & { next: (PlaceSummary & { walkingMinutes: number }) | null }) | null;
};
export type VisitHistory = {
  stampCount: number;
  completedCourseCount: number;
  stamps: (PlaceSummary & { firstVisitedDate: string })[];
  undiscovered: PlaceSummary[];
  courses: CourseProgress[];
  days: { date: string; places: PlaceSummary[] }[];
};
export type MapPin = PlaceSummary & {
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  visitorCount: number;
  reviewCount: number;
  nationalities: { nationality: Nationality; count: number }[];
};

export type PostcardCreateRequest = { userId: string; photoId: string; comment: string; template?: "BASIC" };
export type Postcard = {
  postcardId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  template: "BASIC";
  imageUrl: string | null;
  downloadUrl: string | null;
  errorCode: string | null;
};

export type TokenUsage = { inputTokens: number; outputTokens: number };
export type ChatRequest = { message: string; promptKey?: string; params?: Record<string, string> };
export type ChatStreamQuery = Pick<ChatRequest, "message" | "promptKey">;
export type ChatResponse = { answer: string; model: string; usage: TokenUsage; latencyMs: number };
export type ChatStreamEvent =
  | { event: "token"; data: { text: string } }
  | { event: "done"; data: Omit<ChatResponse, "answer"> }
  | { event: "error"; data: { code: string; message: string } };
export type AnalyzeRequest = { input: string; promptKey?: string; params?: Record<string, string> };
export type Analysis = { summary: string; keyPoints: string[]; actionItems: string[] };
export type ImageQuestionRequest = { file: File; question: string; promptKey?: string };
export type Health = { status: string; mock: boolean };
