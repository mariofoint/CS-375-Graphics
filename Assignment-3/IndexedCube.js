/////////////////////////////////////////////////////////////////////////////
//
//  IndexedCube.js
//
//  A cube defined of 12 triangles using vertex indices.
//

class IndexedCube {
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
            1.0, 0.0, 0.0, 1.0,   1.0, 0.0, 0.0, 1.0,

            0.0, 1.0, 0.0, 1.0,   0.0, 1.0, 0.0, 1.0,

            0.0, 0.0, 1.0, 1.0,   0.0, 0.0, 1.0, 1.0,

            1.0, 1.0, 0.0, 1.0,   1.0, 1.0, 0.0, 1.0,

            0.0, 1.0, 1.0, 1.0,   0.0, 1.0, 1.0, 1.0,

            1.0, 0.0, 1.0, 1.0,   1.0, 0.0, 1.0, 1.0
        ]);
        const indices = new Uint8Array([                     
            //z
            2,  3,  7,
            2,  7,  6,
        
            //-z
            0,  4,  5,
            0,  5,  1,
        
            //-x
            0,  2,  6,
            0,  6,  4,
        
            //x
            1,  5,  7,
            1,  7,  3,
        
            //y
            4,  6,  7,
            4,  7,  5,
        
            //-y
            0,  1,  3,
            0,  3,  2
        ]);

        this.P = mat4();
        this.MV = mat4();

        this.indices = new Indices(gl, indices);

        let aPosition = new Attribute(gl, program, "aPosition", positions, 3, gl.FLOAT);
        let aColor = new Attribute(gl, program, "aColor", colors, 4, gl.FLOAT);


        this.draw = () => {
            //this.MV = translate(-0.5, -0.5, -0.5);
            program.use();
            aPosition.enable();
            aColor.enable();

            this.indices.enable();
            gl.drawElements(gl.TRIANGLES, this.indices.count, this.indices.type, 0);
            this.indices.disable();

            aPosition.disable();
            aColor.disable();
        };
    }
};
