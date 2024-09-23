// Fetch the JSON data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // SVG container
        const svg = d3.select("#interactive-map");

        // Bind data to elements
        const elements = svg.selectAll(".interactive-element")
            .data(data.images)
            .enter()
            .append("g")
            .attr("class", "interactive-element")
            .attr("transform", d => `translate(${d.x}, ${d.y}) scale(${d.scale})`)
            .on("click", function(event, d) {
                if (d.link) {
                    window.location.href = d.link;
                } else {
                    let id = d.id.toLowerCase();
                    let theme = id.includes("theme"); // true or false

                    if(theme) {
                        let themeName = id.split("-")[1];
                        console.log(id, themeName, d.quote);

                        // Filter quotes or audio JSON with the theme name
                        let themedAudios = data.audios.filter(item => item.themes.includes(themeName));

                        // Display themedAudios
                        showPopup(d, themedAudios);
                    } else {
                        // Display normal audios
                        showPopup(d, data.audios);
                    }
                }
            });

        // Load and append SVG elements
        elements.each(function(d) {
            const element = d3.select(this);
            d3.xml(d.svgFile).then(data => {
                const importedNode = document.importNode(data.documentElement, true);
                d3.select(importedNode).attr("class", "hover-effect-svg"); // Add a class to the imported SVG
                element.node().appendChild(importedNode);
            });
        });

        // Function to show popup
        function showPopup(elementData, allAudios) {
            const popup = document.getElementById("popup");
            const popupContent = document.getElementById("popup-content");

            // Clear previous content
            popupContent.innerHTML = "";

            // Add new content
            popupContent.innerHTML = `<h3>${elementData.name}</h3>`;
            if (elementData.audios) {
                elementData.audios.forEach(audioId => {
                    const audioData = allAudios.find(a => a.id === audioId);
                    if (audioData) {
                        const audioElement = document.createElement("div");
                        audioElement.className = "audio-button";
                        audioElement.innerHTML = `
                            <audio controls src="assets/audios/${audioData.file}"></audio>`;
                        popupContent.appendChild(audioElement);
                    }
                });
            }

            // Show popup
            popup.classList.remove("hidden");
        }

        // Close popup
        document.getElementById("close-popup").addEventListener("click", function() {
            document.getElementById("popup").classList.add("hidden");
        });
    })
    .catch(error => console.error('Error loading JSON data:', error));
