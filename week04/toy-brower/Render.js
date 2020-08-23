// 绘制dom
const images = require('images');

function Render(viewport, element) {
    if (element.style) {
        const { width, height, top, left } = element.style;
        let img = images(width, height);
        console.log(element.style)
        if (element.style['background']) {
            let color = element.style['background'] || 'rgb(255,255,255)';
            color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
            viewport.draw(img, left || 0, top || 0);
        }
    }

    if (element.children) {
        for (let child of element.children) {
            Render(viewport, child);
        }
    }
}

module.exports = Render;