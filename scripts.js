var video = document.getElementById('video');
var hls = new Hls();

// Function to load and play a video
function loadVideo(link, channel) {
    // Store references to the video and iframe elements
    var videoElement = document.getElementById('video');
    var iframeElement = document.getElementById('iframe');
    var parentElement;

    // Determine the parent element of the video or iframe
    if (videoElement) {
        parentElement = videoElement.parentNode;
        // Remove the existing video element
        parentElement.removeChild(videoElement);
    } else if (iframeElement) {
        parentElement = iframeElement.parentNode;
        // Remove the existing iframe element
        parentElement.removeChild(iframeElement);
    }

    // Create new video or iframe element
    var newElement;
    if (link.endsWith('.m3u8')) {
        // Create a new video element
        newElement = document.createElement('video');
        newElement.id = 'video';
        newElement.className = 'mt-3'; // Add the class attribute
        newElement.controls = true; // Add the controls attribute
        // Initialize HLS.js if needed
        if (hls.destroyed) {
            hls = new Hls();
        }
        hls.loadSource(link);
        hls.attachMedia(newElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            newElement.play();
        });
    } else {
        // Create a new iframe element
        newElement = document.createElement('iframe');
        newElement.id = 'iframe';
        newElement.width = '100%'; // Set the width to 100%
        newElement.height = '100%'; // Set the height to 100%
        newElement.frameBorder = '0'; // Remove the border
	newElement.allow = 'autoplay'; // allow autoplay
	newElement.scrolling = 'no'; // allow autoplay
        newElement.allowFullscreen = true; // Add the allowfullscreen attribute
        newElement.src = link;
	newElement.sandbox = 'allow-same-origin allow-scripts'; // Restrict navigation

    }

    // Append the new element to the original parent
    if (parentElement) {
        parentElement.appendChild(newElement);
    } else {
        // If no parent was found, append it to the body
        document.body.appendChild(newElement);
    }

    // Update the dropdown button text
    $('#linkSelector').text(channel);

    // Save the selected channel in a cookie
    setCookie('selectedChannel', channel, 365);
}

// Fetch the JSON file
fetch('streamLinks.json')
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	})
	.then(data => {
		populateDropdown(data);
	})
	.catch(error => {
		console.error('There has been a problem with your fetch operation:', error);
	});

// Function to populate the dropdown menu with fetched m3u8 links
function populateDropdown(m3u8Links) {
	var dropdownMenu = document.getElementById('dropdownMenu');
	dropdownMenu.innerHTML = ''; // Clear existing items

	m3u8Links.forEach(function(link) {
		if (!link.streamUrl || !link.streamName) {
			console.warn('Invalid link object:', link);
			return;
		}
		var dropdownItem = document.createElement('a');
		dropdownItem.className = 'dropdown-item';
		dropdownItem.href = '#';
		dropdownItem.setAttribute('data-link', link.streamUrl);
		dropdownItem.setAttribute('data-channel', link.streamName);
		dropdownItem.textContent = link.streamName;
		dropdownItem.addEventListener('click', function(e) {
			e.preventDefault();
			loadVideo(this.getAttribute('data-link'), this.getAttribute('data-channel'));
		});
		dropdownMenu.appendChild(dropdownItem);

		// Check if this is the saved channel and select it
		var savedChannel = getCookie('selectedChannel');
		if (savedChannel === link.streamName) {
			dropdownItem.click();
		}
	});
}

// Function to set a cookie
function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

// Function to toggle dark mode
function toggleDarkMode() {
	var body = document.body;
	body.classList.toggle('dark-mode');

	// Save the user's preference in a cookie
	var isDarkMode = body.classList.contains('dark-mode');
	setCookie('darkMode', isDarkMode ? 'true' : 'false', 365);
}

// Event listener for the dark mode toggle button
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Check for the dark mode cookie on page load
window.onload = function() {
	var isDarkMode = getCookie('darkMode') === 'true';
	if (isDarkMode) {
		document.body.classList.add('dark-mode');
	}
}

// Function to check if two dates are equal (ignoring time)
function areDatesEqual(date1, date2) {
	return date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate();
}

// Fetch the JSON data
fetch('todayMatches.json')
	.then(response => response.json())
	.then(data => {
		const leagues = data.todayMatches['leagues'];
		const matches = data.todayMatches['matches'];
		const tableBody = document.querySelector('#matchesTable tbody');
		let currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		// Loop through each match and create a table row
		matches.forEach(match => {
			const scheduledStartOn = match.scheduledStartOn;
			let specificDate = new Date(scheduledStartOn);
			specificDate.setHours(0, 0, 0, 0);
			if (areDatesEqual(currentDate, specificDate)) {
				const row = document.createElement('tr');
				// Check if the matchId is in any of the matchIds arrays
				leagues.forEach(league => {
					const matchIds = league.dates.flatMap(date => date.matchIds || []);
					const matchId = match.sportId;
					if (matchIds.includes(matchId)) {
						// Create a new image element
						var img = document.createElement('img');
						img.src = league.logo; // Set the source of the image
						img.width = 25; // Set the width of the image
						const logoCell = document.createElement('td');
						logoCell.appendChild(img); // Append the image to the logo cell
						row.appendChild(logoCell);
					} 
				});

				// Create table cells for each important detail
				const hostCell = document.createElement('td');
				hostCell.textContent = match.hostName;
				row.appendChild(hostCell);

				const statusCell = document.createElement('td');
				const hostGoals = match.hostGoals || "";
				const guestGoals = match.guestGoals || "";
				statusCell.textContent = `${hostGoals} - ${guestGoals}`;
				row.appendChild(statusCell);

				const guestCell = document.createElement('td');
				guestCell.textContent = match.guestName;
				row.appendChild(guestCell);

				const scheduledStartCell = document.createElement('td');
				scheduledStartCell.textContent = `${match.scheduledStartTime}`;
				row.appendChild(scheduledStartCell);

				// Append the row to the table body
				tableBody.appendChild(row);
			}

		});
	})
	.catch(error => {
		console.error('Error fetching JSON data:', error);
	});
