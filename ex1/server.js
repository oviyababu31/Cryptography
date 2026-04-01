const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Parses JSON bodies

// GCD Calculation Route
app.post('/calculate-gcd', (req, res) => {
    let { a, b } = req.body;
    let steps = [];
    
    // Ensure a and b are positive integers
    if (a <= 0 || b <= 0) {
        return res.status(400).json({ error: "Both numbers must be positive integers." });
    }

    while (b !== 0) {
        let r = a % b;
        steps.push({ a, b, r });
        a = b;
        b = r;
    }

    res.json({ gcd: a, steps: steps });
});

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
