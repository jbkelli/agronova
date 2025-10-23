document.addEventListener('DOMContentLoaded', function(){
    const pages = document.querySelectorAll('.gallery-page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumberDisplay = document.getElementById('pageNumber');

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
});