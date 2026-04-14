window.Visuals = {
    promoteZ: function(actorId, targetId) {
        if (!GameState.baseZ[actorId]) GameState.baseZ[actorId] = 100;
        if (!GameState.baseZ[targetId]) GameState.baseZ[targetId] = 100;
        
        if (GameState.baseZ[actorId] <= GameState.baseZ[targetId]) {
            GameState.baseZ[actorId] = GameState.baseZ[targetId] + 1;
        }
    },

    createCursorElement: function(id, isLocal = false) {
        const color = Assets.getColorFromId(id);
        const el = document.createElement('div');
        el.className = 'cursor-entity';
        const spriteId = isLocal ? 'sprite-local' : 'sprite-' + id;
        
        if (!isLocal && GameState.peers[id]) {
            GameState.peers[id].currentShape = Assets.PATH_POINTER;
        }

        el.innerHTML = `
            <div class="cursor-sprite-wrapper" id="${spriteId}">
                <svg class="cursor-icon facing-left" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
                    <path d="${Assets.PATH_POINTER}" stroke="black" stroke-width="1" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="cursor-label" style="top: 25px; left: 15px; color: ${color};">${isLocal ? 'YOU' : id.substring(0, 5)}</div>
        `;
        document.getElementById('cursor-container').appendChild(el);
        return el;
    },

    setHandShape: function(id, shapePath) {
        if (id === GameState.myId) {
            if (GameState.localShape === shapePath) return;
            GameState.localShape = shapePath;
        } else {
            if (GameState.peers[id] && GameState.peers[id].currentShape === shapePath) return;
            if (GameState.peers[id]) GameState.peers[id].currentShape = shapePath;
        }
        
        const spriteId = id === GameState.myId ? 'sprite-local' : 'sprite-' + id;
        const el = document.getElementById(spriteId);
        if (el) {
            const pathEl = el.querySelector('path');
            if (pathEl) pathEl.setAttribute('d', shapePath);
        }
    },

    playAnim: function(spriteEl, animClass) {
        if (!spriteEl) return;
        spriteEl.classList.remove('anim-hf-initiator', 'anim-hf-target', 'anim-slap-strike', 'anim-slap-receive', 'anim-click-down', 'anim-click-up');
        void spriteEl.offsetWidth; 
        spriteEl.classList.add(animClass);
    },

    showImpactStar: function(x, y) {
        const star = document.createElement('div');
        star.className = 'impact-star';
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        // Force the star to the deepest background layer behind cursors (z: 10 vs cursors z: 1000+)
        star.style.zIndex = '10'; 
        star.innerHTML = `<svg viewBox="0 0 100 100" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg"><path d="M50 0L61 35H98L68 57L79 92L50 70L21 92L32 57L2 35H39L50 0Z" /></svg>`;
        document.getElementById('cursor-container').appendChild(star);
        setTimeout(() => star.remove(), 600);
    },

    executeEmptyClickDown: function(id) {
        const el = document.getElementById(id === GameState.myId ? 'sprite-local' : 'sprite-' + id);
        this.playAnim(el, 'anim-click-down');
        this.setHandShape(id, Assets.PATH_SINGLE_POINTER);
        AudioEngine.playClickSound(true);
    },

    executeEmptyClickUp: function(id) {
        const el = document.getElementById(id === GameState.myId ? 'sprite-local' : 'sprite-' + id);
        this.playAnim(el, 'anim-click-up');
        this.setHandShape(id, Assets.PATH_POINTER);
        AudioEngine.playClickSound(false);
    },

    executeSlapVisuals: function(slapperId, slappedId) {
        const now = Date.now();
        let comboInfo = GameState.slapCombos[slapperId] || { count: 0, lastTime: 0 };
        if (now - comboInfo.lastTime <= 500) comboInfo.count++; else comboInfo.count = 1;
        comboInfo.lastTime = now; GameState.slapCombos[slapperId] = comboInfo;
        
        GameState.hfCombos[slapperId] = { count: 0 }; 
        GameState.hfCombos[slappedId] = { count: 0 };

        this.promoteZ(slapperId, slappedId);

        // BUG FIX: The element fetched by ID is already the wrapper. Removed the nested querySelector.
        const slapperEl = document.getElementById(slapperId === GameState.myId ? 'sprite-local' : 'sprite-' + slapperId);
        const slappedEl = document.getElementById(slappedId === GameState.myId ? 'sprite-local' : 'sprite-' + slappedId);
        
        this.playAnim(slapperEl, 'anim-slap-strike');
        this.playAnim(slappedEl, 'anim-slap-receive');
        
        this.setHandShape(slapperId, Assets.PATH_SLAP_STRIKE);
        setTimeout(() => this.setHandShape(slapperId, Assets.PATH_POINTER), 300);
        
        setTimeout(() => this.setHandShape(slappedId, Assets.PATH_JAZZ_HAND), 150);
        setTimeout(() => this.setHandShape(slappedId, Assets.PATH_POINTER), 400);
        
        AudioEngine.playSlapSound();

        const pX = slappedId === GameState.myId ? GameState.localPos.x : GameState.peers[slappedId].renderX;
        const pY = slappedId === GameState.myId ? GameState.localPos.y : GameState.peers[slappedId].renderY;
        
        const textEl = document.createElement('div');
        const angle = (Math.random() - 0.5) * Math.PI; 
        const dist = Math.random() * 40 + 30;
        textEl.style.setProperty('--dx', `${Math.sin(angle) * dist}px`);
        textEl.style.setProperty('--dy', `${-Math.cos(angle) * dist - 20}px`);

        let comboColor = Assets.getComboColor(comboInfo.count);

        if (comboInfo.count >= 1000) {
            textEl.className = 'absolute text-2xl md:text-3xl font-black italic select-none pointer-events-none drop-shadow-2xl';
            textEl.style.backgroundImage = 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
            textEl.style.webkitBackgroundClip = 'text';
            textEl.style.color = 'transparent';
            textEl.style.animation = 'slapTextAnim 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, rainbowText 0.5s linear infinite';
            textEl.innerText = 'SLAPAFICATION!!!!';
        } else {
            textEl.className = 'absolute text-lg font-black italic select-none pointer-events-none drop-shadow-md';
            textEl.innerText = comboInfo.count > 1 ? `SLAP! x${comboInfo.count}` : 'SLAP!';
            textEl.style.color = comboColor;
            textEl.style.textShadow = '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000';
            textEl.style.animation = 'slapTextAnim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }

        textEl.style.left = pX + 'px'; textEl.style.top = pY + 'px';
        textEl.style.zIndex = 10000;
        document.body.appendChild(textEl);
        setTimeout(() => textEl.remove(), 800);
    },

    executeHighFiveVisuals: function(initiatorId, targetId, diff) {
        let comboInfo = GameState.hfCombos[initiatorId] || { count: 0 };
        comboInfo.count++;
        GameState.hfCombos[initiatorId] = comboInfo;

        const grade = Assets.getGrade(diff);
        
        // BUG FIX: Removed nested querySelector here too.
        const spriteInit = document.getElementById(initiatorId === GameState.myId ? 'sprite-local' : 'sprite-' + initiatorId);
        const spriteTarg = document.getElementById(targetId === GameState.myId ? 'sprite-local' : 'sprite-' + targetId);

        let pos1 = initiatorId === GameState.myId ? GameState.localPos : { x: GameState.peers[initiatorId].renderX, y: GameState.peers[initiatorId].renderY };
        let pos2 = targetId === GameState.myId ? GameState.localPos : { x: GameState.peers[targetId].renderX, y: GameState.peers[targetId].renderY };
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;

        if (initiatorId === GameState.myId) { GameState.localPos.x = midX; GameState.localPos.y = midY; }
        else if (GameState.peers[initiatorId]) { GameState.peers[initiatorId].renderX = midX; GameState.peers[initiatorId].renderY = midY; }
        if (targetId === GameState.myId) { GameState.localPos.x = midX; GameState.localPos.y = midY; }
        else if (GameState.peers[targetId]) { GameState.peers[targetId].renderX = midX; GameState.peers[targetId].renderY = midY; }

        this.playAnim(spriteInit, 'anim-hf-initiator');
        this.playAnim(spriteTarg, 'anim-hf-target');
        
        this.setHandShape(initiatorId, Assets.PATH_HIGHFIVE);
        this.setHandShape(targetId, Assets.PATH_HIGHFIVE);
        setTimeout(() => {
            this.setHandShape(initiatorId, Assets.PATH_POINTER);
            this.setHandShape(targetId, Assets.PATH_POINTER);
        }, 300);

        AudioEngine.playHighFiveSound(grade.name.toLowerCase(), comboInfo.count);
        
        if (grade.name === 'PERFECT' || grade.name === 'SOLID') {
            this.showImpactStar(midX, midY); // Will reliably spawn behind cursors
        }

        const scoreEl = document.createElement('div');
        const angle = (Math.random() - 0.5) * Math.PI; 
        const dist = Math.random() * 40 + 30;
        scoreEl.style.setProperty('--dx', `${Math.sin(angle) * dist}px`);
        scoreEl.style.setProperty('--dy', `${-Math.cos(angle) * dist - 60}px`);

        scoreEl.className = 'absolute flex flex-col items-center justify-center select-none pointer-events-none drop-shadow-md';
        scoreEl.style.left = midX + 'px';
        scoreEl.style.top = midY + 'px';
        scoreEl.style.zIndex = 10000;
        
        const rot = (Math.random() * 10 - 5) + 'deg';
        let comboColor = Assets.getComboColor(comboInfo.count);

        if (comboInfo.count >= 1000) {
            scoreEl.style.animation = 'slapTextAnim 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, rainbowText 0.5s linear infinite';
            scoreEl.innerHTML = `
                <div class="flex flex-col items-center justify-center" style="transform: rotate(${rot});">
                    <div style="color: ${grade.color}; font-weight: 900; font-style: italic; font-size: 14px; text-shadow: 2px 2px 0 #000;">${grade.text}</div>
                    <div style="background-image: linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); -webkit-background-clip: text; color: transparent; font-weight: 900; font-style: italic; font-size: 24px; text-shadow: 2px 2px 0 rgba(0,0,0,0.5); line-height: 0.9;">
                        HIGHFIVIFICATION!!!!
                    </div>
                </div>
            `;
        } else {
            scoreEl.style.animation = 'slapTextAnim 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
            scoreEl.innerHTML = `
                <div class="flex flex-col items-center justify-center" style="transform: rotate(${rot});">
                    <div style="color: ${grade.color}; font-weight: 900; font-style: italic; font-size: 14px; text-shadow: 2px 2px 0 #000;">${grade.text}</div>
                    <div style="color: ${comboColor}; font-weight: 900; font-style: italic; font-size: 20px; text-shadow: 3px 3px 0 #000; line-height: 0.9;">HIGH-FIVE!${comboInfo.count > 1 ? ' x'+comboInfo.count : ''}</div>
                </div>
            `;
        }
        document.body.appendChild(scoreEl);
        setTimeout(() => scoreEl.remove(), 800);
    }
};