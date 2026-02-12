const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: '🐳 Docker + GitHub Codespaces Demo',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            info: '/info',
            echo: 'POST /echo'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/info', (req, res) => {
    res.json({
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            heap_used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        },
        env: process.env.NODE_ENV || 'development',
        running_in_docker: process.env.RUNNING_IN_DOCKER === 'true'
    });
});

app.post('/echo', (req, res) => {
    res.json({
        echo: req.body,
        received_at: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// Start server
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/health`);
        console.log(`🐳 Running in Docker: ${process.env.RUNNING_IN_DOCKER === 'true'}`);
    });
}

module.exports = app;
