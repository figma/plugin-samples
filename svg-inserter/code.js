const icons = {
    menu: '<svg width="$size$" height="$size$" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="$color$"/></svg>',
    settings: '<svg width="$size$" height="$size$" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.9359C19.176 12.6359 19.2 12.3239 19.2 11.9999C19.2 11.6759 19.176 11.3639 19.128 11.0639L21.156 9.4799C21.336 9.3359 21.384 9.0719 21.276 8.8679L19.356 5.5439C19.236 5.3279 18.984 5.2559 18.768 5.3279L16.38 6.2879C15.876 5.9039 15.348 5.5919 14.76 5.3519L14.4 2.8079C14.364 2.5679 14.16 2.3999 13.92 2.3999H10.08C9.83998 2.3999 9.64799 2.5679 9.61199 2.8079L9.25199 5.3519C8.66399 5.5919 8.12399 5.9159 7.63199 6.2879L5.24398 5.3279C5.02798 5.2439 4.77598 5.3279 4.65598 5.5439L2.73598 8.8679C2.61598 9.0839 2.66398 9.3359 2.85598 9.4799L4.88398 11.0639C4.83598 11.3639 4.79998 11.6879 4.79998 11.9999C4.79998 12.3119 4.82398 12.6359 4.87198 12.9359L2.84398 14.5199C2.66398 14.6639 2.61598 14.9279 2.72398 15.1319L4.64398 18.4559C4.76398 18.6719 5.01598 18.7439 5.23198 18.6719L7.61998 17.7119C8.12398 18.0959 8.65198 18.4079 9.23998 18.6479L9.59999 21.1919C9.64799 21.4319 9.83998 21.5999 10.08 21.5999H13.92C14.16 21.5999 14.364 21.4319 14.388 21.1919L14.748 18.6479C15.336 18.4079 15.876 18.0839 16.368 17.7119L18.756 18.6719C18.972 18.7559 19.224 18.6719 19.344 18.4559L21.264 15.1319C21.384 14.9159 21.336 14.6639 21.144 14.5199L19.14 12.9359V12.9359ZM12 15.5999C10.02 15.5999 8.39998 13.9799 8.39998 11.9999C8.39998 10.0199 10.02 8.3999 12 8.3999C13.98 8.3999 15.6 10.0199 15.6 11.9999C15.6 13.9799 13.98 15.5999 12 15.5999Z" fill="$color$"/></svg>'
};
figma.parameters.on('input', (parameters, currentKey, result) => {
    const query = parameters[currentKey];
    switch (currentKey) {
        case 'icon-name':
            const widthSizes = ['menu', 'settings'];
            result.setSuggestions(widthSizes.filter(s => s.includes(query)));
            break;
        case 'size':
            const sizes = ['24', '48', '96', '192'];
            result.setSuggestions(sizes.filter(s => s.includes(query)));
            break;
        case 'color':
            const colors = ['black', 'blue', 'red', 'green'];
            result.setSuggestions(colors.filter(s => s.includes(query)));
            break;
        default:
            return;
    }
});
figma.on('run', ({ parameters }) => {
    if (parameters) {
        startPluginWithParameters(parameters);
    }
    else {
        startPluginWithUI();
    }
});
// Start the plugin in regular mode
function startPluginWithUI() {
    figma.showUI(__html__);
}
;
// Start the plugin with parameters
function startPluginWithParameters(parameters) {
    var _a;
    const icon = parameters['icon-name'];
    const size = parameters['size'];
    // Color is an optional parameter, so it is possibly undefined.
    const color = (_a = parameters['color']) !== null && _a !== void 0 ? _a : 'black';
    const svg = icons[icon];
    const processedSvg = svg.replace(/\$size\$/g, size).replace(/\$color\$/g, color);
    figma.createNodeFromSvg(processedSvg);
    figma.closePlugin();
}
;
