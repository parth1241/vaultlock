const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const rootDir = process.cwd();

// Fix error.message in APIs
const apiFiles = execSync('find ' + path.join(rootDir, 'app/api') + ' -type f -name "*.ts"').toString().split('\n').filter(Boolean);
for (const file of apiFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/error:\s*error\.message(\s*\|\|\s*'[^']+')?/g, "error: 'Internal server error'");
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed API Error in:', file);
  }
}

// Fix stellar.ts renames
const stellarTs = path.join(rootDir, 'lib/stellar.ts');
let stellarContent = fs.readFileSync(stellarTs, 'utf8');
stellarContent = stellarContent.replace(/export function generateEscrowKeypair\(/g, 'export function generateCollectorKeypair(');
stellarContent = stellarContent.replace(/export async function buildClaimBalanceTransaction\(/g, 'export async function claimBalance(');
fs.writeFileSync(stellarTs, stellarContent);
console.log('Fixed stellar.ts');

// Fix app/api/escrows/route.ts 'generateEscrowKeypair' references
const escrowsRouteTs = path.join(rootDir, 'app/api/escrows/route.ts');
let erContent = fs.readFileSync(escrowsRouteTs, 'utf8');
erContent = erContent.replace(/generateEscrowKeypair/g, 'generateCollectorKeypair');
fs.writeFileSync(escrowsRouteTs, erContent);

// Search for buildClaimBalanceTransaction globally across the project to replace
const allFiles = execSync('find ' + rootDir + ' -type f -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);
for (const file of allFiles) {
  if (file.includes('node_modules') || file.includes('.next')) continue;
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  if (file.endsWith('lib/stellar.ts')) continue;
  
  if (content.includes('buildClaimBalanceTransaction')) {
    content = content.replace(/buildClaimBalanceTransaction/g, 'claimBalance');
    modified = true;
  }
  
  if (content.includes('generateEscrowKeypair') && !file.endsWith('app/api/escrows/route.ts')) {
    content = content.replace(/generateEscrowKeypair/g, 'generateCollectorKeypair');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log('Fixed references in:', file);
  }
}

// Fix Db Indexes: Escrow.ts and Milestone.ts
const escrowModel = path.join(rootDir, 'lib/models/Escrow.ts');
let emContent = fs.readFileSync(escrowModel, 'utf8');
emContent = emContent.replace(/clientId:\s*\{\s*type:\s*String,\s*required:\s*true\s*\}/, "clientId: { type: String, required: true, index: true }");
emContent = emContent.replace(/freelancerId:\s*\{\s*type:\s*String,\s*default:\s*''\s*\}/, "freelancerId: { type: String, default: '', index: true }");
fs.writeFileSync(escrowModel, emContent);
console.log('Fixed Escrow Model');

const milestoneModel = path.join(rootDir, 'lib/models/Milestone.ts');
let mmContent = fs.readFileSync(milestoneModel, 'utf8');
mmContent = mmContent.replace(/escrowId:\s*\{\s*type:\s*Schema\.Types\.ObjectId,\s*ref:\s*'Escrow',\s*required:\s*true\s*\}/, "escrowId: { type: Schema.Types.ObjectId, ref: 'Escrow', required: true, index: true }");
fs.writeFileSync(milestoneModel, mmContent);
console.log('Fixed Milestone Model');
