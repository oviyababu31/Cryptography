const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

/* ================================
   RSA FUNCTIONS
================================ */

function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function modInverse(e, phi) {
    let t = 0, newT = 1;
    let r = phi, newR = e;

    while (newR !== 0) {
        let q = Math.floor(r / newR);

        [t, newT] = [newT, t - q * newT];
        [r, newR] = [newR, r - q * newR];
    }

    if (r > 1) return null;
    if (t < 0) t += phi;

    return t;
}

function modPow(base, exp, mod) {
    let result = 1n;
    base = BigInt(base);
    exp = BigInt(exp);
    mod = BigInt(mod);

    while (exp > 0n) {
        if (exp % 2n === 1n)
            result = (result * base) % mod;

        base = (base * base) % mod;
        exp = exp / 2n;
    }

    return result;
}

/* ================================
   RSA KEY GENERATION
================================ */

app.post("/rsa/generate", (req, res) => {

    let { p, q, e } = req.body;

    p = Number(p);
    q = Number(q);
    e = Number(e);

    let n = p * q;
    let phi = (p - 1) * (q - 1);

    if (gcd(e, phi) !== 1) {
        return res.json({ error: "e must be coprime with φ(n)" });
    }

    let d = modInverse(e, phi);

    res.json({
        n,
        phi,
        d
    });

});

/* ================================
   RSA ENCRYPTION
================================ */

app.post("/rsa/encrypt", (req, res) => {

    let { m, e, n } = req.body;

    let C = modPow(m, e, n);

    res.json({
        cipher: C.toString()
    });

});

/* ================================
   RSA DECRYPTION
================================ */

app.post("/rsa/decrypt", (req, res) => {

    let { C, d, n } = req.body;

    let m = modPow(C, d, n);

    res.json({
        message: m.toString()
    });

});

/* ================================
   DIFFIE HELLMAN
================================ */

app.post("/diffie", (req, res) => {

    let { p, g, a, b } = req.body;

    p = BigInt(p);
    g = BigInt(g);
    a = BigInt(a);
    b = BigInt(b);

    let A = modPow(g, a, p);
    let B = modPow(g, b, p);

    let keyA = modPow(B, a, p);
    let keyB = modPow(A, b, p);

    res.json({
        publicA: A.toString(),
        publicB: B.toString(),
        secretA: keyA.toString(),
        secretB: keyB.toString()
    });

});

/* ================================
   START SERVER
================================ */

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});