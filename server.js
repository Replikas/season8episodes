const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_VD0GOtn6orLs@ep-patient-snow-a853to1x-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize database tables
async function initializeDatabase() {
    try {
        // Create episodes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS episodes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                season INTEGER NOT NULL,
                episode INTEGER NOT NULL,
                air_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create episode_links table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS episode_links (
                id SERIAL PRIMARY KEY,
                episode_id INTEGER REFERENCES episodes(id) ON DELETE CASCADE,
                url TEXT NOT NULL,
                quality VARCHAR(50),
                source VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Only insert default episodes if table is empty
        const { rows } = await pool.query('SELECT COUNT(*) FROM episodes');
        if (parseInt(rows[0].count) === 0) {
            await insertDefaultEpisodes();
            console.log('Default episodes inserted');
        } else {
            console.log('Episodes already exist, skipping default data insertion');
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Insert default episodes
async function insertDefaultEpisodes() {
    const defaultEpisodes = [
        {
            title: "Summer of All Fears",
            description: "To punish Morty and Summer, Rick puts them in a simulation.",
            season: 8,
            episode: 1,
            air_date: "2025-05-25"
        },
        {
            title: "Valkyrick",
            description: "Space Beth calls her dad for a ride, broh.",
            season: 8,
            episode: 2,
            air_date: "2025-06-01"
        },
        {
            title: "The Rick, The Mort & The Ugly",
            description: "Some guys wanna rebuild the citadel, broh. Seems like a bad idea, broh. Yeehaw stuff, broh.",
            season: 8,
            episode: 3,
            air_date: "2025-06-08"
        },
        {
            title: "The Last Temptation of Jerry",
            description: "Broh is risen. The Smiths learn the true meaning of Easter. Kind of. Broh.",
            season: 8,
            episode: 4,
            air_date: "2025-06-15"
        },
        {
            title: "Cryo Mort a Rickver",
            description: "Rick and Morty wanna rob a ship in cryosleep, but people are light sleepers.",
            season: 8,
            episode: 5,
            air_date: "2025-06-22"
        },
        {
            title: "The Curicksous Case of Bethjamin Button",
            description: "The brohs goes to a theme park Rick loves. Beth and Space Beth stay behind and regress or something.",
            season: 8,
            episode: 6,
            air_date: "2025-06-29"
        },
        {
            title: "Ricker Than Fiction",
            description: "Rick and Morty write the next installment of their favorite movie franchise.",
            season: 8,
            episode: 7,
            air_date: "2025-07-06"
        },
        {
            title: "Nomortland",
            description: "Jerry makes a friend just as jobless as he is.",
            season: 8,
            episode: 8,
            air_date: "2025-07-13"
        },
        {
            title: "Morty Daddy",
            description: "Summer and Rick dine out. Morty reconnects with someone from his past.",
            season: 8,
            episode: 9,
            air_date: "2025-07-20"
        },
        {
            title: "Hot Rick",
            description: "Sometimes we try weird stuff to let go of the past.",
            season: 8,
            episode: 10,
            air_date: "2025-07-27"
        }
    ];

    for (const episode of defaultEpisodes) {
        await pool.query(
            'INSERT INTO episodes (title, description, season, episode, air_date) VALUES ($1, $2, $3, $4, $5)',
            [episode.title, episode.description, episode.season, episode.episode, episode.air_date]
        );
    }

    // Sample link removed - episodes start with no links
}

// API Routes

// Get all episodes with their links
app.get('/api/episodes', async (req, res) => {
    try {
        const episodesQuery = `
            SELECT 
                e.id,
                e.title,
                e.description,
                e.season,
                e.episode,
                e.air_date as "airDate",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'url', el.url,
                            'quality', el.quality,
                            'source', el.source
                        )
                    ) FILTER (WHERE el.id IS NOT NULL),
                    '[]'
                ) as links
            FROM episodes e
            LEFT JOIN episode_links el ON e.id = el.episode_id
            WHERE e.season = 8
            GROUP BY e.id, e.title, e.description, e.season, e.episode, e.air_date
            ORDER BY e.episode
        `;
        
        const { rows } = await pool.query(episodesQuery);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new link to an episode
app.post('/api/episodes/:id/links', async (req, res) => {
    try {
        const episodeId = parseInt(req.params.id);
        const { url, quality, source } = req.body;

        if (!url || !quality || !source) {
            return res.status(400).json({ error: 'Missing required fields: url, quality, source' });
        }

        // Check if episode exists
        const episodeCheck = await pool.query('SELECT id FROM episodes WHERE id = $1', [episodeId]);
        if (episodeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Episode not found' });
        }

        // Insert the new link
        const result = await pool.query(
            'INSERT INTO episode_links (episode_id, url, quality, source) VALUES ($1, $2, $3, $4) RETURNING *',
            [episodeId, url, quality, source]
        );

        res.status(201).json({
            message: 'Link added successfully',
            link: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get episode statistics
app.get('/api/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT e.id) as total_episodes,
                COUNT(el.id) as total_links,
                COUNT(DISTINCT CASE WHEN el.id IS NOT NULL THEN e.id END) as episodes_with_links
            FROM episodes e
            LEFT JOIN episode_links el ON e.id = el.episode_id
            WHERE e.season = 8
        `;
        
        const { rows } = await pool.query(statsQuery);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});

module.exports = app;