const imgDir = "images/";
const arrayLength = 26; // 26 images, a.jpg to z.jpg
const imageArray = [];
let baseRating = 1400;
const k = 32; // K-factor for Elo rating system
let isRoundLoading = false;

function setPageLoading(isLoading) {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.classList.toggle("is-hidden", !isLoading);
  }
}

function setChoiceLoading(cardId, isLoading) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.toggle("loading", isLoading);
  }
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
}

async function setChoiceImage(imageElement, cardId, source) {
  setChoiceLoading(cardId, true);

  try {
    await preloadImage(source);
  } catch (error) {
    console.warn(`Could not preload ${source}. Showing it anyway.`, error);
  }

  imageElement.src = source;
  setChoiceLoading(cardId, false);
}

// Get a random item from the array
function getRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// Get img name without extension from element src
function getImgName(url) {
  const lastIndex = url.lastIndexOf('/');
  if (lastIndex !== -1) {
    return url.substring(lastIndex + 1);
  }
  return url;
}

function getDifferentImageSource(currentImageSource) {
  let imageName;
  let nextSource;

  do {
    imageName = getRandomItem(imageArray);
    nextSource = imgDir + imageName;
  } while (currentImageSource && currentImageSource.endsWith(imageName));

  return nextSource;
}

// elo rating formula in chess
function probability(leftRating, rightRating) {
  return 1.0 * 1.0 / (1 + 1.0 * Math.pow(10, 1.0 * (leftRating - rightRating) / 400));
}

function eloRating(leftRating, rightRating, k, win) {
  let leftProb = probability(rightRating, leftRating); // left win probability
  let rightProb = probability(leftRating, rightRating); // right win probability
  if (win) { // left wins, right loses
    leftRating = leftRating + k * (1 - leftProb); // add left rating
    rightRating = rightRating + k * (0 - rightProb); // minus right rating
  } else { // right wins, left loses
    leftRating = leftRating + k * (0 - leftProb); // minus left rating
    rightRating = rightRating + k * (1 - rightProb); // add right rating
  }
  return { leftRating, rightRating };
}

// update session value and get new image
async function updateEloAndDisplay(leftWin) {
  if (isRoundLoading) return;
  isRoundLoading = true;

  const leftImage = document.getElementById("leftImg");
  const leftImgName = getImgName(leftImage.src);

  const rightImage = document.getElementById("rightImg");
  const rightImgName = getImgName(rightImage.src);

  const storedLeft = sessionStorage.getItem(leftImgName);
  const storedRight = sessionStorage.getItem(rightImgName);

  if (storedLeft == null) {
    sessionStorage.setItem(leftImgName, baseRating);
  }

  if (storedRight == null) {
    sessionStorage.setItem(rightImgName, baseRating);
  }

  const leftRating = parseFloat(sessionStorage.getItem(leftImgName));
  const rightRating = parseFloat(sessionStorage.getItem(rightImgName));

  const result = eloRating(leftRating, rightRating, k, leftWin);

  // Update the Elo ratings for the next round
  sessionStorage.setItem(leftImgName, result.leftRating);
  sessionStorage.setItem(rightImgName, result.rightRating);

  if (leftWin) {
    const rightImageSource = getDifferentImageSource(leftImage.src);
    await setChoiceImage(rightImage, "rightCard", rightImageSource);
  } else {
    const leftImageSource = getDifferentImageSource(rightImage.src);
    await setChoiceImage(leftImage, "leftCard", leftImageSource);
  }

  isRoundLoading = false;
}

document.addEventListener('DOMContentLoaded', async function () {
  setPageLoading(true);

  // Populate the array with filenames
  for (let i = 0; i < arrayLength; i++) {
    const img = String.fromCharCode(97 + i) + ".jpg"; // Generate filenames a.jpg to z.jpg
    imageArray.push(img);

    // Keep existing scores instead of resetting rankings every time the page opens.
    if (sessionStorage.getItem(img) === null) {
      sessionStorage.setItem(img, baseRating);
    }
  }

  let leftImg, rightImg;
  // Ensure leftImg and rightImg are not the same
  do {
    leftImg = getRandomItem(imageArray);
    rightImg = getRandomItem(imageArray);
  } while (leftImg === rightImg);

  const leftImgElement = document.getElementById('leftImg');
  const rightImgElement = document.getElementById('rightImg');

  await Promise.all([
    setChoiceImage(leftImgElement, "leftCard", imgDir + leftImg),
    setChoiceImage(rightImgElement, "rightCard", imgDir + rightImg)
  ]);

  setPageLoading(false);
});

// left wins, right loses
function clickLeft() {
  updateEloAndDisplay(true);
}

// right wins, left loses
function clickRight() {
  updateEloAndDisplay(false);
}
