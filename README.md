# pdf-downloader

Click generate PDF button to download the pdf conaining the map.

<h6>Method 1: Use jspdf library</h6>
<p>JsPDF library uses html2canvas internal, and the html2canvas need to fetch the image from the server. 
However there is cross origin issue when fetching the map images from the server. The server storing the map images seems to be cloudfront from AWS. In order to solve this issue, may be some configuration of the server needs to be changed.</p>

<h6>Method 2: Use window.print()</h6>
<p>When user clicks the "generate PDF" button, a new page will load with the map image and open the print window automatically, which let the user to save the pdf. </p>
