/////////////////////////////////////////////////////////////////////////////
//
//  ExperimentalCube.js
//
//  A cube defined ???
//

class ExperimentalCube {
    constructor(gl, vertexShader, fragmentShader) {
        vertexShader = `
            in vec4 aPosition;
            in vec4 aColor;

            uniform mat4 P;
            uniform mat4 MV;

            out vec4 vColor;

            void main() {
                gl_Position = P * MV * aPosition;
                vColor = aColor;
            }
        `;
        fragmentShader ||= `
        in vec4 vColor;
        out vec4 fColor;

        void main() {
            const vec4 backColor = vec4(0,0,0,1);
            fColor = gl_FrontFacing ? vColor : backColor;
            //fColor = vColor;
        }
        `;

        let program = new ShaderProgram(gl, this, vertexShader, fragmentShader);

        const positions = new Float32Array([
            -0.5, -0.5, -0.5,  
             0.5, -0.5, -0.5,  
            -0.5, -0.5,  0.5,  
             0.5, -0.5,  0.5,  
            -0.5,  0.5, -0.5,  
             0.5,  0.5, -0.5,  
            -0.5,  0.5,  0.5,  
             0.5,  0.5,  0.5   
        ]);

        const colors = new Float32Array([
            1.0, 0.0, 0.0, 1.0,   

            0.0, 1.0, 0.0, 1.0,   

            0.0, 0.0, 1.0, 1.0,  

            1.0, 1.0, 0.0, 1.0,   

            0.0, 1.0, 1.0, 1.0,  

            1.0, 0.0, 1.0, 1.0,

            1.0, 0.5, 0.0, 1.0,

            0.5, 0.0, 0.5, 1.0
        ]);
        const indices1 = new Uint8Array([   
            6,7,4,5,1,7,3,6,2,4,0,1,2,3 
           //0,1,2,3,6,7,4,5,7,3,5,1,4,0,6,2
            //0,1,2,3,6,7,4,5
        ]);
        /*const indices2 = new Uint8Array([                     
            2,6,0,4,1,5,3,7
        ]);*/

        this.P = mat4();
        this.MV = mat4();

        this.indices1 = new Indices(gl, indices1);
        //this.indices2 = new Indices(gl, indices2);
        let aPosition = new Attribute(gl, program, "aPosition", positions, 3, gl.FLOAT);
        let aColor = new Attribute(gl, program, "aColor", colors, 4, gl.FLOAT);


        this.draw = () => {
            //this.MV = translate(-0.5, -0.5, -0.5);
            program.use();
            aPosition.enable();
            aColor.enable();

            this.indices1.enable();
            gl.drawElements(gl.TRIANGLE_STRIP, this.indices1.count, this.indices1.type, 0);
            this.indices1.disable();

           // this.indices2.enable();
            //gl.drawElements(gl.TRIANGLE_STRIP, this.indices2.count, this.indices2.type, 0);
           // this.indices2.disable();

            aPosition.disable();
            aColor.disable();
        };
    }
};
