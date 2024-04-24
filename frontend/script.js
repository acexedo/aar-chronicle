document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    // Prevent the default action to avoid form submission
    event.preventDefault();
    // Find the next focusable element
    var focusableElements = Array.from(document.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])'));
    var index = focusableElements.indexOf(document.activeElement);
    if (index > -1) {
      var nextElement = focusableElements[index + 1] || focusableElements[0];
      nextElement.focus();
    }
    return false;
  }
});

// Event listeners for delete buttons and add buttons
document.addEventListener("click", function (event) {
  if (event.target && event.target.classList.contains("delete-block")) {
    deleteBlock(event.target.parentNode);
    saveContent(); // Save content after deletion
  }
  if (event.target && event.target.id === "addTextBlock") {
    addTextBlock();
    saveContent(); // Save content after adding a block
  }
  if (event.target && event.target.id === "addImageBlock") {
    addImageBlock();
    saveContent(); // Save content after adding a block
  }
});

// Function to delete a block
function deleteBlock(block) {
  // Check if the block has the class 'story-block' or 'title-block' and remove it
  if (block.classList.contains('story-block') || block.classList.contains('title-block')) {
    block.parentNode.removeChild(block);
  } else {
    // If the block is neither, find the closest parent with either class and remove it
    const blockContainer = block.closest('.story-block, .title-block');
    if (blockContainer) {
      blockContainer.parentNode.removeChild(blockContainer);
    }
  }
  saveContent(); // Save content after deletion
}

// Function to add a text block
function addTextBlock() {
  const textBlock = document.createElement("div");
  textBlock.classList.add("story-block");
  textBlock.innerHTML = `
      <textarea name="narrative" placeholder="Write your narrative here..."></textarea>
      <button type="button" class="delete-block">Delete</button>
  `;
  document.getElementById("chapterContent").appendChild(textBlock);
  saveContent(); // Save content after adding a block
}

// Function to auto-expand text areas
function autoExpandTextArea(textArea) {
  // Reset the height to 'auto' before calculating the scrollHeight
  textArea.style.height = 'auto';
  textArea.style.height = textArea.scrollHeight + 'px';
}

// Apply auto-expansion to all text areas
function applyAutoExpand() {
  document.querySelectorAll('textarea[name="narrative"]').forEach(textArea => {
    // Initialize size on page load
    autoExpandTextArea(textArea);

    // Adjust the height whenever the content changes
    textArea.addEventListener('input', function() {
      autoExpandTextArea(this);
    });
  });
}

// Call applyAutoExpand when adding new blocks
function addTextBlock() {
  const textBlock = document.createElement("div");
  textBlock.classList.add("story-block");
  textBlock.innerHTML = `
      <textarea name="narrative" placeholder="Write your narrative here..."></textarea>
      <button type="button" class="delete-block">Delete</button>
  `;
  document.getElementById("chapterContent").appendChild(textBlock);
  saveContent(); // Save content after adding a block
  applyAutoExpand(); // Apply auto-expansion to the new text area
}

// Function to add an image block
function addImageBlock() {
  const imageBlock = document.createElement("div");
  imageBlock.classList.add("story-block");
  imageBlock.innerHTML = `
      <input type="file" name="image" accept="image/*">
      <button type="button" class="delete-block">Delete</button>
  `;
  document.getElementById("chapterContent").appendChild(imageBlock);
  saveContent(); // Save content after adding a block
}

// Add event listener for adding title block
document.getElementById("addTitleBlock").addEventListener("click", function () {
  const titleBlock = document.createElement("div");
  titleBlock.classList.add("title-block");
  titleBlock.innerHTML = `
      <input type="text" name="title" placeholder="Chapter Title" />
      <textarea name="narrative" placeholder="Write your narrative here..."></textarea>
      <button type="button" class="delete-block">Delete</button>
  `;
  document.getElementById("chapterContent").appendChild(titleBlock);
  saveContent(); // Save content after adding a block
});


// Event listener for image upload and preview
document.getElementById("chapterContent").addEventListener("change", function (event) {
  if (event.target && event.target.nodeName === "INPUT" && event.target.type === "file" && event.target.accept === "image/*") {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
          const previewImage = document.createElement("img");
          previewImage.src = e.target.result;
          previewImage.classList.add("preview-image");
          event.target.parentNode.insertBefore(previewImage, event.target.nextSibling);
      };
      reader.readAsDataURL(file);
      saveContent(); // Save content after image upload
  }
});

// Save input content to local storage
function saveContent() {
  const chapterContent = document.getElementById("chapterContent");
  const textAreas = chapterContent.querySelectorAll('textarea[name="narrative"]');
  const imageInputs = chapterContent.querySelectorAll('input[type="file"][name="image"]');

  // Save the innerHTML
  localStorage.setItem("chapterContent", chapterContent.innerHTML);

  // Save the values of textareas
  textAreas.forEach((textArea, index) => {
    localStorage.setItem("textArea" + index, textArea.value);
  });

  // Save the data URLs of images
  imageInputs.forEach((input, index) => {
    if (input.nextElementSibling && input.nextElementSibling.tagName === "IMG") {
      localStorage.setItem("imageDataUrl" + index, input.nextElementSibling.src);
    }
  });

  // Save the values of title inputs
  const titleInputs = chapterContent.querySelectorAll('input[name="title"]');
  titleInputs.forEach((input, index) => {
    localStorage.setItem("inputTitle" + index, input.value);
  });
}

// Function to remove empty containers
function removeEmptyContainers() {
  const blocks = document.querySelectorAll('.story-block, .title-block');
  blocks.forEach(block => {
    // Check if the block is empty or only contains whitespace
    if (block.innerHTML.trim() === '') {
      block.parentNode.removeChild(block);
    }
  });
}

function loadContent() {
  const chapterContent = document.getElementById("chapterContent");
  const savedContent = localStorage.getItem("chapterContent");
  if (savedContent) {
    chapterContent.innerHTML = savedContent;

    // Repopulate the values of textareas and inputs
    const textAreas = chapterContent.querySelectorAll('textarea[name="narrative"]');
    const inputs = chapterContent.querySelectorAll('input[name="title"], input[type="file"][name="image"]');

    textAreas.forEach((textArea, index) => {
      const savedValue = localStorage.getItem("textArea" + index);
      if (savedValue) {
        textArea.value = savedValue;
      }
    });

    inputs.forEach((input, index) => {
      if (input.type === "text") {
        const savedValue = localStorage.getItem("inputTitle" + index);
        if (savedValue) {
          input.value = savedValue;
        }
      } else if (input.type === "file") {
        const imageDataUrl = localStorage.getItem("imageDataUrl" + index);
        if (imageDataUrl) {
          const previewImage = document.createElement("img");
          previewImage.src = imageDataUrl;
          previewImage.classList.add("preview-image");
          input.parentNode.insertBefore(previewImage, input.nextSibling);
        }
      }
    });

    removeEmptyContainers();
  }
}

// Call applyAutoExpand when the page loads to apply it to existing text areas
document.addEventListener("DOMContentLoaded", function() {
  loadContent();
  applyAutoExpand();
});

// Event listener for the save button
document.getElementById('saveButton').addEventListener('click', function() {
  saveContent();
  alert('Content saved!');
});