
let gl = undefined;
let angle;
let ms;
let axes, sphere, tetra;
let tScale;
let sMove, sRange;

function init() {
    let canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) { alert("Your Web browser doesn't support WebGL 2\nPlease contact Dave"); }
    // Add initialization code here
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.enable(gl.DEPTH_TEST);
    sRange = 0.5;
    sSpeed = 0.003;
    sMove = 0.003;
    tScale = 0.0;
    angle = 0.0;
    axes = new Axes(gl);
    sphere = new Sphere(gl, 36, 18);
    tetra = new Tetrahedron(gl);
    ms = new MatrixStack();
    render();
}

function render() {
    // Add rendering code here
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    angle += 3.0;
    angle %= 360.0;
    tScale += 0.001;
    sMove += sSpeed; 
    if (tScale > 0.5) { 
        tScale = 0;
    }
    if (sMove > sRange || sMove < -sRange) {
        sSpeed *= -1; 
    }

    ms.push();
    ms.translate(0.5, -0.6, 0);
    ms.rotate(angle, [1, 1, 0]);
    ms.scale(0.4, 0.4, 0.4);
    axes.MV = ms.current();
    axes.draw();
    ms.pop();

    ms.push();
    ms.translate(sMove, sMove, 0);
    ms.scale(0.2, 0.2, 0.2);
    sphere.MV = ms.current();
    sphere.draw();
    ms.pop();

    ms.push();
    ms.translate(-0.6, 0.5, 0);
    ms.rotate(angle, [1, 1, 0]);
    ms.scale(tScale, tScale, tScale);
    tetra.MV = ms.current();
    tetra.draw();
    ms.pop();

    requestAnimationFrame(render);
}

window.onload = init;

