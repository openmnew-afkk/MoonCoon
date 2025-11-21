import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    userId: string;
    author: {
        name: string;
        avatar: string;
        username: string;
        verified: boolean;
    };
    caption: string;
    media: string;
    mediaType: 'image' | 'video';
    type: 'post' | 'story' | 'scroll';
    visibility: 'public' | 'followers';
    likes: number;
    comments: number;
    stars: number;
    likedBy: string[]; // Array of user IDs who liked
    starredBy: string[]; // Array of user IDs who starred
    pinnedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema({
    userId: { type: String, required: true },
    author: {
        name: { type: String, required: true },
        avatar: { type: String },
        username: { type: String },
        verified: { type: Boolean, default: false },
    },
    caption: { type: String, default: '' },
    media: { type: String, required: true }, // Base64 or URL
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    type: { type: String, enum: ['post', 'story', 'scroll'], default: 'post' },
    visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    starredBy: [{ type: String }],
    pinnedUntil: { type: Date },
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
