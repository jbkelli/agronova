const NEWS_CONTAINER = document.getElementById('news-container');
const STATUS_DIV = document.getElementById('status');

function renderNewsCards(snapshot){
    NEWS_CONTAINER.innerHTML = ''; //removes any previous content

    if(snapshot.empty){
        STATUS_DIV.textContent = "No upcoming events or news updates at this time.";
        STATUS_DIV.style.color = 'var(--color-secondary)';
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
    window.db.collection('news_posts')
    .orderBy('date', 'desc')
    .limit(15)
    .get()
    .then(renderNewsCards)
    .catch(error => {
        STATUS_DIV.textContent = "Error: Failed to fetch news. Check connection and try reloading the page";
        STATUS_DIV.style.color = 'var(--color-error)';
        console.error("News load error:", error);
    });
}


if(NEWS_CONTAINER){
    loadAllNews();
}