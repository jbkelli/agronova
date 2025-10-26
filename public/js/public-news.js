const NEWS_CONTAINER = document.getElementById('news-container');
const STATUS_DIV = document.getElementById('status');

function getSpecificErrorMessage(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        return 'Unable to access news data. Please try again later.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('offline')) {
        return 'No internet connection. Please check your network and try again.';
    }
    if (errorMessage.includes('not found')) {
        return 'News feed not found. Please contact support.';
    }
    
    return 'Failed to load news. Please refresh the page or try again later.';
}

function renderNewsCards(snapshot){
    NEWS_CONTAINER.innerHTML = ''; //removes any previous content

    if(snapshot.empty){
        STATUS_DIV.textContent = "No upcoming events or news updates at this time.";
        STATUS_DIV.style.color = 'var(--color-secondary)';
        NEWS_CONTAINER.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #999;"><h3>No News Yet</h3><p>Check back soon for updates on our latest events and achievements.</p></div>';
        return;
    }

    STATUS_DIV.textContent = `Displaying ${snapshot.size} latest updates.`;

    snapshot.forEach(doc => {
        const post = doc.data();

        const newsCard = document.createElement('p');
        newsCard.href = `news-detail.html?id=${doc.id}`;
        newsCard.classList.add('news-card');

        //Applying the image url
    const imgUrl = post.imageUrl || 'https://via.placeholder.com/350x350/0b141d/00FFC0?text=AgriNova+Image';
        newsCard.style.backgroundImage = `url('${imgUrl}')`;

        //formatting the date
        let displayDate = post.date && post.date.seconds ? new Date(post.date.seconds * 1000).toLocaleDateString() : 'Date Missing';

        newsCard.innerHTML = `
            <div class="content-overlay">
                <p class="post-date">${displayDate}</p>
                <h2>${post.title}</h2>
                <p class="content">${post.content}</p>
            </div>
        `;

        NEWS_CONTAINER.appendChild(newsCard);
    });
}

function loadAllNews(){
    STATUS_DIV.textContent = "Loading latest news...";
    STATUS_DIV.style.color = 'var(--color-secondary)';
    
    db.collection('news_posts')
    .orderBy('date', 'desc')
    .limit(15)
    .get()
    .then(renderNewsCards)
    .catch(error => {
        const specificError = getSpecificErrorMessage(error);
        STATUS_DIV.textContent = `Error: ${specificError}`;
        STATUS_DIV.style.color = 'var(--color-error)';
        NEWS_CONTAINER.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #E85D4A;"><h3>Unable to Load News</h3><p>Please check your internet connection and refresh the page.</p></div>';
        console.error("News load error:", error);
    });
}


if(NEWS_CONTAINER){
    loadAllNews();
}