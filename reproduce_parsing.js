const fs = require('fs');

async function testParsing() {
  const content = fs.readFileSync('debug_ordinateur.json', 'utf8');
  const data = JSON.parse(content);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const extract = pages[pageId].extract;

  console.log('Extract length:', extract.length);

  // 3. Check for French section
  // Use strict regex to avoid matching === Header === as == Header ==
  const frenchSectionMatch = extract.match(/(?:^|\n)==\s*Français\s*==([\s\S]*?)(?:(?:\n|^)==\s*[A-Z][a-z]+\s*==|$)/);
  
  if (!frenchSectionMatch) {
    console.log('No French section found');
    return;
  }

  console.log('French section found');
  const frenchContent = frenchSectionMatch[1];
  const lines = frenchContent.split('\n');
  
  lines.forEach((l, i) => {
      if (l.trim().startsWith('=')) {
          console.log(`Line ${i} starts with =: "${l}" (len: ${l.length})`);
      }
  });
  
  let nounDefinition = '';
  let otherDefinition = '';
  
  let currentPos = '';
  const title = 'ordinateur'; // Hardcoded for test

  // Common POS headers
  const posHeaders = [
    '=== Adjectif ===',
    '=== Nom commun ===',
    '=== Verbe ===',
    '=== Adverbe ===',
    '=== Interjection ===',
    '=== Préposition ===',
    '=== Pronom ==='
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for POS header
    const foundHeader = posHeaders.find(h => line.startsWith(h.replace(/=/g, '').trim()) || line.includes(h.replace(/=/g, '').trim()) || posHeaders.includes(line));
    if (foundHeader) {
      currentPos = foundHeader;
      console.log('Found header:', currentPos);
      continue;
    }

    if (currentPos) {
      // Skip headers
      if (line.startsWith('=')) continue;
      
      // Skip exact title match
      if (line.toLowerCase() === title.toLowerCase()) {
          console.log('Skipping exact title match:', line);
          continue;
      }
      
      // Skip pronunciation/grammar
      if (line.includes('\\') || line.includes('/')) {
          console.log('Skipping IPA:', line);
          continue;
      }
      if (line.toLowerCase().startsWith(title.toLowerCase()) && line.length < 100) {
          console.log('Skipping short start:', line);
          continue;
      }

      // Found a potential definition
      if (currentPos.includes('Nom commun')) {
        if (!nounDefinition) {
            nounDefinition = line;
            console.log('Found Noun Definition:', line);
        }
      } else {
        if (!otherDefinition) {
            otherDefinition = line;
            console.log('Found Other Definition:', line);
        }
      }
    }
  }

  console.log('Final Noun:', nounDefinition);
  console.log('Final Other:', otherDefinition);
}

testParsing();
