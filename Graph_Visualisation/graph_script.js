// Load JSON data 
d3.json("data.json").then(data => {
    const width = 1400;
    const height = 1600;

// Initialise the SVG canvas with specified attributes and responsive styling
    const svg = d3.select("#interactive-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

// Define color scales for normal and highlight states based on predefined categories
    const color = d3.scaleOrdinal()
        .domain(["stigma", "self-stigma", "public-stigma", "support", "education"])
        .range(["#f10688", "#f4acc4", "#bc69f8", "#4272f7", "#45b9e7"]);

    const highlightColor = d3.scaleOrdinal()
        .domain(["stigma", "self-stigma", "public-stigma", "support", "education"])
        .range(["#ffd5e2", "#ff79b0", "#e4b3ff", "#7fa3ff", "#87dcff"]);

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => {
            if (d.type === "main") return 120;  // Central node size
            if (d.type === "theme") return 80; // Intermediate node size
            return 30;  // Leaf node size
        })
        .attr("fill", d => color(d.group))
        .call(drag(simulation))
        .on("click", showDetails)
        .on("mouseover", highlight)
        .on("mouseout", unhighlight);

    node.append("title")
        .text(d => d.type === "theme" ? d.label : d.content);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x = Math.max(30, Math.min(width - 30, d.x)))
            .attr("cy", d => d.y = Math.max(30, Math.min(height - 30, d.y)));
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = Math.max(30, Math.min(width - 30, event.x));
            event.subject.fy = Math.max(30, Math.min(height - 30, event.y));
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    function showDetails(event, d) {
        d3.select("#text").html("");

        if (d.type === "main") {
            d3.select("#text").html("<h3>Stigma</h3><p>From the Latin word 'stigma' meaning a mark or brand, and has roots in the Greek word 'stizein' meaning to tattoo. Historically, it referred to a mark branded on slaves or criminals. In botanical terms, stigma refers to the part of a flower that receives pollen. Currently, stigma describes a societal mark of disgrace associated with a particular circumstance, quality, or person.</p>");
        } else if (d.type === "theme") {
            const themeTexts = {
                "self-stigma": "<h3>Self-Stigma</h3><p>Self-stigma occurs when individuals internalise negative stereotypes and attitudes about their condition, leading to feelings of shame and decreased self-esteem. This can significantly affect their mental health and willingness to seek help.</p>",
                "public-stigma": "<h3>Public Stigma</h3><p>Public stigma refers to the negative attitudes and beliefs held by the general population towards individuals with a particular condition. It can result in discrimination, social exclusion, and can impact various aspects of life such as employment and social relationships.</p>",
                "support": "<h3>Support</h3><p>Support involves providing emotional, social, and practical assistance to individuals, helping them cope with their circumstances. This can include support from family, friends, and professional services.</p>",
                "education": "<h3>Education</h3><p>Education is a critical tool in combating stigma. By raising awareness and understanding about a condition, education can challenge stereotypes, change public perceptions, and promote inclusion and acceptance.</p>"
            };
            d3.select("#text").html(themeTexts[d.group]);
        } else if (d.type === "quote") {
            d3.select("#text").text(d.content);
        }
    }

    function highlight(event, d) {
        node
            .attr("fill", n => (n.id === d.id || isConnected(n, d) ? highlightColor(n.group) : color(n.group)));

        link
            .attr("stroke", l => (l.source.id === d.id || l.target.id === d.id ? highlightColor(l.source.group) : "#999"))
            .attr("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.6));
    }

    function unhighlight() {
        node
            .attr("fill", d => color(d.group));

        link
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);
    }

    function isConnected(a, b) {
        return data.links.some(link => (link.source.id === a.id && link.target.id === b.id) || (link.source.id === b.id && link.target.id === a.id));
    }

    d3.selectAll(".legend-item")
        .on("click", function(event) {
            const groupIndex = parseInt(d3.select(this).attr("data-group"));
            const groupLabel = getGroupLabel(groupIndex);
            console.log(`Legend item clicked: ${groupLabel} (${groupIndex})`); // Debugging statement

            if (groupLabel === "stigma") {
                showStigmaText();
            } else {
                showLegendDetails(groupIndex, groupLabel);
            }
        })
        .on("mouseover", function(event) {
            const groupIndex = parseInt(d3.select(this).attr("data-group"));
            highlightLegend(groupIndex);
        })
        .on("mouseout", function() {
            unhighlight();
        });

    function getGroupLabel(groupIndex) {
        const groupLabels = ["stigma", "self-stigma", "public-stigma", "support", "education"];
        return groupLabels[groupIndex];
    }

    function showLegendDetails(groupIndex, groupLabel) {
        const themeTexts = {
            "self-stigma": "<h3>Self-Stigma</h3><p>Self-stigma occurs when individuals internalize negative stereotypes and attitudes about their condition, leading to feelings of shame and decreased self-esteem.</p>",
            "public-stigma": "<h3>Public Stigma</h3><p>Public stigma refers to the negative attitudes and beliefs held by the general population towards individuals with a particular condition, leading to discrimination and social exclusion.</p>",
            "support": "<h3>Support</h3><p>Support involves providing emotional, social, and practical assistance to individuals, helping them cope with their circumstances.</p>",
            "education": "<h3>Education</h3><p>Education is a critical tool in combating stigma, raising awareness and understanding to challenge stereotypes and promote inclusion.</p>"
        };
        d3.select("#text").html(themeTexts[groupLabel]);
    }

    function highlightLegend(groupIndex) {
        node
            .attr("fill", n => (n.group === groupIndex ? highlightColor(n.group) : color(n.group)));

        link
            .attr("stroke", l => (l.source.group === groupIndex || l.target.group === groupIndex ? highlightColor(groupIndex) : "#999"))
            .attr("stroke-opacity", l => (l.source.group === groupIndex || l.target.group === groupIndex ? 1 : 0.6));
    }

    function showStigmaText() {
        d3.select("#text").html("<h3>Stigma</h3><p>From the Latin word 'stigma' meaning a mark or brand, and has roots in the Greek word 'stizein' meaning to tattoo. Historically, it referred to a mark branded on slaves or criminals. In botanical terms, stigma refers to the part of a flower that receives pollen. Currently, stigma describes a societal mark of disgrace associated with a particular circumstance, quality, or person.</p>");
    }

    node.on("click", showDetails);
});
