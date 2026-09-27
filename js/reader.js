(() => {
  "use strict";

  const qs = new URLSearchParams(location.search);
  const file = qs.get("file") || "";
  const title = qs.get("title") || "Presentation";

  const titleEl = document.getElementById("deckTitle");
  const loading = document.getElementById("loading");
  const stage = document.getElementById("slideStage");
  const img = document.getElementById("slideImage");
  const office = document.getElementById("officeFrame");
  const counter = document.getElementById("counter");
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const prevControl = document.getElementById("prevControl");
  const nextControl = document.getElementById("nextControl");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const help = document.getElementById("help");

  titleEl.textContent = title;
  document.title = `Read — ${title}`;

  // Prevent normal copy/save/context-menu gestures on the reader page.
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("selectstart", e => e.preventDefault());
  document.addEventListener("dragstart", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ["c","u","s","p","a"].includes(k)) e.preventDefault();
    if (e.key === "F12") e.preventDefault();
  }, true);

  // Escape HTML-like input by allowing only a PPT path already supplied by the site.
  const safeFile = file.replace(/^\/+/, "");
  const absFile = new URL(safeFile, location.href).href;

  // If slide images exist in assets/slides, use them. This provides the cleanest
  // read-only experience. Otherwise fall back to Microsoft Office's online viewer.
  const folderCandidates = {
    "Principles_of_Management.pptx": "PoM1.1",
    "Principles_of_Management_Part2.pptx": "PoM1.2",
    "Principles_of_Management_Part3.pptx": "PoM1.3",
    "Principles_of_Management_Part4.pptx": "PoM2.1",
    "Principles_of_Management_Part5.pptx": "PoM3.1",
    "Module_IV_Staffing_and_Leadership.pptx": "PoM4",
    "Module_V_Motivation_and_Controlling.pptx": "PoM5"
  };

  const fileName = safeFile.split("/").pop();
  const folder = folderCandidates[fileName];

  let slideNo = 1;
  let imageMode = false;
  let imageProbeStopped = false;

  function showReady() {
    loading.hidden = true;
    stage.hidden = false;
  }

  function setImage(n) {
    const src = `assets/slides/${folder}/slide-${n}.png`;
    img.onload = () => {
      imageMode = true;
      slideNo = n;
      counter.textContent = `${n}`;
      img.hidden = false;
      office.hidden = true;
      showReady();
      prev.disabled = n <= 1;
      prevControl.disabled = n <= 1;
      // Probe next slide without showing a broken image.
      const probe = new Image();
      probe.onload = () => { next.disabled = false; nextControl.disabled = false; };
      probe.onerror = () => { next.disabled = true; nextControl.disabled = true; };
      probe.src = `assets/slides/${folder}/slide-${n + 1}.png`;
    };
    img.onerror = () => {
      if (n === 1 && !imageMode && !imageProbeStopped) {
        imageProbeStopped = true;
        useOfficeViewer();
      } else {
        next.disabled = true; nextControl.disabled = true;
      }
    };
    img.src = src;
  }

  function useOfficeViewer() {
    imageMode = false;
    img.hidden = true;
    office.hidden = false;
    office.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absFile)}`;
    counter.textContent = "Online reader";
    prev.hidden = true;
    next.hidden = true;
    prevControl.hidden = true;
    nextControl.hidden = true;
    help.textContent = "Presentation opened in the online reader. Use its built-in controls to move through the slides.";
    showReady();
  }

  function go(delta) {
    if (!imageMode) return;
    const target = slideNo + delta;
    if (target < 1) return;
    setImage(target);
  }

  prev.onclick = () => go(-1);
  next.onclick = () => go(1);
  prevControl.onclick = () => go(-1);
  nextControl.onclick = () => go(1);

  fullscreenBtn.onclick = async () => {
    const target = document.querySelector(".viewer-shell");
    try {
      if (!document.fullscreenElement) await target.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
  };

  let touchX = null;
  stage.addEventListener("touchstart", e => {
    touchX = e.changedTouches[0].clientX;
  }, {passive:true});
  stage.addEventListener("touchend", e => {
    if (touchX === null || !imageMode) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchX = null;
  }, {passive:true});

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  if (!file) {
    loading.textContent = "No presentation was selected.";
    return;
  }

  if (folder) setImage(1);
  else useOfficeViewer();
})();
