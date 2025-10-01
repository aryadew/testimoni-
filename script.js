// --- Data Awal (Sama seperti sebelumnya, 9 data) ---
// PERHATIAN: Semua tanggal menggunakan format DD/MM/YYYY
const testimoniData = [
    {
        id: 1,
        description: "REKBER 81 INC ", 
        keterangan: "07/09/2025", 
        image_tf: "bukti tf/TF_1.jpg",
        image_done: "bukti done/DN_1.jpg",
        thumbnail_img: "thumbnail/tumb_1.png"
    },
];
// --- Variabel DOM ---
const testimoniGrid = document.getElementById('testimoni-grid');
const modal = document.getElementById('testimoni-modal');
const closeBtn = document.querySelector('.close-btn');
const modalDesc = document.getElementById('modal-desc');
const modalImgTf = document.getElementById('modal-img-tf');
const modalImgDone = document.getElementById('modal-img-done');
const noResultsMessage = document.getElementById('no-results');

// BARU: Variabel Error Placeholder
const errorTf = document.getElementById('error-tf');
const errorDone = document.getElementById('error-done');


// --- Variabel Kontrol ---
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sortSelect = document.getElementById('sort-select');

// --- Variabel Slider Modal ---
const slider = document.getElementById('modal-image-slider');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsContainer = document.getElementById('slider-dots'); 
const totalSlides = 2; 
let currentSlide = 1;

// --- Variabel Paginasi ---
const testimoniPerPage = 6; 
let currentPage = 1;
const paginationControls = document.getElementById('pagination-controls');


// ==========================================================
// 1. FUNGSI UTAMA UNTUK FILTER, SORT, DAN RENDER
// ==========================================================

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day); 
}

function getFilteredAndSortedData() {
    let filteredData = [...testimoniData];
    const searchTerm = searchInput.value.toLowerCase().trim();
    const sortValue = sortSelect.value;

    // --- FILTER (Pencarian) ---
    if (searchTerm) {
        filteredData = filteredData.filter(data => 
            data.description.toLowerCase().includes(searchTerm) || 
            data.keterangan.includes(searchTerm)
        );
    }

    // --- SORT (Penyortiran) ---
    switch (sortValue) {
        case 'newest':
            filteredData.sort((a, b) => parseDate(b.keterangan) - parseDate(a.keterangan));
            break;
        case 'oldest':
            filteredData.sort((a, b) => parseDate(a.keterangan) - parseDate(b.keterangan));
            break;
        case 'desc_asc':
            filteredData.sort((a, b) => a.description.localeCompare(b.description));
            break;
        case 'desc_desc':
            filteredData.sort((a, b) => b.description.localeCompare(a.description));
            break;
    }

    return filteredData;
}

function getTestimoniForPage(page) {
    const data = getFilteredAndSortedData();
    const startIndex = (page - 1) * testimoniPerPage;
    const endIndex = startIndex + testimoniPerPage;
    return data.slice(startIndex, endIndex);
}

function renderTestimoni(page = 1) {
    const allData = getFilteredAndSortedData();
    const dataToRender = getTestimoniForPage(page);
    
    testimoniGrid.innerHTML = '';
    currentPage = page; 

    if (allData.length === 0) {
        noResultsMessage.style.display = 'block';
        paginationControls.innerHTML = '';
        return; 
    }
    
    noResultsMessage.style.display = 'none';

    dataToRender.forEach(data => {
        const card = createTestimoniCard(data);
        testimoniGrid.appendChild(card);
    });

    renderPaginationControls(allData.length);
    
    testimoniGrid.scrollIntoView({ behavior: 'smooth' });
}

function renderPaginationControls(totalItems) {
    paginationControls.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / testimoniPerPage);
    const maxVisibleButtons = 5; 
    
    if (totalPages <= 1) return;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    const createButton = (page, text = page) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('page-btn');
        
        if (page === currentPage) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => {
            renderTestimoni(page); 
        });
        return button;
    };

    if (startPage > 1) {
        paginationControls.appendChild(createButton(1));
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.classList.add('ellipsis');
            paginationControls.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationControls.appendChild(createButton(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.classList.add('ellipsis');
            paginationControls.appendChild(ellipsis);
        }
        paginationControls.appendChild(createButton(totalPages));
    }
}


// ==========================================================
// 2. FUNGSI MODAL, LAZY LOADING, DAN ERROR HANDLING BARU
// ==========================================================

function createTestimoniCard(data) {
    const card = document.createElement('div');
    card.classList.add('testimoni-card');
    card.setAttribute('data-id', data.id);

    card.innerHTML = `
        <div class="testimoni-image-placeholder">
            <img src="${data.thumbnail_img}" alt="Testimoni Thumbnail">
            <div class="click-overlay">
                <span class="click-icon">&#128269;</span> 
                <p class="click-text">KLIK UNTUK LIHAT</p>
            </div>
        </div>
        <p class="testimoni-desc">${data.description}</p>
        <p class="testimoni-keterangan">${data.keterangan || ''}</p> 
    `;

    card.addEventListener('click', () => {
        showModal(data);
    });

    return card;
}


// Fungsi untuk mereset tampilan error placeholder
function resetErrorPlaceholders() {
    modalImgTf.style.display = 'block';
    modalImgDone.style.display = 'block';
    errorTf.style.display = 'none';
    errorDone.style.display = 'none';
}

// BARU: Fungsi untuk menangani pemuatan gambar dan error
function loadModalImage(imgElement, errorElement, dataSrc) {
    // Sembunyikan error placeholder
    errorElement.style.display = 'none';
    // Tampilkan gambar
    imgElement.style.display = 'block';
    
    // Set src, yang akan memicu pemuatan (Lazy Loading)
    imgElement.src = dataSrc;

    // Tambahkan listener untuk menangani error
    imgElement.onerror = () => {
        imgElement.style.display = 'none';
        errorElement.style.display = 'flex'; // Tampilkan error placeholder
        console.error(`Gagal memuat gambar: ${dataSrc}`);
    };
}


// Fungsi Modal (DIUBAH untuk Lazy Loading dan Error Handling)
function showModal(data) {
    modalDesc.textContent = data.description;
    
    // 1. Reset error dan set data-src untuk Lazy Loading
    resetErrorPlaceholders();
    modalImgTf.setAttribute('data-src', data.image_tf);
    modalImgDone.setAttribute('data-src', data.image_done);

    // 2. Load gambar pertama (bukti transfer)
    loadModalImage(modalImgTf, errorTf, data.image_tf);
    
    // 3. Load gambar kedua (bukti done) agar siap saat digeser
    loadModalImage(modalImgDone, errorDone, data.image_done);
    
    initModalSlider(); 

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    
    // DEEP LINKING (Tambahkan ID ke URL)
    history.pushState(null, '', `?t=${data.id}`);
}

function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
    
    // DEEP LINKING (Hapus ID dari URL saat modal ditutup)
    const url = new URL(window.location);
    url.searchParams.delete('t');
    history.pushState(null, '', url.search);
}


// BARU: Fungsi checkUrlForModal DIUBAH untuk validasi ID
function checkUrlForModal() {
    const params = new URLSearchParams(window.location.search);
    const testimoniId = params.get('t');
    
    if (testimoniId) {
        const id = parseInt(testimoniId);
        const data = testimoniData.find(t => t.id === id);
        
        if (data) {
            showModal(data);
            return true;
        } else {
            // BARU: Jika ID tidak valid, hapus dari URL (URL Validation Fallback)
            const url = new URL(window.location);
            url.searchParams.delete('t');
            history.replaceState(null, '', url.search);
            return false;
        }
    }
    return false;
}


// ==========================================================
// 3. FUNGSI SLIDER MODAL (Tetap)
// ==========================================================

function showSlide(n) {
    if (n > totalSlides) {
        currentSlide = 1; 
    }
    if (n < 1) {
        currentSlide = totalSlides; 
    }
    
    const offset = (currentSlide - 1) * 50; 
    slider.style.transform = `translateX(-${offset}%)`;

    prevBtn.disabled = (currentSlide === 1);
    nextBtn.disabled = (currentSlide === totalSlides);
    
    updateDots();
}

function navigateModal(direction) {
    currentSlide += direction; 
    showSlide(currentSlide);
}

function updateDots() {
    const dots = dotsContainer.querySelectorAll('.slide-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index + 1 === currentSlide) {
            dot.classList.add('active');
        }
    });
}

function createDots() {
    dotsContainer.innerHTML = ''; 
    for (let i = 1; i <= totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('slide-dot');
        dot.setAttribute('data-slide', i);
        dot.addEventListener('click', () => {
            currentSlide = i;
            showSlide(currentSlide);
        });
        dotsContainer.appendChild(dot);
    }
}

function initModalSlider() {
    currentSlide = 1; 
    createDots(); 
    showSlide(currentSlide);
}


// ==========================================================
// 4. EVENT LISTENERS
// ==========================================================

// Event Modal
closeBtn.addEventListener('click', hideModal);
prevBtn.addEventListener('click', () => navigateModal(-1));
nextBtn.addEventListener('click', () => navigateModal(1));

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        hideModal();
    }
});

// Event Deep Linking (Menutup modal saat tombol 'back' browser diklik)
window.addEventListener('popstate', () => {
    // Jika tidak ada ID di URL, modal akan disembunyikan
    checkUrlForModal();
});


// Event Search & Sort
searchButton.addEventListener('click', () => renderTestimoni(1));
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        renderTestimoni(1);
    }
});
sortSelect.addEventListener('change', () => renderTestimoni(1));


// --- Inisialisasi ---
if (!checkUrlForModal()) {
    renderTestimoni(currentPage);
}
