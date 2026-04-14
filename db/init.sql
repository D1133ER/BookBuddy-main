-- BookBuddy Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    location VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    condition INTEGER CHECK (condition >= 1 AND condition <= 5),
    available BOOLEAN DEFAULT true,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP WITH TIME ZONE,
    return_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some mock data for development
INSERT INTO users (id, username, display_name, avatar_url) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sarah_j', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'michael_c', 'Michael Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'emma_w', 'Emma Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma');

INSERT INTO books (id, title, author, cover_image, condition, available, owner_id) VALUES 
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'The Great Gatsby', 'F. Scott Fitzgerald', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=250&q=80', 4, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'To Kill a Mockingbird', 'Harper Lee', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=250&q=80', 3, true, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '1984', 'George Orwell', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=250&q=80', 5, false, 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');
