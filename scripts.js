document.addEventListener('DOMContentLoaded', function() {
    // Replace with the actual URL or endpoint that provides the m3u8 links
    const m3u8LinksUrl = 'https://streambtw.com/';

    // Function to load and play a video
    function loadVideo(link, channel) {
        if (hls.destroyed) {
            hls = new Hls();
        }
        hls.loadSource(link);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play();
        });
        // Update the dropdown button text
        $('#linkSelector').text(channel);
    }

    // Function to populate the dropdown menu with fetched m3u8 links
    function populateDropdown(m3u8Links) {
        var dropdownMenu = document.getElementById('dropdownMenu');
                dropdownMenu.innerHTML = ''; // Clear existing items
                m3u8Links.forEach(function(link) {
                    var dropdownItem = document.createElement('a');
                    dropdownItem.className = 'dropdown-item';
                    dropdownItem.href = '#';
                    dropdownItem.setAttribute('data-link', link.url);
                    dropdownItem.setAttribute('data-channel', link.name);
                    dropdownItem.textContent = link.name;
                    dropdownItem.addEventListener('click', function(e) {
                        e.preventDefault();
                        loadVideo(this.getAttribute('data-link'), this.getAttribute('data-channel'));
                    });
                    dropdownMenu.appendChild(dropdownItem);
                });
    }

    // Fetch the content of the m3u8LinksUrl and process the m3u8 links
    fetch(m3u8LinksUrl)
    .then(response => response.text())
    .then(html => {
        // Define the regular expression to match the <ul> element with the class "list-group list-group-flush"
        const ulRegex = /<ul class="list-group list-group-flush"><center>Football \/ Soccer<\/center>([\s\S]*?)<\/ul>/;
        const ulMatch = html.match(ulRegex);

        if (ulMatch) {
            // Extract the content of the matched <ul> element
            const ulContent = ulMatch[1];

            // Define a regular expression to match the <a> tags within the <ul> element
            const linkRegex = /<a href="(.*?)".*?>(.*?)<\/a>/g;
            let links = [];

            // Loop through the matches to extract the links and their names
            let linkMatch;
            while ((linkMatch = linkRegex.exec(ulContent)) !== null) {
                links.push({
                    url: linkMatch[1],
                    name: linkMatch[2]
                });
            }

            // Array to hold the m3u8 links
            let m3u8Links = [];

            // Process each link
            links.forEach(link => {
                fetch(link.url)
                    .then(response => response.text())
                    .then(html => {
                        // Define a regular expression to match the m3u8 link
                        const m3u8Regex = /var player = new Clappr\.Player\({source: "(.*?)",/;
                        const m3u8Match = html.match(m3u8Regex);

                        if (m3u8Match) {
                            // Extract the m3u8 link
                            const m3u8Link = m3u8Match[1];
                            // Add the m3u8 link to the array
                            m3u8Links.push({
                                name: link.name,
                                url: m3u8Link
                            });
                        }
                    });
            });

            populateDropdown(m3u8Links);
        }
    });
});
