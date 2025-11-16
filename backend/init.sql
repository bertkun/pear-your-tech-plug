-- Create phones table
CREATE TABLE IF NOT EXISTS phones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    retail_price DECIMAL(10, 2) NOT NULL,
    wholesale_price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    phone_id INTEGER REFERENCES phones(id),
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Order Placed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default phones
INSERT INTO phones (name, image_url, retail_price, wholesale_price, stock, description) VALUES
    ('Quantum X1', 'https://picsum.photos/seed/qx1/400/400', 999.00, 750.00, 150, 'Experience the next leap in mobile technology with the Quantum X1, where unparalleled speed meets a breathtaking display.'),
    ('Nebula Pro', 'https://picsum.photos/seed/np1/400/400', 1199.00, 900.00, 80, 'Capture the cosmos with the Nebula Pro''s revolutionary camera system and immerse yourself in its edge-to-edge starlight screen.'),
    ('Stellar Lite', 'https://picsum.photos/seed/sl1/400/400', 499.00, 380.00, 250, 'The Stellar Lite packs a universe of features into a sleek, lightweight design, making premium technology accessible to everyone.'),
    ('Galaxy Fold Z5', 'https://picsum.photos/seed/gfz5/400/400', 1799.00, 1500.00, 50, 'Unfold the future with the Galaxy Fold Z5, where a cinematic tablet experience fits right in your pocket.'),
    ('Pixel 8 Pro', 'https://picsum.photos/seed/p8p/400/400', 1099.00, 850.00, 120, 'With the power of Google AI, the Pixel 8 Pro''s camera makes every photo a masterpiece, effortlessly.'),
    ('Nova Spark', 'https://picsum.photos/seed/ns1/400/400', 349.00, 250.00, 300, 'Ignite your creativity with the Nova Spark, the vibrant and powerful companion for your everyday adventures.')
ON CONFLICT DO NOTHING;
