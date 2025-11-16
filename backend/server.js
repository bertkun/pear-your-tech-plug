require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
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
const DB_PATH = path.join(__dirname, 'db.json');

// In-memory database cache
let db = { phones: [] };

const defaultPhones = [
    { id: 1, name: "Quantum X1", imageUrl: "https://picsum.photos/seed/qx1/400/400", retailPrice: 999, wholesalePrice: 750, stock: 150, description: "Experience the next leap in mobile technology with the Quantum X1, where unparalleled speed meets a breathtaking display." },
    { id: 2, name: "Nebula Pro", imageUrl: "https://picsum.photos/seed/np1/400/400", retailPrice: 1199, wholesalePrice: 900, stock: 80, description: "Capture the cosmos with the Nebula Pro's revolutionary camera system and immerse yourself in its edge-to-edge starlight screen." },
    { id: 3, name: "Stellar Lite", imageUrl: "https://picsum.photos/seed/sl1/400/400", retailPrice: 499, wholesalePrice: 380, stock: 250, description: "The Stellar Lite packs a universe of features into a sleek, lightweight design, making premium technology accessible to everyone." },
    { id: 4, name: "Galaxy Fold Z5", imageUrl: "https://picsum.photos/seed/gfz5/400/400", retailPrice: 1799, wholesalePrice: 1500, stock: 50, description: "Unfold the future with the Galaxy Fold Z5, where a cinematic tablet experience fits right in your pocket." },
    { id: 5, name: "Pixel 8 Pro", imageUrl: "https://picsum.photos/seed/p8p/400/400", retailPrice: 1099, wholesalePrice: 850, stock: 120, description: "With the power of Google AI, the Pixel 8 Pro's camera makes every photo a masterpiece, effortlessly." },
    { id: 6, name: "Nova Spark", imageUrl: "https://picsum.photos/seed/ns1/400/400", retailPrice: 349, wholesalePrice: 250, stock: 300, description: "Ignite your creativity with the Nova Spark, the vibrant and powerful companion for your everyday adventures." }
];


// --- Database Functions ---
const initializeDb = async () => {
    try {
        await fs.access(DB_PATH);
        const data = await fs.readFile(DB_PATH, 'utf-8');
        db = JSON.parse(data);
        console.log('Database loaded successfully from existing file.');
    } catch (error) {
        console.warn('Database file not found or corrupted. Creating a new one with default data.');
        db = { phones: defaultPhones };
        await writeDb();
    }
};

const writeDb = async () => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error writing to database file:', error);
    }
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

app.get('/api/phones', (req, res) => {
    res.json(db.phones || []);
});

app.post('/api/phones', async (req, res) => {
    try {
        const { name, imageUrl, retailPrice, wholesalePrice, stock } = req.body;
        const description = await generatePhoneDescription(name);
        
        const newId = db.phones.length > 0 ? Math.max(...db.phones.map(p => p.id)) + 1 : 1;
        
        const newPhone = {
            id: newId,
            name,
            description,
            imageUrl,
            retailPrice,
            wholesalePrice,
            stock
        };

        db.phones.push(newPhone);
        await writeDb();
        
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

        const phoneIndex = db.phones.findIndex(p => p.id === phoneId);
        if (phoneIndex === -1) {
            return res.status(404).json({ message: 'Phone not found.' });
        }

        db.phones[phoneIndex].stock = stock;
        const updatedPhone = db.phones[phoneIndex];
        
        await writeDb();
        
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