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
                // d3.select(importedNode).attr("class", "hover-effect-svg"); // Add a class to the imported SVG
                element.node().appendChild(importedNode);
            });
        });

        function stopAllAudio() {
            // Get all audio elements on the page
            const audios = document.querySelectorAll('audio');
            
            // Loop through each audio element and pause it
            audios.forEach(audio => {
                if (!audio.paused) {
                    audio.pause();     // Pause the audio
                    audio.currentTime = 0; // Reset the audio to the start (optional)
                }
            });
        }
         // Function to stop other audios when one starts playing
         function pauseOthers(currentAudio) {
            const audios = document.querySelectorAll('audio');
            
            audios.forEach(audio => {
                // Pause the other audios that are not the currently playing one
                if (audio !== currentAudio && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0; // Optional: Reset to start if you want to stop them
                }
            });
        }

        // Function to show popup
        function showPopup(elementData, allAudios) {
            const popup = document.getElementById("popup");
            const popupContent = document.getElementById("popup-content");
            const popupContanier = document.getElementById("popup-contanier");

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

            // Add event listener to all audio elements to stop others when one plays
            document.querySelectorAll('audio').forEach(audio => {
                audio.addEventListener('play', function() {
                    pauseOthers(audio); // Call the function to pause other audios
                });
            });
            // Show popup
            popupContanier.classList.remove("hidden");
            popup.classList.remove("hidden");
            document.body.classList.add("stop-scrolling");
        }

        // Close popup
        document.getElementById("close-popup").addEventListener("click", function() {
            closePopup();
        });
        document.getElementById("popup-contanier").addEventListener("click", function() {
            closePopup();
        });

        function closePopup() {
            document.getElementById("popup-contanier").classList.add("hidden");
            document.getElementById("popup").classList.add("hidden");
            document.body.classList.remove("stop-scrolling");
            stopAllAudio();
        }

       

    })
    .catch(error => console.error('Error loading JSON data:', error));
