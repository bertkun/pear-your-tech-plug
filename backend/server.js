require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const { GoogleGenAI } = require('@google/genai');

// --- Configuration & Pre-flight Checks ---
let isAiAvailable = true;
if (!process.env.API_KEY) {
    isAiAvailable = false;
    console.warn("\n[WARNING] API_KEY not found in .env file.");
    console.warn("AI-powered features like product description generation will be disabled.");
    console.warn("To enable them, follow the instructions in backend/README.md\n");
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Functions ---
const initializeDb = async () => {
    try {
        await db.query(`
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
            )
        `);
        
        await db.query(`
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
            )
        `);
        
        const result = await db.query('SELECT COUNT(*) FROM phones');
        if (parseInt(result.rows[0].count) === 0) {
            console.log('Seeding database with default phones...');
            const phones = [
                { name: "Quantum X1", imageUrl: "https://picsum.photos/seed/qx1/400/400", retailPrice: 999, wholesalePrice: 750, stock: 150, description: "Experience the next leap in mobile technology with the Quantum X1, where unparalleled speed meets a breathtaking display." },
                { name: "Nebula Pro", imageUrl: "https://picsum.photos/seed/np1/400/400", retailPrice: 1199, wholesalePrice: 900, stock: 80, description: "Capture the cosmos with the Nebula Pro's revolutionary camera system and immerse yourself in its edge-to-edge starlight screen." },
                { name: "Stellar Lite", imageUrl: "https://picsum.photos/seed/sl1/400/400", retailPrice: 499, wholesalePrice: 380, stock: 250, description: "The Stellar Lite packs a universe of features into a sleek, lightweight design, making premium technology accessible to everyone." },
                { name: "Galaxy Fold Z5", imageUrl: "https://picsum.photos/seed/gfz5/400/400", retailPrice: 1799, wholesalePrice: 1500, stock: 50, description: "Unfold the future with the Galaxy Fold Z5, where a cinematic tablet experience fits right in your pocket." },
                { name: "Pixel 8 Pro", imageUrl: "https://picsum.photos/seed/p8p/400/400", retailPrice: 1099, wholesalePrice: 850, stock: 120, description: "With the power of Google AI, the Pixel 8 Pro's camera makes every photo a masterpiece, effortlessly." },
                { name: "Nova Spark", imageUrl: "https://picsum.photos/seed/ns1/400/400", retailPrice: 349, wholesalePrice: 250, stock: 300, description: "Ignite your creativity with the Nova Spark, the vibrant and powerful companion for your everyday adventures." }
            ];
            
            for (const phone of phones) {
                await db.query(
                    'INSERT INTO phones (name, image_url, retail_price, wholesale_price, stock, description) VALUES ($1, $2, $3, $4, $5, $6)',
                    [phone.name, phone.imageUrl, phone.retailPrice, phone.wholesalePrice, phone.stock, phone.description]
                );
            }
        }
        
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

const writeDb = async () => {
    // Not needed for PostgreSQL - kept for compatibility
};

// Define OrderStatus directly in the backend
const OrderStatus = {
    Placed: 'Order Placed',
    Processing: 'Processing',
    Packaged: 'Packaged',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
};

// --- Middleware ---
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Initialize Gemini AI only if the key is available
const ai = isAiAvailable ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

// --- Helper Functions ---
const generatePhoneDescription = async (phoneName) => {
    if (!ai) {
        console.log(`AI disabled. Returning fallback description for ${phoneName}.`);
        return `Experience the new ${phoneName}, designed for excellence.`;
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, exciting, one-sentence marketing description for this phone model: ${phoneName}.`,
        });
        return response.text.trim();
    } catch(e) {
        console.error("Error generating description, falling back.", e);
        return `Experience the new ${phoneName}, designed for excellence.`;
    }
};

// --- API Routes ---

app.get('/', (req, res) => {
    res.json({ message: 'PEAR Backend is running!' });
});

app.get('/api/phones', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM phones ORDER BY id');
        const phones = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            imageUrl: row.image_url,
            retailPrice: parseFloat(row.retail_price),
            wholesalePrice: parseFloat(row.wholesale_price),
            stock: row.stock,
            description: row.description
        }));
        res.json(phones);
    } catch (error) {
        console.error('Error fetching phones:', error);
        res.status(500).json({ message: 'Failed to fetch phones.' });
    }
});

app.post('/api/phones', async (req, res) => {
    try {
        const { name, imageUrl, retailPrice, wholesalePrice, stock } = req.body;
        const description = await generatePhoneDescription(name);
        
        const result = await db.query(
            'INSERT INTO phones (name, image_url, retail_price, wholesale_price, stock, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, imageUrl, retailPrice, wholesalePrice, stock, description]
        );
        
        const newPhone = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            imageUrl: result.rows[0].image_url,
            retailPrice: parseFloat(result.rows[0].retail_price),
            wholesalePrice: parseFloat(result.rows[0].wholesale_price),
            stock: result.rows[0].stock,
            description: result.rows[0].description
        };
        
        res.status(201).json(newPhone);
    } catch (error) {
        console.error('Error adding new phone:', error);
        res.status(500).json({ message: 'Failed to add new phone.' });
    }
});

app.put('/api/phones/:id/stock', async (req, res) => {
    try {
        const phoneId = parseInt(req.params.id, 10);
        const { stock } = req.body;

        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({ message: 'Invalid stock value.' });
        }

        const result = await db.query(
            'UPDATE phones SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [stock, phoneId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Phone not found.' });
        }

        const updatedPhone = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            imageUrl: result.rows[0].image_url,
            retailPrice: parseFloat(result.rows[0].retail_price),
            wholesalePrice: parseFloat(result.rows[0].wholesale_price),
            stock: result.rows[0].stock,
            description: result.rows[0].description
        };
        
        res.json(updatedPhone);
    } catch (error) {
        console.error(`Error updating stock for phone ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to update stock.' });
    }
});

app.post('/api/orders/status-update', async (req, res) => {
    const { status } = req.body;
    const fallbackMessage = `Your order is now: ${status}. We'll notify you of the next steps.`;

    if (!ai) {
        console.log(`AI disabled. Returning fallback message for status: ${status}.`);
        return res.json({ message: fallbackMessage });
    }
    
    let prompt = '';
    switch (status) {
        case OrderStatus.Processing:
            prompt = 'Write a friendly, reassuring message confirming that a customer\'s phone order is now being processed.';
            break;
        case OrderStatus.Packaged:
            prompt = 'Write an exciting message that a customer\'s phone order has been carefully packaged and is ready for shipment.';
            break;
        case OrderStatus.Shipped:
            prompt = 'Write a professional message informing a customer that their phone order has been shipped and is on its way. Mention that tracking details will be available soon.';
            break;
        case OrderStatus.Delivered:
            prompt = 'Write a cheerful and welcoming message confirming that a customer\'s new phone has been delivered. Encourage them to enjoy their new device.';
            break;
        default:
            return res.json({ message: 'Your order status has been updated.' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        res.json({ message: response.text });
    } catch (error) {
        console.error(`Error generating status update for ${status}:`, error);
        res.status(500).json({ message: fallbackMessage });
    }
});

// --- Start Server ---
const startServer = async () => {
    await initializeDb();
    app.listen(PORT, () => {
        console.log(`Server is running! Check status at http://localhost:${PORT}`);
    });
};

startServer();