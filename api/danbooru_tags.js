// Execute immediately when loaded
(async function() {
    // 1. Get parameters from query string
    const urlParams = new URLSearchParams(window.location.search);
    const tags = urlParams.get("tags") || ""; 
    const page = urlParams.get("page") || "1";
    
    // Optional callback parameter for JSONP support
    const callback = urlParams.get("callback");
    
    // 2. Define the proxies to try
    const proxies = [
        "https://api.allorigins.win/raw?url=",
        "https://corsproxy.io/?",
        "https://cors-anywhere.herokuapp.com/"
    ];
    
    // 3. Function to try fetching with different proxies
    async function fetchWithProxies() {
        // Build the Danbooru URL with tags and page parameters
        const feedUrl = `https://danbooru.donmai.us/posts.atom?tags=${encodeURIComponent(tags)}&page=${page}`;
        
        // Try each proxy in order
        for (const proxy of proxies) {
            try {
                const fullUrl = proxy + encodeURIComponent(feedUrl);
                
                const response = await fetch(fullUrl);
                if (!response.ok) {
                    continue; // Try next proxy if this one fails
                }
                
                const data = await response.text();
                return processData(data);
            } catch (error) {
                console.error(`Error with proxy ${proxy}:`, error);
                // Continue to next proxy
            }
        }
        
        // If all proxies fail
        throw new Error("All proxies failed to fetch data");
    }

    // Function to extract artist name from title
    function extractArtist(title) {
        // Match pattern "drawn by <artist_name>" or "by <artist_name>"
        const artistRegex = /(?:drawn by|by)\s+([^\s(][^(]*)(?:\s*\(|$)/i;
        const match = title.match(artistRegex);
        
        if (match && match[1]) {
            return match[1].trim();
        }
        
        // Alternative pattern for cases without "drawn by"
        const altRegex = /\s+by\s+([^\s(][^(]*)(?:\s*\(|$)/i;
        const altMatch = title.match(altRegex);
        
        if (altMatch && altMatch[1]) {
            return altMatch[1].trim();
        }
        
        return "";
    }
    
    // Function to convert sample image URL to original image URL
    function getOriginalImage(sampleImageUrl) {
        if (!sampleImageUrl) return "";
        
        try {
            // Replace "sample" directory with "original" directory
            let originalUrl = sampleImageUrl.replace('/sample/', '/original/');
            
            // Remove "sample-" prefix from the filename
            originalUrl = originalUrl.replace('__sample-', '__');
            
            // If the URL doesn't match the expected Danbooru format, return empty
            if (!originalUrl.includes('/original/')) {
                return "";
            }
            
            return originalUrl;
        } catch (error) {
            console.error("Error converting to original image URL:", error);
            return "";
        }
    }
    
    // 4. Function to process the XML data and convert to JSON
    function processData(xmlData) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlData, "application/xml");
        
        // Debug: Check if the XML is parsed correctly
        if (xml.querySelector("parsererror")) {
            return { error: "Failed to parse XML feed" };
        }
        
        const entries = xml.querySelectorAll("entry");
        
        if (entries.length === 0) {
            return { 
                error: "No entries found for the specified tags and page",
                params: { tags, page }
            };
        }
        
        // Extract pagination info
        let nextPageLink = null;
        let prevPageLink = null;
        
        const links = xml.querySelectorAll("link");
        links.forEach(link => {
            const rel = link.getAttribute("rel");
            if (rel === "next") {
                nextPageLink = link.getAttribute("href");
            } else if (rel === "previous") {
                prevPageLink = link.getAttribute("href");
            }
        });
        
        // Extract next and previous page numbers
        let nextPage = null;
        let prevPage = null;
        
        if (nextPageLink) {
            const nextPageParams = new URLSearchParams(nextPageLink.split("?")[1]);
            nextPage = nextPageParams.get("page");
        }
        
        if (prevPageLink) {
            const prevPageParams = new URLSearchParams(prevPageLink.split("?")[1]);
            prevPage = prevPageParams.get("page");
        }
        
        const result = {
            tag: tags,
            page: parseInt(page),
            count: entries.length,
            pagination: {
                current_page: parseInt(page),
                next_page: nextPage ? parseInt(nextPage) : null,
                prev_page: prevPage ? parseInt(prevPage) : null,
                has_next_page: !!nextPage,
                has_prev_page: !!prevPage
            },
            posts: []
        };
        
        entries.forEach((entry, index) => {
            try {
                // Get the title
                const titleElement = entry.querySelector("title");
                const title = titleElement ? titleElement.textContent.trim() : `Post ${index + 1}`;
                
                // Clean up title (remove "Tags:" part if it exists)
                let cleanTitle = title;
                const tagsPosition = title.indexOf("Tags:");
                if (tagsPosition > 0) {
                    cleanTitle = title.substring(0, tagsPosition).trim();
                }
                
                // Extract artist from title
                const artist = extractArtist(cleanTitle);
                
                // Get the link/URL
                const linkElement = entry.querySelector("link");
                const link = linkElement ? linkElement.getAttribute("href") : "";
                
                // Get published date
                const publishedElement = entry.querySelector("published");
                const published = publishedElement ? publishedElement.textContent.trim() : "";
                
                // Get updated date
                const updatedElement = entry.querySelector("updated");
                const updated = updatedElement ? updatedElement.textContent.trim() : "";
                
                // Get content - IMPORTANT: Get raw XML content
                const contentElement = entry.querySelector("content");
                // Use innerHTML or textContent based on what's available
                const content = contentElement ? (contentElement.innerHTML || contentElement.textContent).trim() : "";
                
                // Extract post ID from link
                const postId = link.split("/").pop() || `unknown-${index}`;
                
                // Extract image URL from content with improved extraction
                let imgSrc = "";
                
                if (content) {
                    // Method 1: Try creating a temporary div and setting innerHTML to extract image
                    try {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = content;
                        const imgElement = tempDiv.querySelector('img');
                        if (imgElement && imgElement.src) {
                            imgSrc = imgElement.src;
                        } else if (imgElement && imgElement.getAttribute('src')) {
                            imgSrc = imgElement.getAttribute('src');
                        }
                    } catch (error) {
                        console.error("Error with temp div extraction:", error);
                    }
                    
                    // Second attempt: regex for src attribute
                    if (!imgSrc) {
                        const srcRegex = /src=["']([^"']+)["']/i;
                        const srcMatch = content.match(srcRegex);
                        if (srcMatch && srcMatch[1]) {
                            imgSrc = srcMatch[1];
                        }
                    }
                    
                    // Third attempt: regex for any image URL
                    if (!imgSrc) {
                        const urlRegex = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif))/i;
                        const match = content.match(urlRegex);
                        if (match) {
                            imgSrc = match[0];
                        }
                    }
                }
                
                // Create sample_image URL from image_url using regex
                let sampleImage = "";
                if (imgSrc) {
                    try {
                        // Extract file paths like /75/6f/ from URLs like https://cdn.donmai.us/180x180/75/6f/756fd1f20f5f7bfcc332191092fe6ba8.jpg
                        const pathMatch = imgSrc.match(/\/(\w{2})\/(\w{2})\//) || [];
                        
                        // Extract filename like 756fd1f20f5f7bfcc332191092fe6ba8.jpg
                        const filenameMatch = imgSrc.match(/\/([^\/]+)\.(?:jpg|jpeg|png|gif)$/i) || [];
                        const filename = filenameMatch[1] || "";
                        
                        // Convert title to underscore format
                        const titleForFilename = cleanTitle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                        
                        if (pathMatch[1] && pathMatch[2] && filename) {
                            sampleImage = `https://cdn.donmai.us/sample/${pathMatch[1]}/${pathMatch[2]}/__${titleForFilename}__sample-${filename}.jpg`;
                        }
                    } catch (error) {
                        console.error("Error creating sample image URL:", error);
                    }
                }
                
                // Convert sample image URL to original image URL
                const originalImage = getOriginalImage(sampleImage);
                
                // Extract tags
                let tagsList = [];
                
                // Method 1: Look for Tags: pattern in title
                const tagMatch = title.match(/Tags: (.+)$/);
                if (tagMatch && tagMatch[1]) {
                    tagsList = tagMatch[1].split(" ").filter(tag => tag.trim() !== "");
                }
                
                // Method 2: Look for category elements
                if (tagsList.length === 0) {
                    const categories = entry.querySelectorAll("category");
                    categories.forEach(category => {
                        const term = category.getAttribute("term");
                        if (term) {
                            tagsList.push(term);
                        }
                    });
                }
                
                // If we still don't have tags but we have the search tag, include that
                if (tagsList.length === 0 && tags) {
                    tagsList = tags.split(" ");
                }
                
                // Create the post object
                const post = {
                    id: postId,
                    title: cleanTitle,
                    artist: artist,
                    image_url: imgSrc,
                    sample_image: sampleImage,
                    original_image: originalImage, 
                    page_url: link,
                    published: published,
                    updated: updated || published, 
                    tags: tagsList
                };
                
                result.posts.push(post);
            } catch (error) {
                console.error(`Error processing entry ${index}:`, error);
                // Add a basic entry if we encounter an error
                result.posts.push({
                    id: `error-${index}`,
                    title: `Error processing entry ${index}`,
                    artist: "",
                    image_url: "",
                    sample_image: "",
                    original_image: "",
                    page_url: "",
                    published: "",
                    updated: "",
                    tags: [],
                    error: error.message
                });
            }
        });
        
        return result;
    }
    
    // 5. Execute the fetch and display results
    try {
        const result = await fetchWithProxies();
        
        // Add timestamp to help track cache status
        result.timestamp = new Date().toISOString();
        
        // Convert result to JSON string
        const jsonData = JSON.stringify(result);
        
        // Clear the HTML body
        document.body.innerHTML = "";
        
        // Handle JSONP if callback is provided
        if (callback) {
            document.write(`${callback}(${jsonData})`);
        } else {
            // Set content type in the document if possible
            document.contentType = "application/json";
            
            // Output the JSON directly
            document.write(jsonData);
        }
    } catch (error) {
        const errorResponse = {
            error: "Failed to fetch data from Danbooru",
            message: error.message,
            params: { tags, page },
            timestamp: new Date().toISOString()
        };
        
        // Convert error to JSON string
        const jsonError = JSON.stringify(errorResponse);
        
        // Clear the HTML body
        document.body.innerHTML = "";
        
        // Handle JSONP for errors too
        if (callback) {
            document.write(`${callback}(${jsonError})`);
        } else {
            // Set content type in the document if possible
            document.contentType = "application/json";
            
            // Output the error JSON directly
            document.write(jsonError);
        }
    }
})();