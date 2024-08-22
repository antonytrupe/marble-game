"use client"
export const respondToVisibility = (element: HTMLElement | null, callback: any) => {
    // console.log('element',element)
    var options = {
        root: null,
    };

    var observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            callback(entry.intersectionRatio > 0)
        });
    }, options)
    if (!!element) {
        observer.observe(element)
    }
};
