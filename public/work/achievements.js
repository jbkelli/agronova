// ================================================
// ACHIEVEMENTS GALLERY - HYBRID (Hardcoded + Firestore)
// ================================================

// Hardcoded achievements (your original images)
const HARDCODED_ACHIEVEMENTS = [
    { imageUrl: '/images/Blowing machine.jpg', caption: 'Blowing machine' },
    { imageUrl: '/images/BT cotton seed.JPG', caption: 'BT cotton seed' },
    { imageUrl: '/images/Cotton stuffed in sacks after harvesting.JPG', caption: 'Cotton stuffed in sacks after harvesting' },
    { imageUrl: '/images/Display of tailoring items made by the trainees.jpg', caption: 'Display of tailoring items made by the trainees' },
    { imageUrl: '/images/Display of Vikoys .jpg', caption: 'Display of Vikoys' },
    { imageUrl: '/images/Fabricated yarn spinning machine .jpg', caption: 'Fabricated yarn spinning machine' },
    { imageUrl: '/images/Farmer ginning own cotton .jpg', caption: 'Farmer ginning own cotton' },
    { imageUrl: '/images/Farmers in mwea during a financial literacy and marketing training.jpg', caption: 'Farmers in mwea during a financial literacy and marketing training' },
    { imageUrl: '/images/Farmers using the portable micro gin in the cotton farm.JPG', caption: 'Farmers using the portable micro gin in the cotton farm' },
    { imageUrl: '/images/Hand carding machines .jpg', caption: 'Hand carding machines' },
    { imageUrl: '/images/Hand spinning machine.jpg', caption: 'Hand spinning machine' },
    { imageUrl: '/images/Hand woven door mat in the small handloom.jpg', caption: 'Hand woven door mat in the small handloom' },
    { imageUrl: '/images/Jubilation during gin delivery to the farmers in Mbeere .jpg', caption: 'Jubilation during gin delivery to the farmers in Mbeere' },
    { imageUrl: '/images/Micro gin development process at the workshop 1.jpg', caption: 'Micro gin development process at the workshop' },
    { imageUrl: '/images/Packet of cotton seeds after ginning.jpg', caption: 'Packet of cotton seeds after ginning' },
    { imageUrl: '/images/Photo of researchers in focus discussion group with farmers during the baseline survey in mwea.JPG', caption: 'Photo of researchers in focus discussion group with farmers during the baseline survey in Mwea' },
    { imageUrl: '/images/Photo of researchers with farmers during the baseline survey Mbeere, embu 2.JPG', caption: 'Photo of researchers with farmers during the baseline survey Mbeere, Embu' },
    { imageUrl: '/images/Photo of researchers with farmers during the baseline survey mwea 3.JPG', caption: 'Photo of researchers with farmers during the baseline survey Mwea' },
    { imageUrl: '/images/Photo of researchers with farmers during the baseline survey mwea.JPG', caption: 'Photo of researchers with farmers during the baseline survey Mwea' },
    { imageUrl: '/images/Photo of researchers with farmers during the baseline survey.JPG', caption: 'Photo of researchers with farmers during the baseline survey Mwea' },
    { imageUrl: '/images/Photo of the arid cotton growing area in Cianthia Mbeere 3.JPG', caption: 'Photo of the arid cotton growing area in Cianthia Mbeere' },
    { imageUrl: '/images/Prototype 1 testing process.jpg', caption: 'Prototype 1 testing process' },
    { imageUrl: '/images/Prototype 2 fabrication.jpg', caption: 'Prototype 2 fabrication' },
    { imageUrl: '../images/prototype fabrication process in the workshop.jpg', caption: 'prototype fabrication process in the workshop' },
    { imageUrl: '/images/Researchers harvesting cotton during the research .jpg', caption: 'Researchers harvesting cotton during the research' },
    { imageUrl: '/images/researchers in a cotton farm with one of teh cotton farmer in Mwea.JPG', caption: 'researchers in a cotton farm with one of the cotton farmer in Mwea' },
    { imageUrl: '/images/Small handloom for mats making.jpg', caption: 'Small handloom for mats making' },
    { imageUrl: '/images/Spooling machine.jpg', caption: 'Spooling machine' },
    { imageUrl: '/images/Trainees ina a weaving session.jpg', caption: 'Trainees ina a weaving session' },
    { imageUrl: '/images/Warping machine .jpg', caption: 'Warping machine' }
];

document.addEventListener('DOMContentLoaded', async function() {
    const galleryContainer = document.getElementById('galleryContainer');
    
    if(!galleryContainer) {
        console.error('Gallery container not found');
        return;
    }

    let allAchievements = [...HARDCODED_ACHIEVEMENTS]; // Start with hardcoded images

    try {
        // Try to fetch additional achievements from Firestore (v8 syntax)
        const snapshot = await firebase.firestore().collection('achievements').orderBy('date', 'desc').get();

        if(!snapshot.empty) {
            // Add Firestore achievements to the beginning (newest first)
            const firestoreAchievements = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                firestoreAchievements.push({
                    imageUrl: data.imageUrl,
                    caption: data.caption
                });
            });
            allAchievements = [...firestoreAchievements, ...HARDCODED_ACHIEVEMENTS];
        }

    } catch(error) {
        console.warn('Could not load achievements from Firestore, using hardcoded images only:', error);
        // Continue with hardcoded achievements only
    }

    // Clear container
    galleryContainer.innerHTML = '';

    // Create gallery pages with 8 items per page
    const itemsPerPage = 8;
    let currentPage = [];
    let pageCount = 0;

    allAchievements.forEach((achievement, index) => {
        const workItem = document.createElement('div');
        workItem.className = 'work';
        workItem.innerHTML = `
            <img src="${achievement.imageUrl}" alt="${achievement.caption}">
            <div class="work-caption">${achievement.caption}</div>
        `;

        currentPage.push(workItem);

        // When we have 8 items or it's the last item, create a page
        if(currentPage.length === itemsPerPage || index === allAchievements.length - 1) {
            const galleryPage = document.createElement('div');
            galleryPage.className = 'gallery-page';
            
            // First page should be active
            if(pageCount === 0) {
                galleryPage.classList.add('active-page');
            }

            currentPage.forEach(item => galleryPage.appendChild(item));
            galleryContainer.appendChild(galleryPage);

            currentPage = [];
            pageCount++;
        }
    });

    // Update page count display
    const totalPages = Math.ceil(allAchievements.length / itemsPerPage);
    const pageNumberDisplay = document.getElementById('pageNumber');
    if(pageNumberDisplay) {
        pageNumberDisplay.textContent = `Page 1 of ${totalPages}`;
    }

    // Initialize pagination if there are multiple pages
    if(pageCount > 1) {
        initializePagination();
    } else {
        // Hide pagination controls if only one page
        const paginationControls = document.querySelector('.pagination-controls');
        if(paginationControls) {
            paginationControls.style.display = 'none';
        }
    }
});

// ================================================
// PAGINATION CONTROLS
// ================================================
function initializePagination() {
    const pages = document.querySelectorAll('.gallery-page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumberDisplay = document.getElementById('pageNumber');

    if(!prevBtn || !nextBtn || !pageNumberDisplay) {
        console.error('Pagination controls not found');
        return;
    }

    let currentPageIndex = 0;

    function updateGallery() {
        pages.forEach((page, index) => {
            page.classList.remove('active-page');
        });

        pages[currentPageIndex].classList.add('active-page');

        prevBtn.disabled = currentPageIndex === 0;
        nextBtn.disabled = currentPageIndex === pages.length - 1;

        pageNumberDisplay.textContent = `Page ${currentPageIndex + 1} of ${pages.length}`;
    }

    nextBtn.addEventListener('click', () => {
        if (currentPageIndex < pages.length - 1) {
            currentPageIndex++;
            updateGallery();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentPageIndex > 0){
            currentPageIndex--;
            updateGallery();
        }
    });

    updateGallery();
}
