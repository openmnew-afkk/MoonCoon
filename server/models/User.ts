import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    telegramId: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    verified: boolean;
    isAdmin: boolean;
    isBanned: boolean;
    stats: {
        posts: number;
        followers: number;
        following: number;
        likesReceived: number;
        viewsCount: number;
        starsReceived: number;
    };
    settings: {
        privateAccount: boolean;
        allowDMs: boolean;
        showOnlineStatus: boolean;
        activityStatus: boolean;
        postsFromFollowers: boolean;
        likesAndComments: boolean;
        directMessages: boolean;
        followSuggestions: boolean;
        reduceMotion: boolean;
        accessibilityMode: boolean;
        theme: string;
        email: string;
        bio: string;
    };
    premium?: {
        isPremium: boolean;
        expiresAt?: Date;
        isTrial: boolean;
        type: 'standard' | 'blogger';
        videoDuration: number;
    };
    starsBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String },
    avatarUrl: { type: String },
    verified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    stats: {
        posts: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        likesReceived: { type: Number, default: 0 },
        viewsCount: { type: Number, default: 0 },
        starsReceived: { type: Number, default: 0 },
    },
    settings: {
        privateAccount: { type: Boolean, default: false },
        allowDMs: { type: Boolean, default: true },
        showOnlineStatus: { type: Boolean, default: true },
        activityStatus: { type: Boolean, default: true },
        postsFromFollowers: { type: Boolean, default: true },
        likesAndComments: { type: Boolean, default: true },
        directMessages: { type: Boolean, default: true },
        followSuggestions: { type: Boolean, default: false },
        reduceMotion: { type: Boolean, default: false },
        accessibilityMode: { type: Boolean, default: false },
        theme: { type: String, default: 'dark' },
        email: { type: String, default: '' },
        bio: { type: String, default: '' },
    },
    starsBalance: { type: Number, default: 0 },
    premium: {
        isPremium: { type: Boolean, default: false },
        expiresAt: { type: Date },
        isTrial: { type: Boolean, default: false },
        type: { type: String, enum: ['standard', 'blogger'], default: 'standard' },
        videoDuration: { type: Number, default: 300 }, // 5 minutes default
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
