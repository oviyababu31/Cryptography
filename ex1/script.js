function encrypt() {
    let cipher = document.getElementById("cipher").value;
    let text = document.getElementById("text").value.trim().toUpperCase();
    let key = document.getElementById("key").value.trim().toUpperCase();

    if (!text) {
        document.getElementById("output").innerText = "❌ Error: Text cannot be empty";
        return;
    }

    let output = "";
    if (cipher === "caesar") output = caesarEncrypt(text, key);
    else if (cipher === "playfair") output = playfairEncrypt(text, key);
    else if (cipher === "hill") output = hillEncrypt(text, key);

    document.getElementById("output").innerText = output;
}

function decrypt() {
    let cipher = document.getElementById("cipher").value;
    let text = document.getElementById("text").value.trim().toUpperCase();
    let key = document.getElementById("key").value.trim().toUpperCase();

    if (!text) {
        document.getElementById("output").innerText = "❌ Error: Text cannot be empty";
        return;
    }

    let output = "";
    if (cipher === "caesar") output = caesarDecrypt(text, key);
    else if (cipher === "playfair") output = playfairDecrypt(text, key);
    else if (cipher === "hill") output = hillDecrypt(text, key);

    document.getElementById("output").innerText = output;
}

/* ==================== CAESAR CIPHER ==================== */
function caesarEncrypt(text, userKey) {
    let steps = "CAESAR CIPHER ENCRYPTION\n\n";
    let key = 3; // fixed

    if (userKey !== "3") {
        steps += "❌ Error: Invalid key entered. Using k=3 by default.\n\n";
    } else {
        steps += "✔ Valid key (k=3)\n\n";
    }

    steps += "Formula: C = (P + 3) mod 26\n\n";
    let cipherText = "";
    for (let ch of text) {
        if (ch >= 'A' && ch <= 'Z') {
            let p = ch.charCodeAt(0) - 65;
            let c = (p + key) % 26;
            cipherText += String.fromCharCode(c + 65);
            steps += `${ch} -> (${p}+3) mod 26 = ${c} -> ${String.fromCharCode(c+65)}\n`;
        } else cipherText += ch;
    }
    steps += "\nCipher Text: " + cipherText;
    return steps;
}

function caesarDecrypt(text, userKey) {
    let steps = "CAESAR CIPHER DECRYPTION\n\n";
    let key = 3;

    if (userKey !== "3") {
        steps += "❌ Error: Invalid key entered. Using k=3 by default.\n\n";
    } else steps += "✔ Valid key (k=3)\n\n";

    steps += "Formula: P = (C - 3 + 26) mod 26\n\n";
    let plainText = "";
    for (let ch of text) {
        if (ch >= 'A' && ch <= 'Z') {
            let c = ch.charCodeAt(0) - 65;
            let p = (c - key + 26) % 26;
            plainText += String.fromCharCode(p + 65);
            steps += `${ch} -> (${c}-3+26) mod 26 = ${p} -> ${String.fromCharCode(p+65)}\n`;
        } else plainText += ch;
    }
    steps += "\nPlain Text: " + plainText;
    return steps;
}

/* ==================== PLAYFAIR CIPHER ==================== */
function playfairEncrypt(text, key) {
    let steps = "PLAYFAIR CIPHER ENCRYPTION\n\n";
    if (!key || !/^[A-Z]+$/.test(key)) {
        return "❌ Error: Key must contain only letters (A-Z)";
    }

    text = text.replace(/J/g, "I");
    key = key.replace(/J/g, "I");

    steps += "Plain Text: " + text + "\nKey: " + key + "\n\n";

    // Key matrix
    let matrix = [];
    let used = "";
    for (let ch of key + "ABCDEFGHIKLMNOPQRSTUVWXYZ") {
        if (!used.includes(ch)) { used += ch; matrix.push(ch); }
    }

    steps += "Key Matrix (5x5):\n";
    for (let i=0;i<25;i++){ steps+=matrix[i]+" "; if((i+1)%5===0) steps+="\n"; }

    // Digraphs
    let pairs = [];
    for (let i=0;i<text.length;i++){
        let a = text[i], b = text[i+1]||'X';
        if(a===b) b='X'; else i++;
        pairs.push(a+b);
    }
    steps += "\nDigraphs: " + pairs.join(", ") + "\n\n";

    // Encryption
    let cipherText="";
    for(let pair of pairs){
        let a=matrix.indexOf(pair[0]);
        let b=matrix.indexOf(pair[1]);
        let r1=Math.floor(a/5),c1=a%5;
        let r2=Math.floor(b/5),c2=b%5;
        let e1,e2;
        if(r1===r2){ e1=matrix[r1*5+(c1+1)%5]; e2=matrix[r2*5+(c2+1)%5]; steps+=`${pair} -> Same Row -> ${e1}${e2}\n`; }
        else if(c1===c2){ e1=matrix[((r1+1)%5)*5+c1]; e2=matrix[((r2+1)%5)*5+c2]; steps+=`${pair} -> Same Column -> ${e1}${e2}\n`; }
        else { e1=matrix[r1*5+c2]; e2=matrix[r2*5+c1]; steps+=`${pair} -> Rectangle -> ${e1}${e2}\n`; }
        cipherText += e1+e2;
    }
    steps += "\nCipher Text: " + cipherText;
    return steps;
}

// For simplicity, Playfair Decrypt can be left as evaluation only
function playfairDecrypt(text, key) {
    let steps = "PLAYFAIR CIPHER DECRYPTION\n\n";

    if (!key || !/^[A-Z]+$/.test(key)) {
        return "❌ Error: Key must contain only letters (A-Z)";
    }

    text = text.replace(/J/g, "I");
    key = key.replace(/J/g, "I");

    steps += "Cipher Text: " + text + "\nKey: " + key + "\n\n";

    // Build key matrix
    let matrix = [];
    let used = "";
    for (let ch of key + "ABCDEFGHIKLMNOPQRSTUVWXYZ") {
        if (!used.includes(ch)) { used += ch; matrix.push(ch); }
    }

    steps += "Key Matrix (5x5):\n";
    for (let i = 0; i < 25; i++) {
        steps += matrix[i] + " ";
        if ((i + 1) % 5 === 0) steps += "\n";
    }

    // Split cipher text into digraphs
    let pairs = [];
    for (let i = 0; i < text.length; i += 2) {
        let a = text[i];
        let b = text[i + 1] || 'X';
        pairs.push(a + b);
    }

    steps += "\nDigraphs: " + pairs.join(", ") + "\n\n";

    // Decryption process
    let plainText = "";
    steps += "Decryption Steps:\n";

    for (let pair of pairs) {
        let a = matrix.indexOf(pair[0]);
        let b = matrix.indexOf(pair[1]);

        let r1 = Math.floor(a / 5), c1 = a % 5;
        let r2 = Math.floor(b / 5), c2 = b % 5;

        let p1, p2;

        if (r1 === r2) {
            // Same row: move left
            p1 = matrix[r1 * 5 + (c1 + 4) % 5];
            p2 = matrix[r2 * 5 + (c2 + 4) % 5];
            steps += `${pair} -> Same Row -> ${p1}${p2}\n`;
        } 
        else if (c1 === c2) {
            // Same column: move up
            p1 = matrix[((r1 + 4) % 5) * 5 + c1];
            p2 = matrix[((r2 + 4) % 5) * 5 + c2];
            steps += `${pair} -> Same Column -> ${p1}${p2}\n`;
        } 
        else {
            // Rectangle: swap columns
            p1 = matrix[r1 * 5 + c2];
            p2 = matrix[r2 * 5 + c1];
            steps += `${pair} -> Rectangle -> ${p1}${p2}\n`;
        }

        plainText += p1 + p2;
    }

    steps += "\nPlain Text: " + plainText;
    return steps;
}
/* ==================== HILL CIPHER ==================== */
function mod(n, m) {
  return ((n % m) + m) % m;
}

function charToNum(c) {
  return c.charCodeAt(0) - 65;
}

function numToChar(n) {
  return String.fromCharCode(mod(n,26) + 65);
}

function modInverse(d) {
  for (let i = 1; i < 26; i++) {
    if (mod(d * i, 26) === 1) return i;
  }
  return null;
}

function hillEncrypt(text, key) {
  let steps = "HILL CIPHER ENCRYPTION\n\n";

  let k = key.split(/\s+/).map(Number);
  if (k.length !== 4 || k.some(isNaN)) {
    return "❌ Error: Enter 4 numeric values\nExample: 2 3 3 6";
  }

  let [a,b,c,d] = k;

  steps += "Key Matrix K:\n";
  steps += `[ ${a}  ${b} ]\n[ ${c}  ${d} ]\n\n`;

  // Determinant
  let det = a*d - b*c;
  steps += "Step 1: Determinant\n";
  steps += `|K| = (${a}×${d}) − (${b}×${c}) = ${det}\n`;

  det = mod(det,26);
  steps += `|K| mod 26 = ${det}\n\n`;

  let detInv = modInverse(det);
  if (detInv === null) {
    return steps + "❌ Determinant has no inverse mod 26\nKey is invalid";
  }

  // Show inverse calculation
  steps += "Step 2: Determinant Inverse\n";
  for(let i=1;i<26;i++){
    steps += `${det} × ${i} mod 26 = ${(det*i)%26}\n`;
    if((det*i)%26===1) break;
  }
  steps += `⇒ det⁻¹ = ${detInv}\n\n`;

  // Padding
  text = text.replace(/[^A-Z]/g,"");
  if (text.length % 2 !== 0) text += "X";
  steps += "Plain Text (after padding): " + text + "\n\n";

  // Encryption
  let cipher = "";
  steps += "Step 3: Encryption (C = KP mod 26)\n";

  for (let i=0;i<text.length;i+=2) {
    let p1 = charToNum(text[i]);
    let p2 = charToNum(text[i+1]);

    let c1 = mod(a*p1 + b*p2, 26);
    let c2 = mod(c*p1 + d*p2, 26);

    steps += `[${p1},${p2}] → [${c1},${c2}] → ${numToChar(c1)}${numToChar(c2)}\n`;
    cipher += numToChar(c1) + numToChar(c2);
  }

  steps += "\nCipher Text: " + cipher;
  return steps;
}
function hillDecrypt(text, key) {
  let steps = "HILL CIPHER DECRYPTION\n\n";

  let k = key.split(/\s+/).map(Number);
  if (k.length !== 4 || k.some(isNaN)) {
    return "❌ Error: Enter 4 numeric values\nExample: 2 3 3 6";
  }

  let [a,b,c,d] = k;

  let det = mod(a*d - b*c,26);
  let detInv = modInverse(det);
  if (detInv === null) {
    return "❌ Determinant has no inverse mod 26";
  }

  steps += "Step 1: Adjoint Matrix\n";
  let adj = [[d,-b],[-c,a]];
  steps += `[ ${d}  ${-b} ]\n[ ${-c}  ${a} ]\n\n`;

  steps += "Step 2: Inverse Key Matrix\n";
  let Kinv = [
    [mod(detInv*d,26), mod(detInv*(-b),26)],
    [mod(detInv*(-c),26), mod(detInv*a,26)]
  ];

  steps += `[ ${Kinv[0][0]}  ${Kinv[0][1]} ]\n[ ${Kinv[1][0]}  ${Kinv[1][1]} ]\n\n`;

  text = text.replace(/[^A-Z]/g,"");
  let plain = "";

  steps += "Step 3: Decryption (P = K⁻¹C mod 26)\n";

  for (let i=0;i<text.length;i+=2) {
    let c1 = charToNum(text[i]);
    let c2 = charToNum(text[i+1]);

    let p1 = mod(Kinv[0][0]*c1 + Kinv[0][1]*c2, 26);
    let p2 = mod(Kinv[1][0]*c1 + Kinv[1][1]*c2, 26);

    steps += `[${c1},${c2}] → [${p1},${p2}] → ${numToChar(p1)}${numToChar(p2)}\n`;
    plain += numToChar(p1) + numToChar(p2);
  }

  steps += "\nPlain Text: " + plain;
  return steps;
}

