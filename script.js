* { box-sizing: border-box; touch-action: none; margin: 0; padding: 0; }
body { background: #000; color: #fff; font-family: 'Orbitron', sans-serif; overflow: hidden; }

.screen { 
    position: absolute; inset: 0; z-index: 100; display: none; 
    flex-direction: column; align-items: center; justify-content: center; 
    background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); 
}
.screen.active { display: flex; }

.glow-text { font-size: 2.2rem; color: #00f2ff; text-shadow: 0 0 15px #00f2ff; margin-bottom: 20px; }

#level-grid { 
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; 
    padding: 20px; max-height: 60vh; overflow-y: auto; 
}

/* LEVEL BUTTONS FIX */
.lvl-btn { 
    width: 55px; height: 55px; border: 2px solid #444; border-radius: 10px; 
    display: flex; align-items: center; justify-content: center; 
    cursor: pointer; font-weight: bold; font-size: 18px; transition: 0.3s;
}
.lvl-btn.unlocked { 
    border-color: #00f2ff; color: #00f2ff; /* Neon Blue text */
    text-shadow: 0 0 5px #00f2ff; box-shadow: 0 0 10px rgba(0,242,255,0.2);
}
.lvl-btn.locked { 
    background: #1a1a1a; color: #555; border-color: #333; opacity: 0.6; 
}

#hud { position: absolute; top: 15px; width: 100%; display: flex; flex-direction: column; align-items: center; z-index: 50; pointer-events: none; }
.hud-top { display: flex; gap: 10px; margin-bottom: 5px; }
.stat { 
    background: rgba(0, 242, 255, 0.1); padding: 6px 14px; 
    border: 1px solid #00f2ff; border-radius: 20px; 
    font-size: 12px; color: #fff; font-weight: bold;
}

.bar-bg { width: 240px; height: 12px; background: #222; border-radius: 6px; margin-top: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.3); }
.bar-fill { height: 100%; width: 100%; transition: 0.3s; }
#hp-fill { background: linear-gradient(90deg, #ff0055, #ff5e00); }
#boss-fill { background: #ffea00; }

.pro-btn { margin-top: 25px; padding: 15px 40px; background: #00f2ff; border: none; font-family: 'Orbitron'; font-weight: bold; border-radius: 8px; cursor: pointer; color: #000; }
    
