document.addEventListener('DOMContentLoaded', () => {
  // Navigation Defaults
  const tab4Cut = document.getElementById('tab-4cut');
  const tabBingo = document.getElementById('tab-bingo');
  const sec4Cut = document.getElementById('section-4cut');
  const secBingo = document.getElementById('section-bingo');
  const pageTitle = document.getElementById('page-title');
  const pageDesc = document.getElementById('page-desc');

  // Modal Nodes
  const modal = document.getElementById('app-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  const fileInput = document.getElementById('modal-file-input');
  
  // State
  let currentSelectionContext = null; // { type: '4cut'|'bingo', index: 0 }
  const bingoFruits = [
    "사랑", "희락", "화평", 
    "오래 참음", "자비", "양선", 
    "충성", "온유", "절제"
  ];
  let bingoState = [false, false, false, false, false, false, false, false, false];
  
  const colorData = {
    gold: { title: "노란색", text: "[노란색 성경적 의미]" },
    black: { title: "검은색", text: "[검은색 성경적 의미]" },
    red: { title: "빨간색", text: "[빨간색 성경적 의미]" },
    white: { title: "하얀색", text: "[하얀색 성경적 의미]" }
  };

  // 1. Navigation
  tab4Cut.addEventListener('click', (e) => {
    e.preventDefault();
    tab4Cut.classList.add('active');
    tabBingo.classList.remove('active');
    sec4Cut.classList.add('active');
    secBingo.classList.remove('active');
    
    pageTitle.textContent = "복음 네컷";
    pageDesc.textContent = "네 가지 색으로 담아내는 나의 복음 이야기";
  });

  tabBingo.addEventListener('click', (e) => {
    e.preventDefault();
    tabBingo.classList.add('active');
    tab4Cut.classList.remove('active');
    secBingo.classList.add('active');
    sec4Cut.classList.remove('active');
    
    pageTitle.textContent = "성령의 빙고";
    pageDesc.textContent = "내 삶에 맺히는 성령의 9가지 열매";
  });

  // 2. Initialize Bingo Grid
  const bingoGrid = document.getElementById('bingo-grid');
  bingoFruits.forEach((fruit, index) => {
    const item = document.createElement('div');
    item.className = 'bingo-item';
    item.dataset.index = index;
    
    const title = document.createElement('span');
    title.className = 'bingo-title';
    title.textContent = fruit;
    
    const img = document.createElement('img');
    img.className = 'bingo-image';
    img.id = `bingo-img-${index}`;
    img.src = '';
    img.alt = fruit;

    item.appendChild(title);
    item.appendChild(img);
    bingoGrid.appendChild(item);

    // Click event for Bingo Item
    item.addEventListener('click', () => {
      openModal({
        type: 'bingo',
        index: index,
        title: `${fruit}의 열매`,
        desc: `[${fruit} 열매의 성경적 의미]`
      });
    });
  });

  // 3. 4-Cut Clicks
  const fourCutItems = document.querySelectorAll('.four-cut-card');
  fourCutItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = item.dataset.index;
      const col = item.dataset.color;
      
      // Fallback texts
      let title = "색상 의미";
      let desc = "해당하는 내용을 입력해주세요.";
      if(colorData[col]) {
         title = colorData[col].title;
         desc = colorData[col].text;
      }

      openModal({
        type: '4cut',
        index: idx,
        title: title,
        desc: desc
      });
    });
  });

  // 4. Modal Logic
  function openModal(context) {
    currentSelectionContext = context;
    modalTitle.textContent = context.title;
    modalBody.textContent = context.desc;
    
    // Reset file input so same file can trigger change event again
    fileInput.value = '';
    
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    currentSelectionContext = null;
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    // strict check for background click
    if (e.target === modal) {
      closeModal();
    }
  });

  // 5. File Upload Handling
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use FileReader to get base64 string to display
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      
      if (currentSelectionContext.type === '4cut') {
        const imgEl = document.getElementById(`fc-img-${currentSelectionContext.index}`);
        imgEl.src = dataUrl;
        imgEl.classList.add('loaded');
      } 
      else if (currentSelectionContext.type === 'bingo') {
        const idx = currentSelectionContext.index;
        const imgEl = document.getElementById(`bingo-img-${idx}`);
        imgEl.src = dataUrl;
        imgEl.classList.add('loaded');
        
        // Update Bingo item completion style
        const itemEl = document.querySelector(`.bingo-item[data-index="${idx}"]`);
        itemEl.classList.add('completed');
        
        // Update Progress
        bingoState[idx] = true;
        updateBingoProgress();
      }
      
      // Auto close modal after selection
      closeModal();
    };
    reader.readAsDataURL(file);
  });

  function updateBingoProgress() {
    const completed = bingoState.filter(v => v).length;
    const pct = Math.floor((completed / 9) * 100);
    document.getElementById('bingo-progress-text').textContent = `${pct}%`;
    document.getElementById('bingo-progress-bar').style.width = `${pct}%`;
  }

  // 6. html2canvas Download Logic
  function downloadInnerElement(elementId, filename) {
    const captureEl = document.getElementById(elementId);
    if (!captureEl) return;
    
    // Slight delay or ensuring we capture cleanly
    html2canvas(captureEl, {
      scale: 2, // better quality
      useCORS: true,
      backgroundColor: '#fffcf7' // match design system background
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  document.getElementById('btn-save-4cut').addEventListener('click', () => {
    downloadInnerElement('capture-4cut', 'gospel-4cut.png');
  });

  document.getElementById('btn-save-bingo').addEventListener('click', () => {
    downloadInnerElement('capture-bingo', 'fruits-bingo.png');
  });

});
