const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json())
app.use(express.static("public"))

/* ================= XOR ================= */

function xor(a,b){

let out=""

for(let i=0;i<a.length;i++)
out+=(a[i]^b[i])

return out

}

/* =========================================
            S-DES ENCRYPT
========================================= */

app.post("/sdesEncrypt",(req,res)=>{

let {plaintext,key,rounds}=req.body

let out="S-DES ENCRYPTION\n\n"

let left=plaintext.substring(0,4)
let right=plaintext.substring(4,8)

for(let i=1;i<=rounds;i++){

out+="ROUND "+i+"\n"

out+="Left = "+left+"\n"
out+="Right = "+right+"\n"

let f=xor(right,key.substring(0,4))

out+="F(right,key) = "+f+"\n"

let newLeft=xor(left,f)

out+="Left XOR F = "+newLeft+"\n"

left=right
right=newLeft

out+="Swap = "+left+right+"\n\n"

}

out+="Ciphertext = "+left+right

res.send(out)

})

/* =========================================
            S-DES DECRYPT
========================================= */

app.post("/sdesDecrypt",(req,res)=>{

let {plaintext,key,rounds}=req.body

let out="S-DES DECRYPTION\n\n"

let left=plaintext.substring(0,4)
let right=plaintext.substring(4,8)

for(let i=rounds;i>=1;i--){

out+="ROUND "+i+"\n"

let f=xor(left,key.substring(0,4))

let newRight=xor(right,f)

out+="Right XOR F = "+newRight+"\n"

right=left
left=newRight

out+="Swap = "+left+right+"\n\n"

}

out+="Recovered Plaintext = "+left+right

res.send(out)

})

/* =========================================
                AES ENCRYPT
========================================= */

app.post("/aesEncrypt",(req,res)=>{

let {key,data,rounds}=req.body

let out="AES ENCRYPTION\n\n"

let state=data.match(/.{2}/g)
let keyBytes=key.match(/.{2}/g)

out+="Initial State\n"
out+=state.join(" ")+"\n\n"

for(let r=1;r<=rounds;r++){

out+="ROUND "+r+"\n\n"

out+="AddRoundKey\n"

for(let i=0;i<state.length;i++)
state[i]=(parseInt(state[i],16)^parseInt(keyBytes[i],16)).toString(16)

out+=state.join(" ")+"\n\n"

out+="SubBytes\n"

state=state.map(x=>((parseInt(x,16)*7)%256).toString(16))

out+=state.join(" ")+"\n\n"

out+="ShiftRows\n"

state=[
state[0],state[1],state[2],state[3],
state[5],state[6],state[7],state[4],
state[10],state[11],state[8],state[9],
state[15],state[12],state[13],state[14]
]

out+=state.join(" ")+"\n\n"

out+="MixColumns\n"

state=state.map(x=>((parseInt(x,16)*2)%256).toString(16))

out+=state.join(" ")+"\n\n"

}

out+="Ciphertext\n"
out+=state.join(" ")

res.send(out)

})

/* =========================================
                AES DECRYPT
========================================= */

app.post("/aesDecrypt",(req,res)=>{

let {key,data,rounds}=req.body

let out="AES DECRYPTION\n\n"

let state=data.match(/.{2}/g)
let keyBytes=key.match(/.{2}/g)

for(let r=rounds;r>=1;r--){

out+="ROUND "+r+"\n\n"

out+="Inverse MixColumns\n"

state=state.map(x=>((parseInt(x,16)/2)|0).toString(16))

out+=state.join(" ")+"\n\n"

out+="Inverse ShiftRows\n"

state=[
state[0],state[1],state[2],state[3],
state[7],state[4],state[5],state[6],
state[10],state[11],state[8],state[9],
state[13],state[14],state[15],state[12]
]

out+=state.join(" ")+"\n\n"

out+="Inverse SubBytes\n"

state=state.map(x=>((parseInt(x,16)/7)|0).toString(16))

out+=state.join(" ")+"\n\n"

out+="AddRoundKey\n"

for(let i=0;i<state.length;i++)
state[i]=(parseInt(state[i],16)^parseInt(keyBytes[i],16)).toString(16)

out+=state.join(" ")+"\n\n"

}

out+="Recovered Plaintext\n"
out+=state.join(" ")

res.send(out)

})

app.listen(3000,()=>{

console.log("Server running at http://localhost:3000")

})