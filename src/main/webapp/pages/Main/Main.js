// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'],
    pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.8,
    canvas,
    ctx;


Prefab.onPropertyChange = function(key, newVal, oldVal) {
    Prefab.loadPdfViewer();
};

Prefab.onReady = function() {
    Prefab.loadPdfViewer();
};

Prefab.loadPdfViewer = function() {
    canvas = document.getElementById('the-canvas');
    ctx = canvas.getContext('2d');
    Prefab.Widgets.PrevNextButtongroup.setWidgetProperty('show', false);

    let url = Prefab.pdfviewerurl;
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        renderPage(pageNum);
        Prefab.Widgets.PrevNextButtongroup.setWidgetProperty('show', true);
    }).catch((err) => {
        console.log(err, 'Please enter a valid pdf url with same origin', url);
    });
}

Prefab.prevButtonClick = function($event, widget) {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);

};

Prefab.nextButtonClick = function($event, widget) {
    if (pageNum >= (pdfDoc && pdfDoc.numPages)) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
};

function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc && pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({
            scale: scale
        });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}
