document.addEventListener('DOMContentLoaded', function () {
    const imgDir = "images/"; // Folder where images are stored
    const imageNames = [..."abcdefghijklmnopqrstuvwxyz"].map(letter => `${letter}.jpg`); // Array of image names
    const baseRating = 1400; // Default rating
  
    const tableBody = document.getElementById('rankingTable');
  
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
  
    // Populate the rankings table
    function displayRankings() {
      const rankings = getSortedRankings();
      rankings.forEach((entry, index) => {
        const row = document.createElement('tr');
  
        // Rank
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        row.appendChild(rankCell);
  
        // Image
        const imageCell = document.createElement('td');
        const imgElement = document.createElement('img');
        imgElement.src = imgDir + entry.name;
        imgElement.alt = entry.name;
        imgElement.style.width = "50px"; // Adjust image size as needed
        imgElement.style.height = "50px";
        imageCell.appendChild(imgElement);
        row.appendChild(imageCell);
  
        // Rating
        const ratingCell = document.createElement('td');
        ratingCell.textContent = Math.round(entry.rating);
        row.appendChild(ratingCell);
  
        tableBody.appendChild(row);
      });
    }
  
    // Call the function to display rankings on page load
    displayRankings();
  });
  