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
  const modalImage = document.getElementById('modal-image');
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
    green: { 
      title: "초록색", 
      text: "'하나님이 세상을 창조하셨음을 의미합니다'\n\n하나님은 아름다운 세상을 창조하시고,\n우리를 하나님의 형상대로 만드셨습니다.\n우리는 하나님과 가까운 관계 속에서 살아가도록\n지음을 받았습니다.\n\n하나님이 자기 형상 곧 하나님의 형상대로\n사람을 창조하시되 남자와 여자를 창조하시고\n[창세기 1장 27절 말씀]" 
    },
    black: { 
      title: "검정색", 
      text: "'죄로 인해 하나님과의 관계가 끊어졌음을 의미합니다'\n\n사람이 하나님의 뜻을 거스르고 죄를 지음으로써\n하나님과 멀어지게 되었습니다.\n죄는 어둠이며, 그 결과는 죽음입니다.\n\n죄의 삯은 사망이라 [로마서 6장 23절 상반절 말씀]" 
    },
    red: { 
      title: "빨간색", 
      text: "'예수님의 보혈을 의미합니다'\n\n그럼에도 하나님은 우리를 여전히 사랑하셔서\n예수님을 이 땅에 보내주셨습니다.\n예수님은 십자가에서 우리 죄를 대신해 죽으시고,\n피를 흘리심으로 우리의 죄를 사해주셨습니다.\n\n\"하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니\n이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라\" [요한복음 3장 16절]" 
    },
    white: { 
      title: "하양색", 
      text: "'예수님의 부활과 우리가 얻게 되는 새 생명, 천국을 의미합니다'\n\n예수님은 죽음을 이기시고 다시 살아나셨습니다.\n예수님을 믿는 사람은 죄에서 깨끗해지고,\n새로운 생명, 즉 영생을 얻습니다.\n\n그 후에 살아남은 자도 저희와 함께 구름 속으로 끌어올려\n공중에서 주를 영접하게 하시리니 그리하여 우리가 항상 주와 함께\n있으리라 [데살로니가전서 4장 17절 말씀]" 
    }
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
      let imageSrc = null;
      if(colorData[col]) {
         title = colorData[col].title;
         desc = colorData[col].text;
         imageSrc = colorData[col].image;
      }

      openModal({
        type: '4cut',
        index: idx,
        title: title,
        desc: desc,
        image: imageSrc
      });
    });
  });

  // 4. Modal Logic
  function openModal(context) {
    currentSelectionContext = context;
    modalTitle.textContent = context.title;
    modalBody.textContent = context.desc;
    
    // Setup modal contents based on type
    if (context.type === 'frame-select') {
      // Hide normal file upload buttons
      document.getElementById('modal-actions').style.display = 'none';
      
      // Inject frame selection buttons into body
      modalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn-primary" id="select-frame-gntc" style="width:100%; border-radius:8px;">GNTC (흰바탕 로고)</button>
          <button class="btn-secondary" id="select-frame-sakura" style="width:100%; border-radius:8px; background-color:var(--sys-color-primary-container); color:white;">벚꽃 프레임</button>
          <button class="btn-secondary" id="select-frame-basic" style="width:100%; border-radius:8px;">기본 프레임 (투명)</button>
        </div>
      `;
      modalImage.style.display = 'none';
      modalBody.style.display = 'block';

      // Event listeners for frame selection
      const captureEl = document.getElementById('capture-4cut');
      
      const doCapture = (frameClass) => {
        closeModal();
        if(frameClass) captureEl.classList.add(frameClass);
        
        // slight delay to allow CSS transition/render
        setTimeout(() => {
          html2canvas(captureEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
          }).then(canvas => {
            if(frameClass) captureEl.classList.remove(frameClass);
            const link = document.createElement('a');
            link.download = 'gospel-4cut.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          });
        }, 100);
      };

      document.getElementById('select-frame-gntc').onclick = () => doCapture('frame-gntc-white');
      document.getElementById('select-frame-sakura').onclick = () => doCapture('frame-sakura-bg');
      document.getElementById('select-frame-basic').onclick = () => doCapture('');

    } else {
      document.getElementById('modal-actions').style.display = 'flex';
      
      if (context.image) {
        modalImage.src = context.image;
        modalImage.style.display = 'block';
        modalBody.style.display = 'none'; // text hidden
      } else {
        modalImage.style.display = 'none';
        modalBody.innerText = context.desc;
        modalBody.style.display = 'block';
      }
    }
    
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
    
    // HTML2Canvas bug where external images might fail without proxy/CORS. We assume the image loads fine here.
    html2canvas(captureEl, {
      scale: 2, // better quality
      useCORS: true,
      backgroundColor: null // allow CSS background image (theme-sakura) to be captured
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  document.getElementById('btn-save-4cut').addEventListener('click', () => {
    openModal({
      type: 'frame-select',
      title: '사진 저장하기',
      desc: ''
    });
  });

  document.getElementById('btn-save-bingo').addEventListener('click', () => {
    downloadInnerElement('capture-bingo', 'fruits-bingo.png');
  });

});
