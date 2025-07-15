const fileSystem = {
  name: "Root",
  type: "folder",
  children: [
    {
      name: "Documents",
      type: "folder",
      children: [
        { name: "Resume.docx", type: "docx" },
        { name: "Report.pdf", type: "pdf" },
        {
          name: "Taxes",
          type: "folder",
          children: [{ name: "2024.xlsx", type: "xlsx" }],
        },
      ],
    },
    {
      name: "Images",
      type: "folder",
      children: [
        { name: "Photo1.jpg", type: "jpg" },
        { name: "Photo2.png", type: "png" },
      ],
    },
    {
      name: "Videos",
      type: "folder",
      children: [
        { name: "Video1.mp4", type: "mp4" },
        { name: "Video2.mov", type: "mov" },
      ],
    },
    { name: "Readme.txt", type: "txt" }, // File directly in root
  ],
};

let currentPath = [fileSystem];

// Render icons in `window_main`
function renderIcons(folder) {
  const iconView = $("#icon_view");
  iconView.empty();

  folder.children.forEach((item) => {
    const icon = $("<div>")
      .addClass("icon_item")
      .append(
        $("<img>").attr("src", `assets/images/icons/icon_48_${item.type}.png`)
      )
      .append($("<span>").text(item.name))
      .on("dblclick", () => {
        if (item.type === "folder") {
          currentPath.push(item);
          updateView();
        } else {
          alert(`You opened the file: ${item.name}`);
        }
      });

    iconView.append(icon);
  });
}

// Update the explorer view in `window_main`
function updateView() {
  const currentFolder = currentPath[currentPath.length - 1];

  // 1) Update the text in #current_path
  $("#current_path").text(
    currentPath.map((folder) => folder.name).join(" > ")
  );

  // 2) Render icons based on the current folder
  renderIcons(currentFolder);

  // 3) Highlight whichever folder is selected in #folder_tree
  highlightSelectedFolder();
}

// Highlight the selected folder/file in the folder tree
function highlightSelectedFolder() {
  const selectedPath = currentPath.map((folder) => folder.name).join(" > ");
  $("#folder_tree li").each(function () {
    const folderPath = $(this).data("fullPath");
    if (folderPath === selectedPath) {
      $(this).addClass("selected-folder");
    } else {
      $(this).removeClass("selected-folder");
    }
  });
}

// Go back one level in the folder structure
function goBack() {
  if (currentPath.length > 1) {
    currentPath.pop();
    updateView();
  }
}

// Render the folder tree in `window_aside`
function renderFolderTree(node, parentElement, path) {
  const folderTree = $("<ul>");

  // Show a "Root" entry if we're at top level
  if (path.length === 1) {
    const rootItem = $("<li>")
      .text(node.name)
      .addClass("root-folder")
      .data("fullPath", node.name)
      .on("click", (e) => {
        e.stopPropagation();
        currentPath = [node]; // back to root
        updateView();
        folderTree.find(".nested").slideUp(); // collapse subfolders
      });
    folderTree.append(rootItem);
  }

  // Loop over node's children
  node.children.forEach((item) => {
    const fullPath = path.map((p) => p.name).concat(item.name).join(" > ");
    const listItem = $("<li>").text(item.name).data("fullPath", fullPath);

    if (item.type === "folder") {
      const nestedList = $("<div>").addClass("nested");

      // Click to toggle folder
      listItem.on("click", (e) => {
        e.stopPropagation();
        listItem.siblings("li").find(".nested").slideUp(); // collapse siblings
        nestedList.slideToggle(); // expand/collapse this folder
        currentPath = [...path, item];
        updateView();
      });

      folderTree.append(listItem.append(nestedList));
      // Recursively render subfolders
      renderFolderTree(item, nestedList, [...path, item]);
    } else {
      // File item
      listItem
        .addClass("file-item")
        .on("click", (e) => {
          e.stopPropagation();
          alert(`You selected the file: ${item.name}`);
          currentPath = [...path, item];
          updateView();
        });
      folderTree.append(listItem);
    }
  });

  parentElement.append(folderTree);
}

// Document ready
$(document).ready(function () {
  // Initialize the main explorer view
  updateView();

  // Create a Back button for navigation and place it in #nav_bar
  $("<button>")
    .text("Back")
    .on("click", goBack)
    .prependTo("#nav_bar");

  // Wrap #current_path in a div to form an address bar
  const addressBar = $("<div>")
    .attr("id", "address_bar")
    .append($("#current_path").detach()); // move #current_path inside
  $("#nav_bar").append(addressBar);

  // Render folder tree in #folder_tree
  const folderTreeRoot = $("#folder_tree");
  folderTreeRoot.empty();
  renderFolderTree(fileSystem, folderTreeRoot, [fileSystem]);
});