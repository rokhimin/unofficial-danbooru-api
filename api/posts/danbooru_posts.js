document.addEventListener('DOMContentLoaded', function() {
    const output = document.body;
    
    // Function to get URL parameters
    function getUrlParameter(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }
    
    // Get the 'id' parameter from URL
    const id = getUrlParameter('id');
    
    if (!id) {
        output.innerText = JSON.stringify({ error: "No ID parameter provided. Use ?id=12345" }, null, 2);
        return;
    }
    
    // Fetch data from Danbooru API
    fetch(`https://danbooru.donmai.us/posts/${id}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Format JSON as plain text (important for API response)
            output.innerText = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            output.innerText = JSON.stringify({ error: error.message }, null, 2);
        });
});