// Rick & Morty Season 8 Episodes Data
let episodes = [
    {
        id: 1,
        title: "Summer of All Fears",
        description: "To punish Morty and Summer, Rick puts them in a simulation.",
        season: 8,
        episode: 1,
        airDate: "2025-05-25",
        links: [
            {
                url: "https://drive.google.com/file/d/example1",
                quality: "1080p",
                source: "google drive"
            }
        ]
    },
    {
        id: 2,
        title: "Valkyrick",
        description: "Space Beth calls her dad for a ride, broh.",
        season: 8,
        episode: 2,
        airDate: "2025-06-01",
        links: []
    },
    {
        id: 3,
        title: "The Rick, The Mort & The Ugly",
        description: "Some guys wanna rebuild the citadel, broh. Seems like a bad idea, broh. Yeehaw stuff, broh.",
        season: 8,
        episode: 3,
        airDate: "2025-06-08",
        links: []
    },
    {
        id: 4,
        title: "The Last Temptation of Jerry",
        description: "Broh is risen. The Smiths learn the true meaning of Easter. Kind of. Broh.",
        season: 8,
        episode: 4,
        airDate: "2025-06-15",
        links: []
    },
    {
        id: 5,
        title: "Cryo Mort a Rickver",
        description: "Rick and Morty wanna rob a ship in cryosleep, but people are light sleepers.",
        season: 8,
        episode: 5,
        airDate: "2025-06-22",
        links: []
    },
    {
        id: 6,
        title: "The Curicksous Case of Bethjamin Button",
        description: "Rick and Morty meet a time-traveling baby.",
        season: 8,
        episode: 6,
        airDate: "2025-06-29",
        links: []
    },
    {
        id: 7,
        title: "Ricker than Fiction",
        description: "Rick becomes a fictional character.",
        season: 8,
        episode: 7,
        airDate: "2025-07-06",
        links: []
    },
    {
        id: 8,
        title: "Nomortland",
        description: "Morty gets lost in a wasteland.",
        season: 8,
        episode: 8,
        airDate: "2025-07-13",
        links: []
    },
    {
        id: 9,
        title: "Morty Daddy",
        description: "Jerry tries to be a better father.",
        season: 8,
        episode: 9,
        airDate: "2025-07-20",
        links: []
    },
    {
        id: 10,
        title: "Hot Rick",
        description: "Rick deals with climate change.",
        season: 8,
        episode: 10,
        airDate: "2025-07-27",
        links: []
    }
];

// DOM Elements
const episodesGrid = document.getElementById('episodesGrid');
const uploadModal = document.getElementById('uploadModal');
const uploadForm = document.getElementById('uploadForm');
const episodeSelect = document.getElementById('episodeSelect');
const totalEpisodesSpan = document.getElementById('totalEpisodes');
const availableLinksSpan = document.getElementById('availableLinks');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderEpisodes();
    populateEpisodeSelect();
    updateStats();
    setupEventListeners();
});

// Render episodes to the grid
function renderEpisodes() {
    episodesGrid.innerHTML = '';
    
    episodes.forEach((episode, index) => {
        const episodeCard = createEpisodeCard(episode, index);
        episodesGrid.appendChild(episodeCard);
    });
}

// Create episode card element
function createEpisodeCard(episode, index) {
    const card = document.createElement('div');
    card.className = 'episode-card';
    card.style.setProperty('--card-index', index);
    
    const formattedDate = formatDate(episode.airDate);
    
    card.innerHTML = `
        <div class="episode-header">
            <span class="episode-number">S${episode.season}E${episode.episode}</span>
            <span class="episode-date">${formattedDate}</span>
        </div>
        <h3 class="episode-title">${episode.title}</h3>
        <p class="episode-description">${episode.description}</p>
        <div class="episode-links">
            ${renderEpisodeLinks(episode.links)}
        </div>
    `;
    
    // Add click animation
    card.addEventListener('click', function() {
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = 'cardClick 0.3s ease-out';
    });
    
    return card;
}

// Render episode links
function renderEpisodeLinks(links) {
    if (links.length === 0) {
        return '<div class="no-links">No streaming links available yet</div>';
    }
    
    return links.map(link => `
        <div class="link-item">
            <div class="link-info">
                <span class="link-quality">${link.quality}</span>
                <span class="link-source">${link.source}</span>
            </div>
            <a href="${link.url}" target="_blank" class="watch-btn">Watch</a>
        </div>
    `).join('');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Populate episode select dropdown
function populateEpisodeSelect() {
    episodeSelect.innerHTML = '';
    
    episodes.forEach(episode => {
        const option = document.createElement('option');
        option.value = episode.id;
        option.textContent = `S${episode.season}E${episode.episode} - ${episode.title}`;
        episodeSelect.appendChild(option);
    });
}

// Update statistics
function updateStats() {
    const totalLinks = episodes.reduce((sum, episode) => sum + episode.links.length, 0);
    
    totalEpisodesSpan.textContent = episodes.length;
    availableLinksSpan.textContent = totalLinks;
}

// Setup event listeners
function setupEventListeners() {
    // Upload form submission
    uploadForm.addEventListener('submit', handleUploadSubmission);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === uploadModal) {
            closeUploadModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && uploadModal.style.display === 'block') {
            closeUploadModal();
        }
    });
}

// Handle upload form submission
function handleUploadSubmission(event) {
    event.preventDefault();
    
    const episodeId = parseInt(episodeSelect.value);
    const linkUrl = document.getElementById('linkUrl').value;
    const linkQuality = document.getElementById('linkQuality').value;
    const linkSource = document.getElementById('linkSource').value;
    
    // Find the episode and add the link
    const episode = episodes.find(ep => ep.id === episodeId);
    if (episode) {
        const newLink = {
            url: linkUrl,
            quality: linkQuality,
            source: linkSource
        };
        
        episode.links.push(newLink);
        
        // Re-render episodes and update stats
        renderEpisodes();
        updateStats();
        
        // Close modal and reset form
        closeUploadModal();
        uploadForm.reset();
        
        // Show success message
        showNotification('Link added successfully!', 'success');
    }
}

// Open upload modal
function openUploadModal() {
    uploadModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add entrance animation
    const modalContent = uploadModal.querySelector('.modal-content');
    modalContent.style.animation = 'none';
    modalContent.offsetHeight; // Trigger reflow
    modalContent.style.animation = 'modalSlideIn 0.4s ease-out';
}

// Close upload modal
function closeUploadModal() {
    const modalContent = uploadModal.querySelector('.modal-content');
    modalContent.style.animation = 'modalSlideOut 0.3s ease-in';
    
    setTimeout(() => {
        uploadModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        uploadForm.reset();
    }, 300);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: '#ffffff',
        fontWeight: '500',
        zIndex: '1001',
        transform: 'translateX(100%) scale(0.8)',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        backgroundColor: type === 'success' ? '#00ff88' : '#333333',
        border: `1px solid ${type === 'success' ? '#00cc66' : '#555555'}`,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    });
    
    if (type === 'success') {
        notification.style.color = '#000000';
    }
    
    document.body.appendChild(notification);
    
    // Animate in with bounce effect
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
    }, 100);
    
    // Add pulse effect for success
    if (type === 'success') {
        setTimeout(() => {
            notification.style.animation = 'notificationPulse 0.6s ease-in-out';
        }, 500);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%) scale(0.8)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// Search functionality (for future enhancement)
function searchEpisodes(query) {
    const filteredEpisodes = episodes.filter(episode => 
        episode.title.toLowerCase().includes(query.toLowerCase()) ||
        episode.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredEpisodes;
}

// Sort episodes by different criteria
function sortEpisodes(criteria = 'episode') {
    const sortedEpisodes = [...episodes];
    
    switch (criteria) {
        case 'episode':
            sortedEpisodes.sort((a, b) => a.episode - b.episode);
            break;
        case 'title':
            sortedEpisodes.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'date':
            sortedEpisodes.sort((a, b) => new Date(a.airDate) - new Date(b.airDate));
            break;
        case 'links':
            sortedEpisodes.sort((a, b) => b.links.length - a.links.length);
            break;
    }
    
    return sortedEpisodes;
}

// Export data (for future enhancement)
function exportEpisodeData() {
    const dataStr = JSON.stringify(episodes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'rick-morty-season8-episodes.json';
    link.click();
}

// Load data from file (for future enhancement)
function importEpisodeData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            episodes = importedData;
            renderEpisodes();
            populateEpisodeSelect();
            updateStats();
            showNotification('Data imported successfully!', 'success');
        } catch (error) {
            showNotification('Error importing data. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}