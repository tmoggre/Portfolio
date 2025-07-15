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
    { name: "Readme.txt", type: "txt" },
  ],
};

let currentPath = [fileSystem];
let lastRenderedFolder = null;

function renderIcons(folder) {
  const iconView = $("#icon_view");

  if (lastRenderedFolder !== folder) {
    iconView.stop(true, true).fadeOut(100, () => {
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
      iconView.fadeIn(100);
    });
  } else {
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

  lastRenderedFolder = folder;
}

function updateView() {
  const currentFolder = currentPath[currentPath.length - 1];
  $("#current_path").text(currentPath.map((folder) => folder.name).join(" > "));
  renderIcons(currentFolder);
  highlightSelectedFolder();
  expandFolderTreeToCurrentPath();
}

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

// ✅ THE FIXED FUNCTION: only close branches not in current path
function expandFolderTreeToCurrentPath() {
  const pathSegments = [];
  const openPaths = [];

  currentPath.forEach((node) => {
    pathSegments.push(node.name);
    openPaths.push(pathSegments.join(" > "));
  });

  $("#folder_tree li").each(function () {
    const $li = $(this);
    const folderPath = $li.data("fullPath");
    if (openPaths.includes(folderPath)) {
      $li.children(".nested").stop(true, true).slideDown(200);
    } else {
      $li.children(".nested").stop(true, true).slideUp(200);
    }
  });
}

function goBack() {
  if (currentPath.length > 1) {
    currentPath.pop();
    updateView();
  }
}

function renderFolderTree(node, parentElement, path) {
  const folderTree = $("<ul>");

  if (path.length === 1) {
    const rootItem = $("<li>")
      .text(node.name)
      .addClass("root-folder")
      .data("fullPath", node.name)
      .on("click", (e) => {
        e.stopPropagation();
        currentPath = [node];
        updateView();
      });
    folderTree.append(rootItem);
  }

  node.children.forEach((item) => {
    const fullPath = path.map((p) => p.name).concat(item.name).join(" > ");
    const listItem = $("<li>").text(item.name).data("fullPath", fullPath);

    if (item.type === "folder") {
      const nestedList = $("<div>").addClass("nested");
      listItem.on("click", (e) => {
        e.stopPropagation();
        currentPath = [...path, item];
        updateView();
      });
      folderTree.append(listItem.append(nestedList));
      renderFolderTree(item, nestedList, [...path, item]);
    } else {
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

$(document).ready(function () {
  updateView();
  $("<button>")
    .text("Back")
    .on("click", goBack)
    .prependTo("#nav_bar");
  const addressBar = $("<div>")
    .attr("id", "address_bar")
    .append($("#current_path").detach());
  $("#nav_bar").append(addressBar);
  const folderTreeRoot = $("#folder_tree");
  folderTreeRoot.empty();
  renderFolderTree(fileSystem, folderTreeRoot, [fileSystem]);
});
