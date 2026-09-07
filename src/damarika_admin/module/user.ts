export interface User {
    id?: number;  // Auto-incremented
    image?: string | null;  // Optional profile image URL
    name: string;  // User name (required)
    email: string;  // Unique email (required)
    password: string;  // Encrypted password (required)
    role_id?: number;  // Maps to `roles` table
    status?: number;  // 1 = Active, 0 = Inactive (default 1)
    user_verify?: number;  // 0 = Not Verified, 1 = Verified (default 0)
    last_token?: string | null;  // JWT token or similar (nullable)
    created_by?: string | null;  // Nullable creator info
    updated_by?: string;  // Not nullable, updated info
    created_user_id?: number | null;  // User ID who created the record
    created_at?: Date;  // Auto-filled by DB
    updated_at?: Date;  // Auto-updated by DB
}

export interface Role {
    id?: number;  // Optional because it's auto-incremented
    role_name: string;  // e.g., 'admin', 'user', 'moderator'
    view_access?: boolean;  // Defaults to `false`
    edit_access?: boolean;  // Defaults to `false`
    delete_access?: boolean;  // Defaults to `false`
    create_access?: boolean;  // Defaults to `false`
    created_by?: string | null;  // Nullable
    updated_by?: string;  // Not nullable in DB
    created_user_id?: number | null;  // ID of the user who created this role (nullable)
    status?: boolean;  // Defaults to `true`
    created_at?: Date;  // Auto-filled by DB
    updated_at?: Date;  // Auto-filled by DB
}
