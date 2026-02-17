const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let unlockedLvl = parseInt(localStorage.getItem('neonStrikeGod')) || 1;
let currentLvl = 1, isPlaying = false, score = 0, hp = 100, timer = 0, combo = 1;
let player = { x: canvas.width/2, y: canvas.height-100, shield: false, triple: false, magnet: false };
let enemies = [], bullets = [], pUps = [], stars = [], particles = [], boss = null;
let gameClock = null;

for(let i=0; i<100; i++) stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, s: Math.random()*2+1});

function initMenu() {
    const grid = document.getElementById("level-grid");
    grid.innerHTML = "";
    for(let i=1; i<=50; i++) {
        const d = document.createElement("div");
        d.className = `lvl-btn ${i <= unlockedLvl ? 'unlocked' : 'locked'}`;
        d.innerText = i;
        d.onclick = () => {
            if(i <= unlockedLvl) {
                startGame(i);
            } else {
                const lockMsg = document.getElementById("lock-msg");
                lockMsg.innerText = "Pehle pichle level complete karo! 🔒🤬";
                setTimeout(() => lockMsg.innerText = "", 2000);
            }
        };
        grid.appendChild(d);
    }
}

function startGame(n) {
    currentLvl = n; isPlaying = true;
    document.getElementById("menu-screen").classList.remove("active");
    
    // Timer Logic
    if(n <= 10) timer = 120;
    else if(n <= 20) timer = 240;
    else if(n <= 30) timer = 360;
    else if(n <= 40) timer = 480;
    else timer = 600;

    if(gameClock) clearInterval(gameClock);
    gameClock = setInterval(() => {
        if(isPlaying) {
            timer--;
            let m = Math.floor(timer/60), s = Math.floor(timer%60);
            document.getElementById("timer-txt").innerText = `${m}:${s < 10 ? '0'+s : s}`;
            if(timer <= 0 && !boss) stopGame(true);
        }
    }, 1000);

    resetGame();
    if(n % 10 === 0) spawnBoss();
    requestAnimationFrame(update);
}

function resetGame() {
    score = 0; hp = 100; combo = 1;
    enemies = []; bullets = []; pUps = []; particles = []; boss = null;
    player.shield = player.triple = player.magnet = false;
    document.getElementById("hp-fill").style.width = "100%";
    document.getElementById("score-txt").innerText = "0";
    document.getElementById("combo-txt").innerText = "1";
    document.getElementById("lvl-txt").innerText = currentLvl;
    document.getElementById("boss-ui").style.display = "none";
}

function spawnBoss() {
    boss = { x: canvas.width/2, y: -100, hp: 200 * (currentLvl/10), maxHp: 200 * (currentLvl/10), dir: 1 };
    document.getElementById("boss-ui").style.display = "block";
}

window.addEventListener("touchmove", (e) => {
    if(!isPlaying) return;
    player.x = e.touches[0].clientX;
    player.y = e.touches[0].clientY - 80;
});

function createExplosion(x, y, color) {
    for(let i=0; i<15; i++) {
        particles.push({x, y, vx:(Math.random()-0.5)*10, vy:(Math.random()-0.5)*10, l:25, c:color});
    }
}

function update() {
    if(!isPlaying) return;
    ctx.fillStyle = "#000"; ctx.fillRect(0,0,canvas.width, canvas.height);

    stars.forEach(s => {
        s.y += s.s; if(s.y > canvas.height) s.y = 0;
        ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillRect(s.x, s.y, 1.2, 1.2);
    });

    ctx.shadowBlur = player.shield ? 30 : 15;
    ctx.shadowColor = player.shield ? "#ffea00" : "#00f2ff";
    ctx.strokeStyle = ctx.shadowColor; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(player.x, player.y-25); ctx.lineTo(player.x-22, player.y+15); ctx.lineTo(player.x+22, player.y+15); ctx.closePath(); ctx.stroke();
    if(player.shield) { ctx.beginPath(); ctx.arc(player.x, player.y, 45, 0, Math.PI*2); ctx.stroke(); }

    if(Date.now() % 150 < 20) {
        bullets.push({x: player.x, y: player.y-20, vx: 0});
        if(player.triple) { bullets.push({x: player.x, y: player.y-20, vx: -2}, {x: player.x, y: player.y-20, vx: 2}); }
    }

    // Dynamic Enemy Scaling
    let spawnChance = 0.012 + (currentLvl * 0.001); 
    if(Math.random() < spawnChance) {
        enemies.push({x: Math.random()*canvas.width, y: -50, s: 2.5 + (currentLvl * 0.08)});
    }

    enemies.forEach((e, i) => {
        e.y += e.s;
        ctx.strokeStyle = "#ff0055"; ctx.strokeRect(e.x-15, e.y-15, 30, 30);
        bullets.forEach((b, bi) => {
            if(Math.hypot(e.x-b.x, e.y-b.y) < 30) {
                createExplosion(e.x, e.y, "#00f2ff");
                enemies.splice(i, 1); bullets.splice(bi, 1);
                score += 10 * combo; combo++;
                document.getElementById("score-txt").innerText = score;
                document.getElementById("combo-txt").innerText = combo;
            }
        });
        if(Math.hypot(e.x-player.x, e.y-player.y) < 40) {
            enemies.splice(i, 1);
            if(!player.shield) {
                hp -= 20; combo = 1;
                document.getElementById("hp-fill").style.width = hp + "%";
                if(hp <= 0) stopGame(false);
            }
        }
    });

    if(boss) {
        boss.y = Math.min(boss.y + 1, 100); boss.x += boss.dir * 2.5;
        if(boss.x > canvas.width-60 || boss.x < 60) boss.dir *= -1;
        ctx.fillStyle = "#ff0055"; ctx.fillRect(boss.x-60, boss.y-40, 120, 80);
        document.getElementById("boss-fill").style.width = (boss.hp/boss.maxHp*100) + "%";
        bullets.forEach((b, bi) => {
            if(b.x > boss.x-60 && b.x < boss.x+60 && b.y > boss.y-40 && b.y < boss.y+40) {
                boss.hp -= 1; bullets.splice(bi, 1);
                if(boss.hp <= 0) {
                    createExplosion(boss.x, boss.y, "#ffea00");
                    boss = null; score += 2000;
                    document.getElementById("boss-ui").style.display = "none";
                }
            }
        });
    }

    pUps.forEach((p, i) => {
        p.y += 2.5;
        if(player.magnet && Math.hypot(p.x-player.x, p.y-player.y) < 300) {
            p.x += (player.x - p.x) * 0.15; p.y += (player.y - p.y) * 0.15;
        }
        ctx.font = "24px Arial"; ctx.fillText(p.t, p.x-12, p.y);
        if(Math.hypot(p.x-player.x, p.y-player.y) < 45) {
            if(p.t === '🛡️') { player.shield = true; setTimeout(()=>player.shield=false, 8000); }
            if(p.t === '🔫') { player.triple = true; setTimeout(()=>player.triple=false, 10000); }
            if(p.t === '🧲') { player.magnet = true; setTimeout(()=>player.magnet=false, 12000); }
            pUps.splice(i, 1);
        }
    });

    particles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.l--; ctx.fillStyle=p.c; ctx.fillRect(p.x, p.y, 2, 2); if(p.l<=0) particles.splice(i,1); });
    bullets.forEach((b, i) => { b.y -= 12; b.x += b.vx; ctx.fillStyle="#fff"; ctx.fillRect(b.x-2, b.y, 4, 15); if(b.y < 0) bullets.splice(i,1); });

    requestAnimationFrame(update);
}

function stopGame(win) {
    isPlaying = false; clearInterval(gameClock);
    if(win) {
        if(currentLvl === unlockedLvl) { unlockedLvl++; localStorage.setItem('neonStrikeGod', unlockedLvl); }
        document.getElementById("win-screen").classList.add("active");
    } else {
        document.getElementById("fail-screen").classList.add("active");
    }
}

setInterval(() => {
    if(isPlaying) {
        const items = ['🛡️', '🔫', '🧲'];
        pUps.push({x: Math.random()*canvas.width, y: -50, t: items[Math.floor(Math.random()*items.length)]});
    }
}, 10000);

initMenu();
