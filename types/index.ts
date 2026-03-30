// ========================
// Database entity types
// ========================

export type UserRole = "user" | "admin";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface User {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    preferences: Record<string, unknown>;
    created_at: string;
}

export interface Place {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    tags: string[];
    verified: boolean;
    created_by: string | null;
    created_at: string;
    // Joined fields
    images?: PlaceImage[];
}

export interface PlaceImage {
    id: string;
    place_id: string;
    image_url: string;
    is_primary: boolean;
    verified: boolean;
    created_at: string;
}

export interface UserPlace {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    tags: string[];
    created_by: string;
    is_verified: boolean;
    linked_place_id: string | null;
    created_at: string;
}

export interface PlaceSubmission {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    tags: string[];
    submitted_by: string;
    status: SubmissionStatus;
    reviewed_by: string | null;
    created_at: string;
    // Joined
    submitter?: User;
}

export interface ImageSubmission {
    id: string;
    place_id: string;
    image_url: string;
    submitted_by: string;
    status: SubmissionStatus;
    reviewed_by: string | null;
    created_at: string;
    // Joined
    submitter?: User;
    place?: Place;
}

export interface Deck {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    cover_image_url: string | null;
    is_public: boolean;
    created_at: string;
    // Joined / computed
    items?: DeckItem[];
    likes_count?: number;
    saves_count?: number;
    is_liked?: boolean;
    is_saved?: boolean;
    owner?: User;
}

export interface DeckItem {
    id: string;
    deck_id: string;
    place_id: string | null;
    user_place_id: string | null;
    position: number;
    created_at: string;
    // Joined
    place?: Place;
    user_place?: UserPlace;
}

export interface DeckLike {
    id: string;
    deck_id: string;
    user_id: string;
    created_at: string;
}

export interface DeckSave {
    id: string;
    deck_id: string;
    user_id: string;
    created_at: string;
}

// ========================
// API request/response types
// ========================

export interface RecommendRequest {
    prompt: string;
    user_preferences?: Record<string, unknown>;
    limit?: number;
}

export interface RecommendResponse {
    places: (Place & { score: number })[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface AdminDashboardStats {
    total_places: number;
    pending_place_submissions: number;
    pending_image_submissions: number;
    total_users: number;
    total_decks: number;
}
