document.addEventListener('DOMContentLoaded', () => {
    fetchTags();
    searchImages(); // Load all images initially
    setupTagsSidebar(); // Setup sidebar
});

let allTags = []; // Will hold all tags from the backend
let allBranches = []; // Will hold all branches from the backend
let allNames = []; // Will hold all names from the backend

// Fetch all tags, branches, and names initially and store them
function fetchTags() {
    fetch('/api/tags')
        .then(response => response.json())
        .then(data => {
            allTags = data.tags.sort();
            allBranches = data.branches.sort();
            allNames = data.names.sort();
            setupTagsSidebar(); // Re-setup sidebar after sorting
        })
        .catch(error => {
            console.error('Error fetching tags:', error);
        });
}

// Show tag suggestions based on user input
function showTagSuggestions(inputValue) {
    const suggestions = inputValue
        ? allTags
            .filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
            .slice(0, 10)
        : [];

    const suggestionBox = document.getElementById('suggestionBox');
    suggestionBox.innerHTML = '';
    suggestionBox.classList.toggle('visible', suggestions.length > 0);

    suggestions.forEach(suggestedTag => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestedTag;
        suggestionItem.onclick = () => selectTag(suggestedTag);
        suggestionBox.appendChild(suggestionItem);
    });
}

// Show branch suggestions based on user input
function showBrancheSuggestions(inputValue) {
    const suggestions = inputValue
        ? allBranches
            .filter(branche => branche.toLowerCase().includes(inputValue.toLowerCase()))
            .slice(0, 10)
        : [];

    const suggestionBox = document.getElementById('brancheSuggestionBox');
    suggestionBox.innerHTML = '';
    suggestionBox.classList.toggle('visible', suggestions.length > 0);

    suggestions.forEach(suggestedBranche => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestedBranche;
        suggestionItem.onclick = () => selectBranche(suggestedBranche);
        suggestionBox.appendChild(suggestionItem);
    });
}

// Show name suggestions based on user input
function showNameSuggestions(inputValue) {
    const suggestions = inputValue
        ? allNames
            .filter(name => name.toLowerCase().includes(inputValue.toLowerCase()))
            .slice(0, 10)
        : [];

    const suggestionBox = document.getElementById('nameSuggestionBox');
    suggestionBox.innerHTML = '';
    suggestionBox.classList.toggle('visible', suggestions.length > 0);

    suggestions.forEach(suggestedName => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestedName;
        suggestionItem.onclick = () => selectName(suggestedName);
        suggestionBox.appendChild(suggestionItem);
    });
}

// Function to select or deselect a tag and update the input field
function selectTag(selectedTag) {
    const tagInput = document.getElementById('tagInput');
    const currentTags = new Set(tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag));

    if (currentTags.has(selectedTag)) {
        currentTags.delete(selectedTag); // Remove the tag if already present
    } else {
        currentTags.add(selectedTag); // Add the tag if not present
    }

    tagInput.value = Array.from(currentTags).join(', ') + (currentTags.size ? ', ' : '');
    document.getElementById('suggestionBox').innerHTML = ''; // Clear suggestions
    searchImages(); // Search with the updated tag input
}

// Function to select or deselect a branch and update the input field
function selectBranche(selectedBranche) {
    const brancheInput = document.getElementById('brancheInput');
    brancheInput.value = (brancheInput.value === selectedBranche) ? '' : selectedBranche;
    document.getElementById('brancheSuggestionBox').innerHTML = ''; // Clear suggestions
    searchImages(); // Optional: sofort suchen
}

// Function to select or deselect a name and update the input field
function selectName(selectedName) {
    const nameInput = document.getElementById('nameInput');
    nameInput.value = (nameInput.value === selectedName) ? '' : selectedName;
    document.getElementById('nameSuggestionBox').innerHTML = ''; // Clear suggestions
    searchImages(); // Optional: sofort suchen
}


// Open the modal to display the selected image
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    modal.style.display = 'block';
}

// Close the modal
document.getElementById('closeModal').onclick = () => {
    document.getElementById('imageModal').style.display = 'none';
};

// Handle image upload
document.getElementById('uploadForm').onsubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', document.getElementById('imageFile').files[0]);
    formData.append('tags', document.getElementById('uploadTags').value);
    formData.append('branche', document.getElementById('uploadBranche').value);
    formData.append('name', document.getElementById('uploadNameTag').value);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('uploadMessage').textContent = data.message;
        searchImages(); // Reload images after upload
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        document.getElementById('uploadMessage').textContent = 'Error uploading image';
    });
};

// Event listeners for input fields to show suggestions
document.getElementById('tagInput').addEventListener('input', (event) => {
    showTagSuggestions(event.target.value);
});

document.getElementById('brancheInput').addEventListener('input', (event) => {
    showBrancheSuggestions(event.target.value);
});

document.getElementById('nameInput').addEventListener('input', (event) => {
    showNameSuggestions(event.target.value);
});

// Function to search images
function searchImages() {
    const tagInput = document.getElementById('tagInput').value.trim();
    const brancheInput = document.getElementById('brancheInput').value.trim();
    const nameInput = document.getElementById('nameInput').value.trim();

    fetch(`/api/images?tags=${encodeURIComponent(tagInput)}&branche=${encodeURIComponent(brancheInput)}&name=${encodeURIComponent(nameInput)}`)
        .then(response => response.json())
        .then(data => {
            displayImages(data);
        })
        .catch(error => {
            console.error('Error fetching images:', error);
        });
}

// Function to display images
function displayImages(images) {
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';

    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = `/Pictures/${image}`;
        imgElement.alt = image;
        imgElement.onclick = () => showImageModal(imgElement.src);
        imageContainer.appendChild(imgElement);
    });
}

// Function to show image in modal
function showImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = src;
    modal.style.display = 'block';
}

// Function to close image modal
document.getElementById('closeModal').onclick = () => {
    document.getElementById('imageModal').style.display = 'none';
};

// Function to fetch and populate the sidebar lists
function setupTagsSidebar() {
    fetch('/api/tags')
        .then(response => response.json())
        .then(data => {
            populateSidebarList('branchesList', data.branches.sort(), 'branche');
            populateSidebarList('namesList', data.names.sort(), 'name');
            populateSidebarList('tagsList', data.tags.sort(), 'tag');
        })
        .catch(error => {
            console.error('Error fetching tags for sidebar:', error);
        });
}

// Function to populate sidebar list
function populateSidebarList(elementId, items, type) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = '';

    items.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item;
        div.onclick = () => {
            if (type === 'tag') {
                selectTag(item);
            } else if (type === 'branche') {
                selectBranche(item);
            } else if (type === 'name') {
                selectName(item);
            }
        };
        listElement.appendChild(div);
    });
}

// Fetch and display all tags initially
function fetchTags() {
    fetch('/api/tags')
        .then(response => response.json())
        .then(data => {
            // Add any additional logic to handle the fetched tags
        })
        .catch(error => {
            console.error('Error fetching tags:', error);
        });
}