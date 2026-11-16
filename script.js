
// ============================================
// UCA LOST & FOUND - MAIN JAVASCRIPT
// ============================================

// Sample demonstration reports
const sampleItems = [
    {
        id: "sample-1",
        name: "Black Backpack",
        status: "Found",
        category: "Bags",
        description: "A black backpack found on campus. It has several compartments.",
        location: "Library",
        room: "",
        date: "2026-11-10",
        image: "",
        reporterName: "Demo Reporter",
        reporterEmail: "demo@example.com",
        progress: "Open"
    },
    {
        id: "sample-2",
        name: "Laptop Charger",
        status: "Lost",
        category: "Electronics",
        description: "A laptop charger left somewhere on campus.",
        location: "Canteen",
        room: "",
        date: "2026-11-11",
        image: "",
        reporterName: "Demo Reporter",
        reporterEmail: "demo@example.com",
        progress: "Open"
    },
    {
        id: "sample-3",
        name: "Sketchbook",
        status: "Found",
        category: "Books & Stationery",
        description: "A sketchbook with drawings inside.",
        location: "Studio",
        room: "",
        date: "2026-11-12",
        image: "",
        reporterName: "Demo Reporter",
        reporterEmail: "demo@example.com",
        progress: "Returned"
    }
];

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getItems() {
    try {
        const saved = localStorage.getItem("ucaItems");

        if (saved === null) {
            localStorage.setItem("ucaItems", JSON.stringify(sampleItems));
            return [...sampleItems];
        }

        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [...sampleItems];
    } catch (error) {
        console.error("Could not load reports:", error);
        return [...sampleItems];
    }
}

function saveItems(items) {
    localStorage.setItem("ucaItems", JSON.stringify(items));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("ucaUser")) || null;
    } catch {
        return null;
    }
}

// ============================================
// REUSABLE ELEMENT FUNCTIONS
// ============================================

function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function formatDate(date) {
    if (!date) return "Date not provided";

    const parsed = new Date(date + "T00:00:00");

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-GB");
}

function createItemCard(item) {
    const card = makeElement("article", "item-card");

    const link = makeElement("a", "item-card-link");
    link.href = "item.html?id=" + encodeURIComponent(item.id);

    const imageArea = makeElement("div", "item-card-image");

    if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name || "Reported item";
        imageArea.appendChild(image);
    } else {
        const emoji = makeElement("span", "item-emoji", "📦");
        imageArea.appendChild(emoji);
    }

    const content = makeElement("div", "item-card-content");

    const status = makeElement(
        "span",
        "status-label " + (item.status || "").toLowerCase(),
        item.status || "Unknown"
    );

    const title = makeElement("h3", "", item.name);
    const description = makeElement("p", "", item.description);
    const location = makeElement("p", "", "📍 " + item.location);
    const date = makeElement("p", "", "📅 " + formatDate(item.date));

    content.append(status, title, description, location, date);
    link.append(imageArea, content);
    card.appendChild(link);

    return card;
}

// ============================================
// HOMEPAGE
// ============================================

function displayRecentItems() {
    const container = document.getElementById("recentItems");
    if (!container) return;

    container.replaceChildren();

    const items = getItems()
        .filter(item => item.status === "Found")
        .slice(0, 3);

    items.forEach(item => {
        container.appendChild(createItemCard(item));
    });

    if (items.length === 0) {
        container.appendChild(
            makeElement("p", "no-results", "No found items have been reported yet.")
        );
    }
}

function updateStatistics() {
    const items = getItems();

    const total = document.getElementById("totalItems");
    const found = document.getElementById("foundItems");
    const returned = document.getElementById("returnedItems");

    if (total) total.textContent = items.length;
    if (found) {
        found.textContent = items.filter(item => item.status === "Found").length;
    }
    if (returned) {
        returned.textContent = items.filter(item => item.progress === "Returned").length;
    }
}

// Homepage search
const homeSearch = document.getElementById("homeSearch");

if (homeSearch) {
    homeSearch.addEventListener("submit", function(event) {
        event.preventDefault();

        const search = document.getElementById("homeSearchInput");

        window.location.href =
            "browse.html?q=" + encodeURIComponent(search.value.trim());
    });
}

// ============================================
// BROWSE ITEMS PAGE
// ============================================

let selectedStatus = "all";

function displayBrowseItems() {
    const container = document.getElementById("browseItems");
    if (!container) return;

    const search = document.getElementById("browseSearch").value
        .trim().toLowerCase();

    const category = document.getElementById("categoryFilter").value;
    const location = document.getElementById("locationFilter").value;

    const filtered = getItems().filter(item => {
        const matchesSearch =
            (item.name || "").toLowerCase().includes(search) ||
            (item.description || "").toLowerCase().includes(search);

        const matchesCategory =
            category === "all" || item.category === category;

        const matchesLocation =
            location === "all" || item.location === location;

        const matchesStatus =
            selectedStatus === "all" || item.status === selectedStatus;

        return matchesSearch && matchesCategory &&
            matchesLocation && matchesStatus;
    });

    container.replaceChildren();

    filtered.forEach(item => {
        container.appendChild(createItemCard(item));
    });

    const count = document.getElementById("resultsCount");
    const empty = document.getElementById("noResults");

    if (count) {
        count.textContent = filtered.length +
            (filtered.length === 1 ? " item" : " items");
    }

    if (empty) empty.hidden = filtered.length !== 0;
}

const browseSearch = document.getElementById("browseSearch");

if (browseSearch) {
    const params = new URLSearchParams(window.location.search);
    browseSearch.value = params.get("q") || "";
    browseSearch.addEventListener("input", displayBrowseItems);
}

const categoryFilter = document.getElementById("categoryFilter");
if (categoryFilter) {
    categoryFilter.addEventListener("change", displayBrowseItems);
}

const locationFilter = document.getElementById("locationFilter");
if (locationFilter) {
    locationFilter.addEventListener("change", displayBrowseItems);
}

document.querySelectorAll(".filter-tab").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".filter-tab").forEach(tab => {
            tab.classList.remove("active");
        });

        button.classList.add("active");
        selectedStatus = button.dataset.status;
        displayBrowseItems();
    });
});
// Display all items immediately when Browse Items opens
displayBrowseItems();
// ============================================
// REPORT AN ITEM
// ============================================

const reportForm = document.getElementById("reportForm");

if (reportForm) {
    const dateInput = document.getElementById("itemDate");

    if (dateInput) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }

    reportForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const message = document.getElementById("reportMessage");
        const file = document.getElementById("itemImage").files[0];

        if (file && !file.type.startsWith("image/")) {
            message.textContent = "Please select an image file.";
            return;
        }

        if (file && file.size > 1024 * 1024) {
            message.textContent = "Your image must be smaller than 1 MB.";
            return;
        }

        function createReport(imageData) {
            const item = {
                id: "item-" + Date.now() + "-" +
                    Math.random().toString(36).slice(2, 7),
                status: document.getElementById("reportStatus").value,
                name: document.getElementById("itemName").value.trim(),
                category: document.getElementById("itemCategory").value,
                description: document.getElementById("itemDescription").value.trim(),
                location: document.getElementById("itemLocation").value,
                room: document.getElementById("roomDetails").value.trim(),
                date: document.getElementById("itemDate").value,
                image: imageData || "",
                reporterName: document.getElementById("reporterName").value.trim(),
                reporterEmail: document.getElementById("reporterEmail").value.trim().toLowerCase(),
                progress: "Open"
            };

            const items = getItems();
            items.unshift(item);
            saveItems(items);

            message.textContent = "Your report has been submitted successfully!";
            reportForm.reset();

            if (dateInput) {
                dateInput.value = new Date().toISOString().slice(0, 10);
            }
        }

        if (file) {
            const reader = new FileReader();

            reader.onload = function() {
                createReport(reader.result);
            };

            reader.onerror = function() {
                message.textContent = "The image could not be read. Please try again.";
            };

            reader.readAsDataURL(file);
        } else {
            createReport("");
        }
    });
}

// ============================================
// MY REPORTS PAGE
// ============================================

function displayMyReports() {
    const container = document.getElementById("myReportsList");
    if (!container) return;

    const user = getCurrentUser();
    const empty = document.getElementById("myReportsEmpty");

    container.replaceChildren();

    if (!user) {
        empty.hidden = false;
        empty.textContent = "Please use the demo login before viewing your reports.";
        return;
    }

    const reports = getItems().filter(item =>
        (item.reporterEmail || "").toLowerCase() === user.email.toLowerCase()
    );

    document.getElementById("myTotal").textContent = reports.length;
    document.getElementById("myOpen").textContent =
        reports.filter(item => item.progress === "Open").length;
    document.getElementById("myReturned").textContent =
        reports.filter(item => item.progress === "Returned").length;

    reports.forEach(item => {
        const row = makeElement("article", "report-row");
        const details = makeElement("div");

        details.append(
            makeElement("span", "status-label " + item.status.toLowerCase(), item.status),
            makeElement("h3", "", item.name),
            makeElement("p", "", item.category + " · " + item.location),
            makeElement("p", "", "Reported: " + formatDate(item.date)),
            makeElement("p", "", "Progress: " + item.progress)
        );

        const viewLink = makeElement("a", "primary-button", "View item");
        viewLink.href = "item.html?id=" + encodeURIComponent(item.id);

        row.append(details, viewLink);
        container.appendChild(row);
    });

    empty.hidden = reports.length !== 0;
}

displayMyReports();

// ============================================
// DEMO LOGIN
// ============================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("loginName").value.trim();
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const role = document.getElementById("loginRole").value;
        const message = document.getElementById("loginMessage");

        if (!name || !email) {
            message.textContent = "Please enter your name and email.";
            return;
        }

        localStorage.setItem("ucaUser", JSON.stringify({
            name: name,
            email: email,
            role: role
        }));

        message.textContent = "Demo access successful. Opening your page...";

        window.location.href =
            role === "admin" ? "admin.html" : "my-reports.html";
    });
}

// ============================================
// ADMIN DASHBOARD
// ============================================

function displayAdminReports() {
    const container = document.getElementById("adminReports");
    if (!container) return;

    const user = getCurrentUser();
    const empty = document.getElementById("adminEmpty");

    container.replaceChildren();

    if (!user || user.role !== "admin") {
        const notice = makeElement(
            "p",
            "demo-notice",
            "Administration demo access is required. Please select Administration demo on the login page."
        );

        const loginLink = makeElement("a", "primary-button", "Go to demo login");
        loginLink.href = "login.html";

        container.append(notice, loginLink);
        empty.hidden = true;
        return;
    }

    const items = getItems();

    document.getElementById("adminTotal").textContent = items.length;
    document.getElementById("adminLost").textContent =
        items.filter(item => item.status === "Lost").length;
    document.getElementById("adminFound").textContent =
        items.filter(item => item.status === "Found").length;
    document.getElementById("adminReturned").textContent =
        items.filter(item => item.progress === "Returned").length;

    items.forEach(item => {
        const row = makeElement("article", "report-row");
        const details = makeElement("div");

        details.append(
            makeElement("span", "status-label " + item.status.toLowerCase(), item.status),
            makeElement("h3", "", item.name),
            makeElement("p", "", item.category + " · " + item.location),
            makeElement("p", "", "Room: " + (item.room || "Not specified")),
            makeElement("p", "", "Reported by: " + item.reporterName),
            makeElement("p", "", "Email: " + item.reporterEmail),
            makeElement("p", "", "Date: " + formatDate(item.date))
        );

        const actions = makeElement("div", "report-actions");

        const progress = document.createElement("select");
        progress.setAttribute("aria-label", "Change report progress");

        ["Open", "Being Handled", "Returned"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            progress.appendChild(option);
        });

        progress.value = item.progress || "Open";

        progress.addEventListener("change", function() {
            const latest = getItems();
            const target = latest.find(report => report.id === item.id);

            if (target) {
                target.progress = progress.value;
                saveItems(latest);
                displayAdminReports();
            }
        });

        const view = makeElement("a", "primary-button", "View");
        view.href = "item.html?id=" + encodeURIComponent(item.id);

        const remove = makeElement("button", "delete-button", "Delete");
        remove.type = "button";

        remove.addEventListener("click", function() {
            if (!confirm("Are you sure you want to delete this demonstration report?")) {
                return;
            }

            const remaining = getItems().filter(report => report.id !== item.id);
            saveItems(remaining);
            displayAdminReports();
        });

        actions.append(progress, view, remove);
        row.append(details, actions);
        container.appendChild(row);
    });

    empty.hidden = items.length !== 0;
}

displayAdminReports();

// ============================================
// ITEM DETAILS PAGE
// ============================================

function displayItemDetails() {
    const container = document.getElementById("itemDetails");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const item = getItems().find(report => report.id === id);
    const notFound = document.getElementById("itemNotFound");

    if (!item) {
        notFound.hidden = false;
        return;
    }

    container.replaceChildren();

    const imageArea = makeElement("div", "detail-image");

    if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;
        imageArea.appendChild(image);
    } else {
        imageArea.appendChild(makeElement("span", "item-emoji", "📦"));
    }

    const status = makeElement(
        "span",
        "status-label " + item.status.toLowerCase(),
        item.status
    );

    const title = makeElement("h1", "", item.name);
    const description = makeElement("p", "", item.description);
    const category = makeElement("p", "", "Category: " + item.category);
    const location = makeElement(
        "p",
        "",
        "Location: " + item.location +
        (item.room ? " · " + item.room : "")
    );
    const date = makeElement("p", "", "Date: " + formatDate(item.date));
    const progress = makeElement("p", "", "Report progress: " + item.progress);

    const contactHeading = makeElement("h2", "", "Contact the reporter");
    const contactText = makeElement(
        "p",
        "",
        "If you believe this item belongs to you, contact the person who submitted the report."
    );

    const contactLink = makeElement("a", "primary-button", "Contact reporter by email");
    contactLink.href = "mailto:" + encodeURIComponent(item.reporterEmail) +
        "?subject=" + encodeURIComponent("UCA Lost & Found enquiry: " + item.name);

    container.append(
        imageArea,
        status,
        title,
        description,
        category,
        location,
        date,
        progress,
        contactHeading,
        contactText,
        contactLink
    );

    notFound.hidden = true;
}

displayItemDetails();

// ============================================
// LOG OUT
// ============================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        localStorage.removeItem("ucaUser");
        window.location.href = "index.html";
    });
}

// ============================================
// MOBILE NAVIGATION
// ============================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".navbar nav");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("show");
    });
}

// ============================================
// INITIALISE HOMEPAGE
// ============================================

displayRecentItems();
updateStatistics();


function updateNavigationAuth() {
    const authLink = document.getElementById("navAuthLink");

    if (!authLink) return;

    const user = getCurrentUser();

    if (user) {
        authLink.textContent = "Logout";
        authLink.href = "#";

        authLink.onclick = function(event) {
            event.preventDefault();
            localStorage.removeItem("ucaUser");
            window.location.href = "index.html";
        };
    } else {
        authLink.textContent = "Login";
        authLink.href = "login.html";
        authLink.onclick = null;
    }
}

updateNavigationAuth();