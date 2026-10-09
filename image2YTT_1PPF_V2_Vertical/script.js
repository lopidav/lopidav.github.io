document.getElementById('submitBtn').addEventListener('click', () => {
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    let height = parseInt(document.getElementById('height').value, 10) || 24;
    let width = parseInt(document.getElementById('width').value, 10) || 225;
    
    // Get the new quantization value
    const quantLevels = parseInt(document.getElementById('quantization').value, 10) || 256;
    
    const fileInput = document.getElementById('imageUpload');

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please upload an image first.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
			const imageAspect = (img.width*5.5)/img.height;
			const targetAspect = width/height;
			let targetWidth = width;
			let targetHeight = height;
			if (imageAspect > targetAspect) {
				targetHeight = Math.round(width / imageAspect);
			} else {
				targetWidth = Math.round(height * imageAspect);
			}
				console.log(imageAspect, targetAspect, width, height, img.width, img.height);

            canvas.width = width;
            canvas.height = height;

            ctx.translate(width / 2, height / 2);
            // ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

            const imageData = ctx.getImageData(0, 0, width, height);
            const pixelArray = Array.from(imageData.data);

            // --- QUANTIZATION LOGIC ---
            // Only apply if the user selects fewer than 256 colors per channel
            if (quantLevels > 1 && quantLevels < 256) {
                // Calculate the size of each "step" in the 0-255 range
                const step = 255 / (quantLevels - 1);
                
                for (let i = 0; i < pixelArray.length; i += 4) {
                    // Snap the Red, Green, and Blue values to the nearest step
                    pixelArray[i] = Math.round(Math.round(pixelArray[i] / step) * step);         // Red
                    pixelArray[i + 1] = Math.round(Math.round(pixelArray[i + 1] / step) * step); // Green
                    pixelArray[i + 2] = Math.round(Math.round(pixelArray[i + 2] / step) * step); // Blue // Green
                    // pixelArray[i + 3] = Math.round(Math.round(pixelArray[i + 3] / step) * step);
                    // Alpha (pixelArray[i + 3]) is left untouched to preserve transparency
                }
            }
			// 1. Convert your standard array back into an 8-bit clamped array
            const clampedArray = new Uint8ClampedArray(pixelArray);
            
            // 2. Create a new ImageData object with your new pixels and dimensions
            const newImageData = new ImageData(clampedArray, width, height);
            
            // 3. Paint the new image data back onto the canvas at coordinates (0, 0)
            ctx.putImageData(newImageData, 0, 0);
            // -----------------------------
            // The array passed here is now mathematically quantized
            customFileGenerator(pixelArray, start, end, width, height);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

/**
 * Placeholder method to handle your custom logic and trigger a download.
 */
function customFileGenerator(pixelArray, start, end, width, height) {
	let colors = new Set();
	let pixelArrayProccessed = new Array(height).fill(0).map(_=>[]);
    for (let i = 0; i < pixelArray.length; i += 4) {
        const r = pixelArray[i];
        const g = pixelArray[i + 1];
        const b = pixelArray[i + 2];
        const a = pixelArray[i + 3];
		const hex = rgbaToHex(r,g,b,a);
        colors.add(hex);
		pixelArrayProccessed[Math.floor(i/width/4)][(i/4)%width] = hex;
    }


    let fileContent =
`<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<timedtext format="3">
<head>
<ws id="0" wfo="0"/>
<wp id="0" ap="4" ah="50" av="50"/>
<pen id="0" fs="6" sz="75" bo="0" fo="0" of="2"/>
<pen id="1" p="0" bo="254"/>
`;
	let colorToId = {};
	[...colors].forEach((element, i) => {
		colorToId[element] = 2+i;
		fileContent += `<pen id="${2+i}" p="1" bc="${element}"/>`;
	});
	fileContent += `</head>
<body>
<p t="0" d="10" p="0">Subtitles made with a tool by lopidav</p>
<p t="${start}" d="${end}" p="0" ws="0" wp="0">`
    for (let i = 0; i < pixelArrayProccessed.length; i++) {
		fileContent += `
`;
		for (let j = 0; j < pixelArrayProccessed[i].length; j++) {
			// if (j > 0 && pixelArrayProccessed[i][j] != pixelArrayProccessed[i][j-1])
			// 	fileContent += `</s>`;
			if (j == 0 ||  pixelArrayProccessed[i][j] != pixelArrayProccessed[i][j-1])
				fileContent += `<s p="${colorToId[pixelArrayProccessed[i][j]]}">`;
			fileContent += ` `;
		}
		fileContent += `</s>`
    }
	fileContent += `
​</p>
</body>
</timedtext>`

    const blob = new Blob([fileContent], { type: 'text/plain;charset=UTF-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = 'imageToYTT_1PPF_V2.ytt';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function rgbaToHex(r, g, b, a = 255) { // Default alpha is now 255
    const toHex = (value) => {
        const hex = Math.round(value).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    const hexR = toHex(r);
    const hexG = toHex(g);
    const hexB = toHex(b);
    
    // No longer multiplying by 255, just converting directly
    const hexA = toHex(a); 

    if (a === 255) {
        return `#${hexR}${hexG}${hexB}`.toUpperCase();
    }
    
    return `#${hexR}${hexG}${hexB}${hexA}`.toUpperCase();
}