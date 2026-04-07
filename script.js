const teamsData = [
    { id: 'team-0', name: '면류관 지역', sub: 'CROWN TEAM', icon: '👑' },
    { id: 'team-1', name: '하나님의 어린양 & 새가족', sub: 'LAMB & NEWCOMER', icon: '🐑' },
    { id: 'team-2', name: '섬기는 지역', sub: 'SERVING TEAM', icon: '🙌' },
    { id: 'team-3', name: '여호와이레 지역', sub: 'JEHOVAH JIREH', icon: '☀️' }
];

const teamListEl = document.getElementById('teamList');
const dropZones = document.querySelectorAll('.drop-zone');
const mainBtn = document.getElementById('mainBtn');
const canvas = document.getElementById('ladderCanvas');
const ctx = canvas.getContext('2d');
const snacksCards = document.querySelectorAll('.snack-card');
const snackCovers = document.querySelectorAll('.snack-cover');
const ladderBlind = document.getElementById('ladderBlind');

// Modal Elements
const resultModal = document.getElementById('resultModal');
const resultTeamLabel = document.getElementById('resultTeam');
const resultSnackLabel = document.getElementById('resultSnack');

let rungs = [];
let colWidth = 0;
let rowHeight = 0;
const rowCount = 20; 
const colCount = 4;
let isAnimating = false;
let colorPalettes = ['#ffcf24', '#f82662', '#209bf6', '#1a1a1a']; 

// State Tracking
let currentTurnIndex = 0; 
let isGameStarted = false; 

// Initialize Teams
function initTeams() {
    teamListEl.innerHTML = '';
    teamsData.forEach((team, idx) => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.draggable = true;
        card.id = `team-card-${idx}`;
        card.dataset.index = idx;
        
        card.innerHTML = `
            <div class="team-icon">${team.icon}</div>
            <div class="team-info">
                <span class="team-name">${team.name}</span>
                <span class="team-sub">${team.sub}</span>
            </div>
        `;
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        teamListEl.appendChild(card);
    });
}

function resetGameBaseState() {
    isGameStarted = false;
    currentTurnIndex = 0;
    isAnimating = false;
    
    ladderBlind.classList.remove('hidden');

    document.querySelectorAll('.team-card').forEach(card => {
        teamListEl.appendChild(card);
        card.draggable = true;
        card.style.boxShadow = '';
        card.style.transform = '';
        card.style.zIndex = '';
    });
    
    dropZones.forEach(z => {
        z.innerHTML = 'DROP HERE';
        z.classList.remove('filled');
    });

    snacksCards.forEach(card => card.classList.remove('highlight'));
    snackCovers.forEach(cover => cover.classList.remove('revealed'));
    
    generateLadder();
    drawLadder();
    
    checkAllDropped();
}

// Drag & Drop
let draggedItem = null;

function handleDragStart() {
    if(isGameStarted) return; 
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    checkAllDropped();
}

dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => {
        if(isGameStarted) return;
        e.preventDefault();
        if(zone.childElementCount === 0 || zone.contains(draggedItem) || zone.innerText === "DROP HERE") {
            zone.classList.add('drag-over');
        }
    });
    
    zone.addEventListener('dragleave', () => {
        if(isGameStarted) return;
        zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', function(e) {
        if(isGameStarted) return;
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedItem) {
            const existingCard = this.querySelector('.team-card');
            if (existingCard && existingCard !== draggedItem) {
                teamListEl.appendChild(existingCard);
            }
            if (!this.querySelector('.team-card')) {
                this.innerHTML = ''; 
            }
            this.appendChild(draggedItem);
            this.classList.add('filled');
        }
    });
});

teamListEl.addEventListener('dragover', e => e.preventDefault());
teamListEl.addEventListener('drop', function(e) {
    if(isGameStarted) return;
    if (draggedItem) {
        this.appendChild(draggedItem);
        checkAllDropped();
    }
});

function checkAllDropped() {
    dropZones.forEach(z => {
        if (!z.querySelector('.team-card')) {
            z.classList.remove('filled');
            z.innerHTML = 'DROP HERE';
        } else {
            z.classList.add('filled');
        }
    });

    let allFilled = Array.from(dropZones).every(zone => zone.classList.contains('filled'));
    
    if (allFilled) {
        mainBtn.disabled = false;
        mainBtn.innerText = "▶ 게임 시작하기!";
        mainBtn.style.background = 'var(--gn-blue)';
    } else {
        mainBtn.disabled = true;
        mainBtn.innerText = "팀을 모두 배치해주세요";
        mainBtn.style.background = '';
    }
}

// Canvas Ladder Logic
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    colWidth = rect.width / colCount;
    rowHeight = (rect.height - 40) / (rowCount + 1);
}

function generateLadder() {
    rungs = [];
    for (let i = 0; i < rowCount; i++) {
        const cols = [0, 1, 2].sort(() => Math.random() - 0.5);
        for (let j of cols) {
            if (Math.random() < 0.6) {
                const hasAdj = rungs.some(r => r.row === i && Math.abs(r.col - j) <= 1);
                if (!hasAdj) {
                    rungs.push({ col: j, row: i, y: 20 + (i + 1) * rowHeight });
                }
            }
        }
    }
}

function drawLadder() {
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    ctx.clearRect(0, 0, w, h);
    
    ctx.strokeStyle = '#6eb2f8'; 
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    for (let i = 0; i < colCount; i++) {
        const x = (i + 0.5) * colWidth;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    ctx.stroke();

    ctx.beginPath();
    rungs.forEach(rung => {
        const x1 = (rung.col + 0.5) * colWidth;
        const x2 = (rung.col + 1.5) * colWidth;
        ctx.moveTo(x1, rung.y);
        ctx.lineTo(x2, rung.y);
    });
    ctx.stroke();
}

async function handleMainAction() {
    if (isAnimating) return;

    if (!isGameStarted) {
        isGameStarted = true;
        currentTurnIndex = 0;
        document.querySelectorAll('.team-card').forEach(c => c.draggable = false);
        ladderBlind.classList.add('hidden'); // 게임 시작과 동시에 사다리 공개
    }

    if (currentTurnIndex < colCount) {
        await playTurn(currentTurnIndex);
        currentTurnIndex++;
        
        if (currentTurnIndex < colCount) {
            const nextCard = dropZones[currentTurnIndex].querySelector('.team-card');
            const nextName = nextCard.querySelector('.team-name').innerText;
            mainBtn.innerText = `▶ ${nextName} 진행하기`;
        } else {
            mainBtn.innerText = "🔄 다시 하기 (리셋)";
            mainBtn.style.background = 'var(--text-main)'; 
        }
    } else {
        resetGameBaseState();
    }
}

async function playTurn(colIndex) {
    isAnimating = true;
    mainBtn.disabled = true;
    mainBtn.innerText = "사다리 타는 중... 🏃‍♂️";

    const teamCard = dropZones[colIndex].querySelector('.team-card');
    const teamName = teamCard.querySelector('.team-name').innerText;
    const teamIcon = teamCard.querySelector('.team-icon').innerText;
    
    const pathColor = colorPalettes[colIndex % colorPalettes.length];
    
    teamCard.style.boxShadow = `0 10px 25px ${pathColor}`;
    teamCard.style.transform = 'translate(-50%, -50%) scale(1.1)';
    teamCard.style.zIndex = '50';
    
    const destCol = await tracePath(colIndex, pathColor);
    
    const snackCard = snacksCards[destCol];
    const snackName = snackCard.querySelector('.snack-name').innerText;
    const snackIcon = snackCard.querySelector('.snack-icon').innerText;
    
    snackCard.classList.add('highlight');
    
    await showResultModal(teamIcon, teamName, snackIcon, snackName, pathColor);
    
    const cover = snackCard.querySelector('.snack-cover');
    cover.classList.add('revealed');

    const snackRect = snackCard.getBoundingClientRect();
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { 
            x: (snackRect.left + snackRect.width / 2) / window.innerWidth,
            y: 0.8
        },
        colors: [pathColor, '#ffffff', '#238cfb']
    });

    teamCard.style.boxShadow = '';
    teamCard.style.transform = '';
    teamCard.style.zIndex = '';

    mainBtn.disabled = false;
    isAnimating = false;
}

function showResultModal(tIcon, tName, sIcon, sName, color) {
    return new Promise(resolve => {
        resultTeamLabel.innerText = `${tIcon} ${tName}`;
        resultSnackLabel.innerText = `${sIcon} ${sName} 당첨!`;
        resultSnackLabel.style.color = color;
        resultSnackLabel.style.textShadow = `0 4px 10px ${color}40`; 
        
        resultModal.classList.remove('hidden');

        // 버그 픽스: DOM에서 새로 찾아 이벤트를 등록함으로써 이벤트 핸들러 유실을 방지합니다.
        const closeBtn = document.getElementById('modalCloseBtn');
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        
        newBtn.addEventListener('click', () => {
            resultModal.classList.add('hidden');
            resolve();
        });
    });
}

function tracePath(startCol, color) {
    return new Promise(async (resolve) => {
        let currentCol = startCol;
        let currentY = 0;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 10; 
        
        let sortedRungs = [...rungs].sort((a,b) => a.y - b.y);

        for (const rung of sortedRungs) {
            if (rung.col === currentCol || rung.col === currentCol - 1) {
                await animateLine((currentCol + 0.5) * colWidth, currentY, (currentCol + 0.5) * colWidth, rung.y);
                currentY = rung.y;
                
                const nextCol = (rung.col === currentCol) ? currentCol + 1 : currentCol - 1;
                await animateLine((currentCol + 0.5) * colWidth, currentY, (nextCol + 0.5) * colWidth, currentY);
                currentCol = nextCol;
            }
        }
        
        const h = canvas.height / 2;
        await animateLine((currentCol + 0.5) * colWidth, currentY, (currentCol + 0.5) * colWidth, h);
        
        resolve(currentCol);
    });
}

function animateLine(sx, sy, ex, ey) {
    return new Promise(resolve => {
        let startTime = null;
        // 속도 0.6배 감속 (기존 65 -> 110으로 늘림)
        const duration = 110;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (ex - sx) * progress, sy + (ey - sy) * progress);
            ctx.stroke();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

window.addEventListener('resize', () => {
    if(!isGameStarted) {
        resizeCanvas();
        drawLadder();
    }
});

mainBtn.addEventListener('click', handleMainAction);

initTeams();
resizeCanvas(); 
generateLadder();
drawLadder();
