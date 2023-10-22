document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const convertButton = document.getElementById('convertButton');
    const downloadLink = document.getElementById('downloadLink');

    convertButton.addEventListener('click', async function () {
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);
                downloadLink.href = objectURL;
                downloadLink.download = 'output.docx';
                downloadLink.style.display = 'block';
            } else {
                alert('Conversion failed.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        }
    });
});
