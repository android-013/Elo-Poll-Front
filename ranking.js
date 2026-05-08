document.addEventListener('DOMContentLoaded', async function () {
  const imgDir = "images/"; // Folder where images are stored
  const imageNames = [..."abcdefghijklmnopqrstuvwxyz"].map(letter => `${letter}.jpg`); // Array of image names
  const baseRating = 1400; // Default rating
  const tableBody = document.getElementById('rankingTable');

  function setPageLoading(isLoading) {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      loader.classList.toggle("is-hidden", !isLoading);
    }
  }

  // Function to get image rating from sessionStorage or set to default
  function getImageRating(imageName) {
    const storedRating = sessionStorage.getItem(imageName);
    if (storedRating === null) {
      sessionStorage.setItem(imageName, baseRating);
      return baseRating;
    }
    return parseFloat(storedRating);
  }

  // Function to sort images by rating in descending order
  function getSortedRankings() {
    return imageNames
      .map(imageName => ({
        name: imageName,
        rating: getImageRating(imageName),
      }))
      .sort((a, b) => b.rating - a.rating);
  }

  function createRankingRow(entry, index) {
    const row = document.createElement('tr');

    // Rank
    const rankCell = document.createElement('td');
    rankCell.dataset.label = "Rank";
    rankCell.textContent = index + 1;
    row.appendChild(rankCell);

    // Image
    const imageCell = document.createElement('td');
    imageCell.dataset.label = "Image";
    const imgElement = document.createElement('img');
    imgElement.src = imgDir + entry.name;
    imgElement.alt = entry.name;
    imgElement.loading = "lazy";
    imgElement.decoding = "async";
    imageCell.appendChild(imgElement);
    row.appendChild(imageCell);

    // Rating
    const ratingCell = document.createElement('td');
    ratingCell.dataset.label = "Rating";
    ratingCell.textContent = Math.round(entry.rating);
    row.appendChild(ratingCell);

    return row;
  }

  // Populate the rankings table
  async function displayRankings() {
    setPageLoading(true);
    tableBody.innerHTML = "";

    // Let the loading overlay paint before heavier DOM/image work starts.
    await new Promise(resolve => requestAnimationFrame(resolve));

    const rankings = getSortedRankings();
    const fragment = document.createDocumentFragment();

    rankings.forEach((entry, index) => {
      fragment.appendChild(createRankingRow(entry, index));
    });

    tableBody.appendChild(fragment);
    setPageLoading(false);
  }

  // Call the function to display rankings on page load
  await displayRankings();
});
