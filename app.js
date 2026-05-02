const TYPES = [
    { id: 'none', name: 'なし' },
    { id: 'normal', name: 'ノーマル' },
    { id: 'fire', name: 'ほのお' },
    { id: 'water', name: 'みず' },
    { id: 'electric', name: 'でんき' },
    { id: 'grass', name: 'くさ' },
    { id: 'ice', name: 'こおり' },
    { id: 'fighting', name: 'かくとう' },
    { id: 'poison', name: 'どく' },
    { id: 'ground', name: 'じめん' },
    { id: 'flying', name: 'ひこう' },
    { id: 'psychic', name: 'エスパー' },
    { id: 'bug', name: 'むし' },
    { id: 'rock', name: 'いわ' },
    { id: 'ghost', name: 'ゴースト' },
    { id: 'dragon', name: 'ドラゴン' },
    { id: 'dark', name: 'あく' },
    { id: 'steel', name: 'はがね' },
    { id: 'fairy', name: 'フェアリー' }
];

const TYPE_CHART = {
    normal: {rock: 0.5, ghost: 0, steel: 0.5},
    fire: {fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2},
    water: {fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5},
    electric: {water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5},
    grass: {fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5},
    ice: {fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5},
    fighting: {normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5},
    poison: {grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2},
    ground: {fire: 2, water: 1, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2},
    flying: {electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5},
    psychic: {fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5},
    bug: {fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5},
    rock: {fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5},
    ghost: {normal: 0, psychic: 2, ghost: 2, dark: 0.5},
    dragon: {dragon: 2, steel: 0.5, fairy: 0},
    dark: {fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5},
    steel: {fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2},
    fairy: {fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5}
};

const TYPE_COLORS = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#4578D4',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#C59963',
    flying: '#8CB1F3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#D1C06E',
    ghost: '#6050A0',
    dragon: '#25448C',
    dark: '#523E30',
    steel: '#B7B7CE',
    fairy: '#D685AD',
    none: 'transparent'
};

const DEFAULT_POKEMON = {
    name: "未設定",
    isMega: false,
    type1: "normal",
    type2: "none",
    base: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
    ev: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    nature: { plus: 'none', minus: 'none' }
};

let party = Array(6).fill(null).map(() => JSON.parse(JSON.stringify(DEFAULT_POKEMON)));
let editingIndex = -1;

function init() {
    initCustomDropdown('opp-pokemon');
    initCustomDropdown('opp-move');

    const saved = localStorage.getItem('champions_party');
    if (saved) {
        try {
            party = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load party", e);
        }
    }

    populateSelects();
    setupTabs();
    setupModal();
    setupCalcEvents();
    renderParty();
    renderDamage();
}

function saveParty() {
    localStorage.setItem('champions_party', JSON.stringify(party));
}

function populateSelects() {
    const pokeOptions = POKEMON_DB.map((p, idx) => {
        const typeIconsHtml = `<span class="type-icon" style="background-color: ${getTypeColor(p.type1)}"></span>` +
                              (p.type2 !== 'none' ? `<span class="type-icon" style="background-color: ${getTypeColor(p.type2)}"></span>` : '');
        return {
            value: idx,
            html: `${typeIconsHtml} ${p.name}`
        };
    });
    updateCustomDropdown('opp-pokemon', pokeOptions, "", true);
    updateOpponentMoves();
}

function updateOpponentMoves() {
    const hiddenInput = document.getElementById('opp-pokemon');
    const abilitySelect = document.getElementById('opp-ability');
    const idx = hiddenInput.value;
    
    if (idx === "" || !POKEMON_DB[idx]) {
        updateCustomDropdown('opp-move', []);
        return;
    }
    
    const p = POKEMON_DB[idx];
    
    let moveOptions = [];
    if (p.moves) {
        moveOptions = p.moves.map(moveId => {
            const m = MOVES_DB[moveId];
            if (m) {
                const icon = `<span class="type-icon" style="background-color: ${getTypeColor(m.type)}"></span>`;
                return {
                    value: moveId,
                    html: `${icon} ${m.name} <span style="font-size: 0.8em; opacity: 0.7; margin-left: 8px;">(${getTypeName(m.type)}・威力${m.power})</span>`
                };
            }
            return null;
        }).filter(x => x !== null);
    }
    updateCustomDropdown('opp-move', moveOptions);

    if (abilitySelect) {
        abilitySelect.innerHTML = '<option value="none">特性なし・該当なし</option>';
        if (p.abilities && p.abilities.length > 0) {
            p.abilities.forEach((ab, abIdx) => {
                const option = document.createElement('option');
                option.value = abIdx;
                option.textContent = ab.name;
                abilitySelect.appendChild(option);
            });
        }
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
            
            if (tab.dataset.target === 'calc-tab') {
                renderDamage();
            }
        });
    });
}

function setupModal() {
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('save-pokemon').addEventListener('click', savePokemonEdit);
}

function setupCalcEvents() {
    document.getElementById('opp-pokemon').addEventListener('change', () => {
        updateOpponentMoves();
        renderDamage();
    });
    ['opp-build', 'opp-move', 'opp-modifier', 'opp-rank', 'opp-ability'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderDamage);
    });
}

function getTypeName(id) {
    const t = TYPES.find(t => t.id === id);
    return t ? t.name : '';
}

function getTypeColor(id) {
    return TYPE_COLORS[id] || '#fff';
}

function calculateStat(base, points, natureMult, isHp) {
    points = Math.min(32, Math.max(0, points)); 
    if (isHp) return base + 75 + points;
    return Math.floor((base + 20 + points) * natureMult);
}

function getTypeEffectiveness(moveType, defType1, defType2) {
    if (moveType === 'none') return 1;
    let effect = 1;
    const matchups = TYPE_CHART[moveType] || {};
    if (defType1 !== 'none') {
        effect *= (matchups[defType1] !== undefined ? matchups[defType1] : 1);
    }
    if (defType2 !== 'none') {
        effect *= (matchups[defType2] !== undefined ? matchups[defType2] : 1);
    }
    return effect;
}

function renderParty() {
    const list = document.getElementById('party-list');
    list.innerHTML = '';

    party.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'party-item';
        
        const typeStr = p.type2 !== 'none' ? `${getTypeName(p.type1)} / ${getTypeName(p.type2)}` : getTypeName(p.type1);
        
        const hp = calculateStat(p.base.hp, p.ev.hp, 1, true);
        const defNature = p.nature.plus === 'def' ? 1.1 : (p.nature.minus === 'def' ? 0.9 : 1);
        const spdNature = p.nature.plus === 'spd' ? 1.1 : (p.nature.minus === 'spd' ? 0.9 : 1);
        const def = calculateStat(p.base.def, p.ev.def, defNature, false);
        const spd = calculateStat(p.base.spd, p.ev.spd, spdNature, false);

        const typeIconsHtml = `<span class="type-icon" style="background-color: ${getTypeColor(p.type1)}"></span>` +
                              (p.type2 !== 'none' ? `<span class="type-icon" style="background-color: ${getTypeColor(p.type2)}"></span>` : '');

        item.innerHTML = `
            <div class="poke-info">
                <h3>${typeIconsHtml} ${p.name} ${p.isMega ? '<span class="mega-badge">MEGA</span>' : ''}</h3>
                <div class="poke-meta">
                    <span>${typeStr}</span>
                    <span>HP:${hp}</span>
                    <span>防:${def}</span>
                    <span>特防:${spd}</span>
                </div>
            </div>
            <button class="btn btn-primary" onclick="openModal(${index})">編集</button>
        `;
        list.appendChild(item);
    });
}

function renderDamage() {
    const results = document.getElementById('damage-results');
    results.innerHTML = '';

    const oppPokeIdx = document.getElementById('opp-pokemon').value;
    const oppMoveId = document.getElementById('opp-move').value;
    
    if (oppPokeIdx === "" || oppMoveId === "") return;

    const oppPokemon = POKEMON_DB[oppPokeIdx];
    const oppMove = MOVES_DB[oppMoveId];
    if (!oppPokemon || !oppMove) return;

    const oppBuild = document.getElementById('opp-build').value;
    const oppMod = parseFloat(document.getElementById('opp-modifier').value);

    // Rank Calc
    const rankSelect = document.getElementById('opp-rank');
    const rankStage = rankSelect ? parseInt(rankSelect.value) : 0;
    let rankMult = 1.0;
    if (rankStage > 0) {
        rankMult = (rankStage + 2) / 2;
    } else if (rankStage < 0) {
        rankMult = 2 / (Math.abs(rankStage) + 2);
    }

    // Opponent Stats Calc
    let oppPoints = 0;
    let oppNature = 1.0;
    if (oppBuild === 'max_plus') { oppPoints = 32; oppNature = 1.1; }
    else if (oppBuild === 'max') { oppPoints = 32; oppNature = 1.0; }
    else if (oppBuild === 'min') { oppPoints = 0; oppNature = 0.9; }
    
    const isPhysical = oppMove.category === 'physical';
    const oppBaseStat = isPhysical ? oppPokemon.base.atk : oppPokemon.base.spa;
    let oppActualStat = calculateStat(oppBaseStat, oppPoints, oppNature, false);
    oppActualStat = Math.floor(oppActualStat * rankMult);

    // STAB logic
    let stab = 1.0;
    if (oppMove.type === oppPokemon.type1 || oppMove.type === oppPokemon.type2) {
        stab = 1.5;
    }

    // Ability multiplier
    const abilitySelect = document.getElementById('opp-ability');
    const abilityIdx = abilitySelect ? abilitySelect.value : "none";
    let abilityMult = 1.0;
    
    if (abilityIdx !== "none" && oppPokemon.abilities && oppPokemon.abilities[abilityIdx]) {
        const ab = oppPokemon.abilities[abilityIdx];
        const cond = ab.condition;
        
        let applyAbility = false;
        if (cond === 'contact' && oppMove.isContact) applyAbility = true;
        if (cond === 'fire' && oppMove.type === 'fire') applyAbility = true;
        if (cond === 'recoil' && oppMove.isRecoil) applyAbility = true;
        if (cond === 'sand_force' && ['rock', 'ground', 'steel'].includes(oppMove.type)) applyAbility = true;
        if (cond === 'normal_to_fairy' && oppMove.type === 'normal') applyAbility = true;
        
        if (applyAbility) {
            abilityMult = ab.multiplier;
        }
    }

    party.forEach(p => {
        const hp = calculateStat(p.base.hp, p.ev.hp, 1, true);
        const defNature = p.nature.plus === 'def' ? 1.1 : (p.nature.minus === 'def' ? 0.9 : 1);
        const spdNature = p.nature.plus === 'spd' ? 1.1 : (p.nature.minus === 'spd' ? 0.9 : 1);
        
        const defStat = isPhysical 
            ? calculateStat(p.base.def, p.ev.def, defNature, false)
            : calculateStat(p.base.spd, p.ev.spd, spdNature, false);

        // Damage formula
        const level = 50;
        const baseDamage = Math.floor(Math.floor(Math.floor(level * 2 / 5 + 2) * oppMove.power * oppActualStat / defStat) / 50) + 2;
        
        const typeEffect = getTypeEffectiveness(oppMove.type, p.type1, p.type2);
        
        let minDamage = Math.floor(baseDamage * 0.85);
        minDamage = Math.floor(minDamage * stab);
        minDamage = Math.floor(minDamage * typeEffect);
        minDamage = Math.floor(minDamage * oppMod);
        minDamage = Math.floor(minDamage * abilityMult);

        let maxDamage = Math.floor(baseDamage * 1.0);
        maxDamage = Math.floor(maxDamage * stab);
        maxDamage = Math.floor(maxDamage * typeEffect);
        maxDamage = Math.floor(maxDamage * oppMod);
        maxDamage = Math.floor(maxDamage * abilityMult);

        const minPct = (minDamage / hp * 100).toFixed(1);
        const maxPct = (maxDamage / hp * 100).toFixed(1);
        const avgPct = ((parseFloat(minPct) + parseFloat(maxPct)) / 2).toFixed(1);

        let effectText = '等倍';
        let effectClass = 'type-effective';
        if (typeEffect > 1) { effectText = '効果ばつぐん'; effectClass = 'type-super'; }
        else if (typeEffect < 1 && typeEffect > 0) { effectText = '効果いまひとつ'; effectClass = 'type-not'; }
        else if (typeEffect === 0) { effectText = '効果なし'; effectClass = 'type-immune'; }

        // Determine bar color
        const pctNum = parseFloat(maxPct);
        let barColor = 'var(--success)';
        if (pctNum >= 100) barColor = 'var(--danger)';
        else if (pctNum >= 50) barColor = 'var(--warning)';

        const cappedPct = Math.min(pctNum, 100);

        const typeIconsHtml = `<span class="type-icon" style="background-color: ${getTypeColor(p.type1)}"></span>` +
                              (p.type2 !== 'none' ? `<span class="type-icon" style="background-color: ${getTypeColor(p.type2)}"></span>` : '');

        const item = document.createElement('div');
        item.className = 'damage-item';
        item.innerHTML = `
            <div class="damage-header">
                <span class="damage-name">${typeIconsHtml} ${p.name} ${p.isMega ? '<span class="mega-badge">MEGA</span>' : ''}</span>
                <span class="damage-value">${minPct}% ~ ${maxPct}%</span>
            </div>
            <div class="damage-bar-bg">
                <div class="damage-bar-fill" style="width: ${cappedPct}%; background: ${barColor}"></div>
            </div>
            <div class="damage-details">
                <span>HP: ${hp} (乱数: ${minDamage} ~ ${maxDamage})</span>
                <span class="type-effectiveness ${effectClass}">${effectText} (x${typeEffect})</span>
            </div>
        `;
        results.appendChild(item);
    });
}

function openModal(index) {
    editingIndex = index;
    const p = party[index];
    
    const typeOptions = TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    const html = `
        <div class="form-group">
            <label>データベースから読み込む</label>
            <div class="custom-dropdown" id="dropdown-edit-db-select">
                <div class="dropdown-header" id="header-edit-db-select">
                    <span class="dropdown-text" id="text-edit-db-select">-- 選択して自動入力 --</span>
                    <span class="dropdown-arrow">▼</span>
                </div>
                <div class="dropdown-list" id="list-edit-db-select"></div>
            </div>
            <input type="hidden" id="edit-db-select" value="">
        </div>
        <div class="form-group">
            <label>ポケモン名</label>
            <input type="text" id="edit-name" class="form-control" value="${p.name}">
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" id="edit-mega" ${p.isMega ? 'checked' : ''}> メガシンカ
            </label>
        </div>
        <div class="stat-grid">
            <div class="form-group">
                <label>タイプ1</label>
                <select id="edit-type1" class="form-control">${typeOptions}</select>
            </div>
            <div class="form-group">
                <label>タイプ2</label>
                <select id="edit-type2" class="form-control">${typeOptions}</select>
            </div>
        </div>
        
        <div class="form-group">
            <label>性格補正 (1.1倍 / 0.9倍)</label>
            <div class="stat-grid">
                <select id="edit-nature-plus" class="form-control">
                    <option value="none">上昇補正なし</option>
                    <option value="atk">攻撃 (↑)</option>
                    <option value="def">防御 (↑)</option>
                    <option value="spa">特攻 (↑)</option>
                    <option value="spd">特防 (↑)</option>
                    <option value="spe">素早さ (↑)</option>
                </select>
                <select id="edit-nature-minus" class="form-control">
                    <option value="none">下降補正なし</option>
                    <option value="atk">攻撃 (↓)</option>
                    <option value="def">防御 (↓)</option>
                    <option value="spa">特攻 (↓)</option>
                    <option value="spd">特防 (↓)</option>
                    <option value="spe">素早さ (↓)</option>
                </select>
            </div>
        </div>

        <div class="stat-row">
            <div class="stat-header"><span>HP</span> <span>種族値 / 能力ポイント</span></div>
            <div class="stat-inputs">
                <input type="number" id="edit-base-hp" value="${p.base.hp}" min="1" max="255">
                <input type="number" id="edit-ev-hp" value="${p.ev.hp}" min="0" max="32">
            </div>
        </div>
        <div class="stat-row" style="margin-top: 0.5rem;">
            <div class="stat-header"><span>防御</span> <span>種族値 / 能力ポイント</span></div>
            <div class="stat-inputs">
                <input type="number" id="edit-base-def" value="${p.base.def}" min="1" max="255">
                <input type="number" id="edit-ev-def" value="${p.ev.def}" min="0" max="32">
            </div>
        </div>
        <div class="stat-row" style="margin-top: 0.5rem;">
            <div class="stat-header"><span>特防</span> <span>種族値 / 能力ポイント</span></div>
            <div class="stat-inputs">
                <input type="number" id="edit-base-spd" value="${p.base.spd}" min="1" max="255">
                <input type="number" id="edit-ev-spd" value="${p.ev.spd}" min="0" max="32">
            </div>
        </div>
    `;

    document.getElementById('modal-body-content').innerHTML = html;
    
    initCustomDropdown('edit-db-select');
    const dbOptions = [{value: "", html: "-- 選択して自動入力 --"}].concat(
        POKEMON_DB.map((poke, idx) => {
            const icons = `<span class="type-icon" style="background-color: ${getTypeColor(poke.type1)}"></span>` +
                          (poke.type2 !== 'none' ? `<span class="type-icon" style="background-color: ${getTypeColor(poke.type2)}"></span>` : '');
            return {
                value: idx,
                html: `${icons} ${poke.name}`
            };
        })
    );
    updateCustomDropdown('edit-db-select', dbOptions, "", true);
    
    document.getElementById('edit-db-select').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === "") return;
        const dbPoke = POKEMON_DB[val];
        document.getElementById('edit-name').value = dbPoke.name;
        document.getElementById('edit-type1').value = dbPoke.type1;
        document.getElementById('edit-type2').value = dbPoke.type2;
        document.getElementById('edit-base-hp').value = dbPoke.base.hp;
        document.getElementById('edit-base-def').value = dbPoke.base.def;
        document.getElementById('edit-base-spd').value = dbPoke.base.spd;
    });

    document.getElementById('edit-type1').value = p.type1;
    document.getElementById('edit-type2').value = p.type2;
    document.getElementById('edit-nature-plus').value = p.nature.plus;
    document.getElementById('edit-nature-minus').value = p.nature.minus;

    document.getElementById('edit-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
    editingIndex = -1;
}

function savePokemonEdit() {
    if (editingIndex === -1) return;

    const p = party[editingIndex];
    p.name = document.getElementById('edit-name').value || "未設定";
    p.isMega = document.getElementById('edit-mega').checked;
    p.type1 = document.getElementById('edit-type1').value;
    p.type2 = document.getElementById('edit-type2').value;
    p.nature.plus = document.getElementById('edit-nature-plus').value;
    p.nature.minus = document.getElementById('edit-nature-minus').value;

    p.base.hp = parseInt(document.getElementById('edit-base-hp').value) || 100;
    p.base.def = parseInt(document.getElementById('edit-base-def').value) || 100;
    p.base.spd = parseInt(document.getElementById('edit-base-spd').value) || 100;

    p.ev.hp = parseInt(document.getElementById('edit-ev-hp').value) || 0;
    p.ev.def = parseInt(document.getElementById('edit-ev-def').value) || 0;
    p.ev.spd = parseInt(document.getElementById('edit-ev-spd').value) || 0;

    saveParty();
    renderParty();
    if (document.getElementById('calc-tab').classList.contains('active')) {
        renderDamage();
    }
    closeModal();
}

function initCustomDropdown(id) {
    const container = document.getElementById(`dropdown-${id}`);
    const header = document.getElementById(`header-${id}`);
    if (!container || !header) return;

    header.addEventListener('click', (e) => {
        // Close other open dropdowns
        document.querySelectorAll('.custom-dropdown.open').forEach(el => {
            if (el !== container) el.classList.remove('open');
        });
        container.classList.toggle('open');
        
        if (container.classList.contains('open')) {
            const searchInput = container.querySelector('.dropdown-search-input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 50);
            }
        }
        
        e.stopPropagation();
    });
}

function updateCustomDropdown(id, options, defaultVal = "", enableSearch = false) {
    const list = document.getElementById(`list-${id}`);
    const textSpan = document.getElementById(`text-${id}`);
    const hiddenInput = document.getElementById(id);
    const container = document.getElementById(`dropdown-${id}`);
    
    if (!list || !textSpan || !hiddenInput) return;

    list.innerHTML = '';
    
    if (options.length === 0) {
        textSpan.innerHTML = '-- 選択肢なし --';
        hiddenInput.value = "";
        return;
    }

    let isDefaultSet = false;
    const itemElements = [];

    if (enableSearch) {
        const searchWrap = document.createElement('div');
        searchWrap.style.padding = '8px';
        searchWrap.style.borderBottom = '1px solid var(--card-border)';
        searchWrap.style.position = 'sticky';
        searchWrap.style.top = '0';
        searchWrap.style.backgroundColor = 'var(--bg-color)';
        searchWrap.style.zIndex = '1';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control dropdown-search-input';
        searchInput.placeholder = '名前で検索...';
        searchInput.style.width = '100%';
        searchInput.style.boxSizing = 'border-box';
        
        searchInput.addEventListener('click', e => e.stopPropagation());
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.replace(/[\u3041-\u3096]/g, function(match) {
                return String.fromCharCode(match.charCodeAt(0) + 0x60);
            }).toLowerCase();
            
            itemElements.forEach(item => {
                if (item.textContent.toLowerCase().includes(term)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        searchWrap.appendChild(searchInput);
        list.appendChild(searchWrap);
    }

    options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = opt.html;
        item.dataset.value = opt.value;

        item.addEventListener('click', (e) => {
            textSpan.innerHTML = opt.html;
            hiddenInput.value = opt.value;
            container.classList.remove('open');
            // Trigger change event
            const event = new Event('change');
            hiddenInput.dispatchEvent(event);
            e.stopPropagation();
        });

        list.appendChild(item);
        itemElements.push(item);

        if (defaultVal !== "" && String(opt.value) === String(defaultVal)) {
            textSpan.innerHTML = opt.html;
            hiddenInput.value = opt.value;
            isDefaultSet = true;
        }
    });

    if (!isDefaultSet) {
        textSpan.innerHTML = options[0] ? options[0].html : '-- 選択してください --';
        hiddenInput.value = options[0] ? options[0].value : "";
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown.open').forEach(el => {
        el.classList.remove('open');
    });
});

document.addEventListener('DOMContentLoaded', init);

