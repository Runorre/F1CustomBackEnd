function gapTime(t1, t2) {
    // Convertit "M.S.SSS" en millisecondes
    function toMs(t) {
      const parts = t.split('.');
      if (parts.length !== 3) {
        throw new Error(`Format invalide : '${t}' (attendu M.S.SSS)`);
      }
      const [min, sec, ms] = parts.map(Number);
      return min * 60000 + sec * 1000 + ms;
    }
  
    const ms1 = toMs(t1);
    const ms2 = toMs(t2);
    const diff = Math.abs(ms1 - ms2);
  
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const milliseconds = diff % 1000;
  
    // Formatage avec zéros à gauche
    const secStr = String(seconds).padStart(2, '0');
    const msStr  = String(milliseconds).padStart(3, '0');
  
    return `${minutes}.${secStr}.${msStr}`;
  }
  
  // Exemples
  console.log(gapTime("1.34.154", "0.00.000")); // "0.48.254"
  console.log(gapTime("2.00.000", "2.00.001")); // "0.00.001"