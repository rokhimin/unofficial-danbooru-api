document.addEventListener('DOMContentLoaded', function() {
    const output = document.body;
    
    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Get the id parameter from URL
    const id = getUrlParameter('id');
    
    if (!id) {
        output.innerHTML = 'Error: No ID parameter provided. Please use format: index.html?id=12345';
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
            // Format JSON with indentation for better readability
            const formattedJson = JSON.stringify(data, null, 2);
            output.innerHTML = formattedJson;
        })
        .catch(error => {
            output.innerHTML = `Error fetching data: ${error.message}`;
        });
});