function getById(id) {
    return document.getElementById(id)
}

// Creates a new image and sets its src property, then waits for it to load
function imageWithLoadedSrc(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Error loading image ${src}`);
        img.src = src;
    })
}

// Inlines all the styles of an element and its children (used for SVG because the style is coming from CSS)
function inlineStyles(element) {
    const computedStyle = getComputedStyle(element);
    let style = '';
    for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        style += `${prop}: ${computedStyle.getPropertyValue(prop)}; `;
    }
    element.setAttribute('style', style);

    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        inlineStyles(children[i]);
    }
}

// Returns a serialized SVG with all the styles inlined
function getSvgString(svg) {
    inlineStyles(svg);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
}

async function draw() {
    const canvas = getById('canvas-image');
    const ctx = canvas.getContext('2d');
    const imagePreview = getById('portrait-image');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const image = await imageWithLoadedSrc(imagePreview.src)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
 
    const svgStr = getSvgString(getById('overlay-svg'));

    const svgImage = await imageWithLoadedSrc('data:image/svg+xml;base64,' + btoa(svgStr))
    ctx.drawImage(svgImage, 0, 0, canvas.width, canvas.height);
}

async function download() {
    await draw();
    const canvas = getById('canvas-image');
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'linkedin-profile.png';
    link.click();
}

getById('portrait-image-upload').addEventListener('change', function(event) {
    const reader = new FileReader()
    reader.onload = function(e) {
        getById('portrait-image').src = e.target.result
    }
    reader.readAsDataURL(event.target.files[0])
})

getById('badge-text-input').addEventListener('input', () => {
    getById('overlay-text-path').innerHTML = getById('badge-text-input').value;
});

getById('badge-bg-color-input').addEventListener('input', () => {
    const badgeColor = getById('badge-bg-color-input').value;
    getById('left-bottom-stop').style.stopColor = badgeColor;
});

getById('badge-text-color-input').addEventListener('input', () => {
    const badgeTextColor = getById('badge-text-color-input').value;
    getById('overlay-text-path').style.fill = badgeTextColor;
});

getById('download-button').addEventListener('click', () => {
    download();
})
